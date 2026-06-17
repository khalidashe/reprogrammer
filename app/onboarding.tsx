import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  PRESSED_OPACITY,
  controlSelected,
} from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressDots } from '@/components/create/steps';
import useStore from '@/store/useStore';
import type { Behavior } from '@/types';
import {
  scheduleForBehavior,
  requestNotificationPermission,
  sendOnboardingPing,
} from '@/services/notifications';
import { featuredTemplates, type AdoptTemplate } from '@/services/library-content';
import { buildBehavior, draftFromAdoptTemplate } from '@/services/behavior-factory';
import { GROUND_RULES } from '@/services/ground-rules';
import { haptics } from '@/services/haptics';

/**
 * First-run experience (REP-39). A short, calm wizard that *teaches the model*
 * (Adopt/Eliminate → ping → check-in → streak → level), primes notifications
 * with a reason before the OS prompt, seeds a first behavior, and lets the user
 * feel one ping before landing on the dashboard.
 *
 * Steps: welcome (hero) → model → rules → notifications → pick → demo → logging.
 * The test ping ("demo") and the logging-options explainer share the final
 * progress dot, so the bar stays a stable five.
 */
type Step =
  | 'welcome'
  | 'model'
  | 'rules'
  | 'notifications'
  | 'pick'
  | 'demo'
  | 'logging';

const STEP_DOT: Partial<Record<Step, number>> = {
  model: 0,
  rules: 1,
  notifications: 2,
  pick: 3,
  demo: 4,
  logging: 4,
};
const TOTAL_DOTS = 5;

/** Sensible default quiet window; fully editable later in Settings. */
const DEFAULT_QUIET_HOURS = { from: '22:00', to: '08:00' };

const templates = featuredTemplates();

const KIND_ROWS = [
  {
    icon: 'checkmark' as const,
    label: 'Adopt',
    text: 'Build a good behavior until it runs on its own.',
  },
  {
    icon: 'minus.circle' as const,
    label: 'Eliminate',
    text: 'Catch an automatic bad one in the act.',
  },
];

const LOOP_ROWS = [
  {
    icon: 'bell.fill' as const,
    label: 'A gentle ping',
    text: 'arrives at random times inside the window you choose.',
  },
  {
    icon: 'checkmark' as const,
    label: 'You respond',
    text: 'check in if you did it, or snooze it for later.',
  },
  {
    icon: 'flame.fill' as const,
    label: 'A streak grows',
    text: 'each time you show up — a missed day is data, not failure.',
  },
  {
    icon: 'sparkles' as const,
    label: 'You level up',
    text: 'streaks raise your level, and pings space out as the habit sets.',
  },
];

const LOGGING_OPTIONS = [
  {
    icon: 'checkmark' as const,
    label: 'Check-in',
    tone: 'tint' as const,
    text: 'You did it. Logs the rep and grows your streak.',
  },
  {
    icon: 'circle.lefthalf.filled' as const,
    label: 'Tried',
    tone: 'warning' as const,
    text: 'You showed up but did not fully finish. It still counts — showing up is the habit.',
  },
  {
    icon: 'pause.fill' as const,
    label: 'Snooze',
    tone: 'muted' as const,
    text: 'Not now. Reschedules the ping for later; your streak stays safe.',
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { addBehavior, setOnboarded, updateAppProfile, appProfile } = useStore();

  const params = useLocalSearchParams<{ demo?: string }>();
  const [step, setStep] = useState<Step>('welcome');
  const [selected, setSelected] = useState<Behavior | null>(null);
  const [notif, setNotif] = useState<'granted' | 'denied' | null>(null);
  const [pingSent, setPingSent] = useState(false);

  const dot = STEP_DOT[step] ?? 0;

  // Tapping the real demo notification (see _layout) routes back here with
  // ?demo=logging — jump straight to the logging-options explainer.
  useEffect(() => {
    if (params.demo === 'logging') setStep('logging');
  }, [params.demo]);

  // ── Flow control ──────────────────────────────────────────────────────────
  const advance = (next: Step) => {
    haptics.light();
    setStep(next);
  };

  const goBack = () => {
    switch (step) {
      case 'model':
        setStep('welcome');
        break;
      case 'rules':
        setStep('model');
        break;
      case 'notifications':
        setStep('rules');
        break;
      case 'pick':
        setStep('notifications');
        break;
      case 'demo':
        setStep('pick');
        break;
      case 'logging':
        setStep('demo');
        break;
    }
  };

  const finalize = async (behavior: Behavior | null) => {
    if (behavior) {
      await addBehavior(behavior);
      await scheduleForBehavior(behavior);
      haptics.success();
    }
    // The root layout redirects to the tabs once hasOnboarded flips true.
    await setOnboarded(true);
  };

  const enableReminders = async () => {
    haptics.light();
    const granted = await requestNotificationPermission();
    setNotif(granted ? 'granted' : 'denied');
    await updateAppProfile({
      notificationsDenied: !granted,
      quietHours: appProfile.quietHours ?? DEFAULT_QUIET_HOURS,
    });
  };

  const continueFromNotifications = async () => {
    if (!appProfile.quietHours) {
      await updateAppProfile({ quietHours: DEFAULT_QUIET_HOURS });
    }
    advance('pick');
  };

  const pickTemplate = (t: AdoptTemplate) => {
    haptics.selection();
    setPingSent(false);
    setSelected(buildBehavior(draftFromAdoptTemplate(t)));
    setStep('demo');
  };

  const sendDemoPing = async () => {
    haptics.light();
    await sendOnboardingPing();
    setPingSent(true);
  };

  // ── Welcome (hero) ──────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <View style={[styles.hero, { backgroundColor: colors.background }]}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Reprogrammer</Text>
        <Text style={[styles.heroTagline, { color: colors.accentText }]}>
          Notice · Repeat · Reprogram
        </Text>
        <Text style={[styles.heroLead, { color: colors.textMuted }]}>
          Replace the behaviors that run on autopilot with ones you actually choose
          — a few small reps at a time.
        </Text>
        <Pressable
          onPress={() => advance('model')}
          style={({ pressed }) => [
            styles.heroCta,
            { backgroundColor: colors.tint },
            pressed && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Begin"
        >
          <Text style={[styles.ctaText, { color: colors.textOnBrand }]}>Begin</Text>
        </Pressable>
      </View>
    );
  }

  // ── Step body ───────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 'model':
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>How it works</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              You train one behavior at a time. Each is one of two kinds:
            </Text>
            <View style={styles.kindRow}>
              {KIND_ROWS.map((r) => (
                <View
                  key={r.label}
                  style={[
                    styles.kindCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.kindIcon,
                      {
                        backgroundColor:
                          r.label === 'Adopt' ? colors.tintSoft : colors.dangerSoft,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={r.icon}
                      size={20}
                      color={r.label === 'Adopt' ? colors.accentText : colors.danger}
                    />
                  </View>
                  <Text style={[styles.kindLabel, { color: colors.text }]}>{r.label}</Text>
                  <Text style={[styles.kindText, { color: colors.textMuted }]}>{r.text}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>The loop</Text>
            <View style={[styles.loopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {LOOP_ROWS.map((r, i) => (
                <View
                  key={r.label}
                  style={[
                    styles.loopRow,
                    i < LOOP_ROWS.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.loopIcon, controlSelected(colors)]}>
                    <IconSymbol name={r.icon} size={16} color={colors.accentText} />
                  </View>
                  <Text style={[styles.loopText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>{r.label}</Text> — {r.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'rules':
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>Before you start</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              Five rules that decide whether this works for you.
            </Text>
            {GROUND_RULES.map((rule, idx) => (
              <View
                key={rule.id}
                style={[styles.ruleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.ruleHeader}>
                  <View style={[styles.ruleNumber, controlSelected(colors)]}>
                    <Text style={[styles.ruleNumberText, { color: colors.accentText }]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text style={[styles.ruleTitle, { color: colors.text }]}>{rule.title}</Text>
                </View>
                <Text style={[styles.ruleBody, { color: colors.text }]}>{rule.body}</Text>
                <Text style={[styles.ruleCitation, { color: colors.textMuted }]}>
                  {rule.citation}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>Turn on notifications</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              This part is not optional — Reprogrammer works through notifications. The
              gentle pings are what prompt each rep; without them the app has nothing to
              remind you with, and nothing happens. Turn them on so this can actually work.
              They stay calm, randomized, and never arrive during your quiet hours.
            </Text>

            {notif === 'granted' ? (
              <View style={[styles.noticeCard, { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted }]}>
                <IconSymbol name="checkmark" size={18} color={colors.accentText} />
                <Text style={[styles.noticeText, { color: colors.text }]}>
                  Reminders are on. You are all set.
                </Text>
              </View>
            ) : notif === 'denied' ? (
              <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <IconSymbol name="bell.fill" size={18} color={colors.textMuted} />
                <Text style={[styles.noticeText, { color: colors.textMuted }]}>
                  No problem — you can turn these on later in Settings. The app still
                  works; you will just check in on your own.
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={enableReminders}
                style={({ pressed }) => [
                  styles.inlineCta,
                  { backgroundColor: colors.tint },
                  pressed && { opacity: PRESSED_OPACITY },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Enable reminders"
              >
                <IconSymbol name="bell.fill" size={18} color={colors.textOnBrand} />
                <Text style={[styles.inlineCtaText, { color: colors.textOnBrand }]}>
                  Enable reminders
                </Text>
              </Pressable>
            )}

            <View style={[styles.quietCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.quietLabel, { color: colors.accentText }]}>Quiet hours</Text>
              <Text style={[styles.quietValue, { color: colors.text }]}>10:00 PM – 8:00 AM</Text>
              <Text style={[styles.quietNote, { color: colors.textMuted }]}>
                We never ping you during these hours. Change them anytime in Settings.
              </Text>
            </View>
          </View>
        );

      case 'pick':
        return (
          <View style={styles.stepBody}>
            <Pressable
              onPress={() => finalize(null)}
              style={({ pressed }) => [
                styles.foundationCard,
                { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
                pressed && { opacity: PRESSED_OPACITY },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start with The Foundation"
            >
              <Text style={[styles.foundationLabel, { color: colors.accentText }]}>Start here</Text>
              <Text style={[styles.foundationTitle, { color: colors.text }]}>The Foundation</Text>
              <Text style={[styles.foundationBody, { color: colors.textMuted }]}>
                New to changing habits? Begin with a few short reads on how change
                actually works — they are at the top of your Library.
              </Text>
            </Pressable>

            <Text style={[styles.title, { color: colors.text }]}>Or pick a behavior</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              One to start. Get it to automatic before adding another.
            </Text>

            <View style={styles.templates}>
              {templates.map((template) => (
                <Pressable
                  key={template.id}
                  onPress={() => pickTemplate(template)}
                  style={({ pressed }) => [
                    styles.templateCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: PRESSED_OPACITY },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${template.title}`}
                >
                  <Text style={[styles.templateTitle, { color: colors.text }]}>
                    {template.title}
                  </Text>
                  <Text style={[styles.templateMessage, { color: colors.textMuted }]}>
                    {template.pingMessage}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'demo': {
        const canPing = notif === 'granted' && Platform.OS !== 'web';
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>Try a real ping</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              {canPing
                ? 'Send yourself a real notification, then tap the banner when it arrives to keep going.'
                : 'On your device a real notification appears here, and you tap it to keep going. Reminders are off right now, so continue to see your options.'}
            </Text>

            {canPing && !pingSent ? (
              <Pressable
                onPress={sendDemoPing}
                style={({ pressed }) => [
                  styles.inlineCta,
                  { backgroundColor: colors.tint },
                  pressed && { opacity: PRESSED_OPACITY },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Send a test notification"
              >
                <IconSymbol name="bell.fill" size={18} color={colors.textOnBrand} />
                <Text style={[styles.inlineCtaText, { color: colors.textOnBrand }]}>
                  Send a test ping
                </Text>
              </Pressable>
            ) : null}

            {canPing && pingSent ? (
              <View style={[styles.noticeCard, { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted }]}>
                <IconSymbol name="bell.fill" size={18} color={colors.accentText} />
                <Text style={[styles.noticeText, { color: colors.text }]}>
                  Sent. Tap the banner when it appears to continue — or use the link below.
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => advance('logging')}
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: PRESSED_OPACITY }]}
              accessibilityRole="button"
              accessibilityLabel="Continue to your check-in options"
            >
              <Text style={[styles.linkText, { color: colors.accentText }]}>
                {canPing && !pingSent ? 'Continue without it →' : 'Continue →'}
              </Text>
            </Pressable>
          </View>
        );
      }

      case 'logging':
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>How you respond</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              When a ping arrives, you have three replies:
            </Text>

            {LOGGING_OPTIONS.map((opt) => (
              <View
                key={opt.label}
                style={[styles.optionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor:
                        opt.tone === 'tint'
                          ? colors.tintSoft
                          : opt.tone === 'warning'
                            ? colors.warningSoft
                            : colors.surfaceMuted,
                    },
                  ]}
                >
                  <IconSymbol
                    name={opt.icon}
                    size={18}
                    color={
                      opt.tone === 'tint'
                        ? colors.accentText
                        : opt.tone === 'warning'
                          ? colors.warning
                          : colors.textMuted
                    }
                  />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.optionText, { color: colors.textMuted }]}>{opt.text}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.loggingClose, { color: colors.textMuted }]}>
              That is the whole loop. A few reps a day and it starts to run on its own.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  // ── Footer ────────────────────────────────────────────────────────────────
  const footer = (() => {
    switch (step) {
      case 'model':
        return { label: 'Next', onPress: () => advance('rules') };
      case 'rules':
        return { label: 'I understand', onPress: () => advance('notifications') };
      case 'notifications':
        return { label: 'Continue', onPress: continueFromNotifications };
      case 'logging':
        return { label: 'Start using Reprogrammer', onPress: () => finalize(selected) };
      default:
        return null; // 'pick' and 'demo' drive themselves from in-body actions.
    }
  })();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Space.sm }]}>
        <Pressable
          onPress={goBack}
          hitSlop={8}
          style={({ pressed }) => [styles.headerButton, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <IconSymbol name="chevron.left" size={22} color={colors.textMuted} />
        </Pressable>
        <ProgressDots total={TOTAL_DOTS} current={dot} colors={colors} />
        <Pressable
          onPress={() => finalize(null)}
          hitSlop={8}
          style={({ pressed }) => [styles.headerSkip, pressed && { opacity: PRESSED_OPACITY }]}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={[styles.headerSkipText, { color: colors.textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>

      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            onPress={footer.onPress}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.tint },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel={footer.label}
          >
            <Text style={[styles.primaryText, { color: colors.textOnBrand }]}>{footer.label}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Welcome hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
    gap: Space.md,
  },
  heroTitle: { ...Type.display2, fontSize: 40, fontWeight: '800' },
  heroTagline: {
    ...Type.caption,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroLead: {
    ...Type.body,
    textAlign: 'center',
    maxWidth: 420,
    marginTop: Space.sm,
    marginBottom: Space.xl,
  },
  heroCta: {
    paddingVertical: Space.md + Space.xxs,
    paddingHorizontal: Space.xxl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  ctaText: { ...Type.bodyBold, fontWeight: '700' },

  // Wizard scaffold
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.sm,
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerSkip: { width: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  headerSkipText: { ...Type.caption, fontWeight: '600' },
  scroll: {
    padding: Space.xl,
    paddingTop: Space.md,
    paddingBottom: Space.xxxl,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  stepBody: { gap: Space.md },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Space.xl,
    paddingTop: Space.md,
    paddingBottom: Space.xl,
  },
  primaryButton: {
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryText: { ...Type.bodyBold, fontWeight: '700' },

  // Shared headings
  title: { ...Type.display2 },
  lead: { ...Type.body, marginBottom: Space.xs },
  sectionLabel: {
    ...Type.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Space.sm,
  },

  // Model — kind cards
  kindRow: { flexDirection: 'row', gap: Space.sm },
  kindCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
    gap: Space.xs,
  },
  kindIcon: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xxs,
  },
  kindLabel: { ...Type.bodyBold, fontWeight: '700' },
  kindText: { ...Type.caption },

  // Model — the loop
  loopCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  loopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm + Space.xxs,
    padding: Space.md + Space.xxs,
  },
  loopIcon: {
    width: Space.xl + Space.xs,
    height: Space.xl + Space.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopText: { ...Type.caption, flex: 1, lineHeight: 19 },

  // Rules
  ruleCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
    gap: Space.sm,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm + Space.xxs,
  },
  ruleNumber: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: { ...Type.caption, fontSize: 12, fontWeight: '700' },
  ruleTitle: { ...Type.bodyBold, fontWeight: '700', flex: 1 },
  ruleBody: { ...Type.body },
  ruleCitation: { ...Type.micro, fontWeight: '400', fontStyle: 'italic' },

  // Notifications
  inlineCta: {
    flexDirection: 'row',
    gap: Space.sm,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  inlineCtaText: { ...Type.bodyBold, fontWeight: '700' },
  noticeCard: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
  },
  noticeText: { ...Type.caption, flex: 1, lineHeight: 19 },
  quietCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xxs,
    marginTop: Space.xs,
  },
  quietLabel: { ...Type.micro, textTransform: 'uppercase', letterSpacing: 1 },
  quietValue: { ...Type.bodyBold, fontWeight: '700' },
  quietNote: { ...Type.caption, marginTop: Space.xxs },

  // Pick
  foundationCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xs,
    marginBottom: Space.sm,
  },
  foundationLabel: { ...Type.micro },
  foundationTitle: { ...Type.bodyBold, fontWeight: '700' },
  foundationBody: { ...Type.caption },
  templates: { gap: Space.md },
  templateCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xs,
  },
  templateTitle: { ...Type.bodyBold, fontWeight: '700' },
  templateMessage: { ...Type.caption },

  // Demo (test ping) + logging
  linkRow: {
    alignSelf: 'center',
    paddingVertical: Space.sm,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: Space.xs,
  },
  linkText: { ...Type.bodyBold, fontWeight: '600' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs,
  },
  optionIcon: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: { flex: 1, gap: Space.xxs },
  optionLabel: { ...Type.bodyBold, fontWeight: '700' },
  optionText: { ...Type.caption, lineHeight: 19 },
  loggingClose: { ...Type.caption, fontStyle: 'italic', marginTop: Space.sm },
});
