import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useFirebaseAuth } from '@/services/firebase-auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  PRESSED_OPACITY,
} from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressDots } from '@/components/create/steps';
import {
  ModelTeaching,
  GroundRulesTeaching,
  LoggingTeaching,
} from '@/components/onboarding/teaching';
import useStore from '@/store/useStore';
import type { Behavior } from '@/types';
import {
  scheduleForBehavior,
  requestNotificationPermission,
  sendOnboardingPing,
} from '@/services/notifications';
import { featuredTemplates, type AdoptTemplate } from '@/services/library-content';
import { buildBehavior, draftFromAdoptTemplate } from '@/services/behavior-factory';
import { haptics } from '@/services/haptics';
import { SignInPanel } from '@/components/auth/sign-in-panel';

/**
 * First-run experience (REP-39). A short, calm wizard that *teaches the model*
 * (Adopt/Eliminate → ping → check-in → streak → level), primes notifications
 * with a reason before the OS prompt, seeds a first behavior, and lets the user
 * feel one ping before landing on the dashboard.
 *
 * Steps: welcome (hero) → model → rules → notifications → pick → demo → logging
 * → account. The test ping ("demo") and the logging-options explainer share a
 * progress dot, so the teaching bar stays a stable five.
 *
 * The final `account` step is the mandatory sign-up wall (REP-46): onboarding
 * can't finish without an account, so `setOnboarded(true)` only runs once the
 * user is signed in.
 */
type Step =
  | 'welcome'
  | 'model'
  | 'rules'
  | 'notifications'
  | 'pick'
  | 'demo'
  | 'logging'
  | 'account';

const STEP_DOT: Partial<Record<Step, number>> = {
  model: 0,
  rules: 1,
  notifications: 2,
  pick: 3,
  demo: 4,
  logging: 4,
  account: 4,
};
const TOTAL_DOTS = 5;

/** Sensible default quiet window; fully editable later in Settings. */
const DEFAULT_QUIET_HOURS = { from: '22:00', to: '08:00' };

const templates = featuredTemplates();

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { addBehavior, setOnboarded, updateAppProfile, appProfile } = useStore();
  const { isAuthenticated } = useFirebaseAuth();

  const params = useLocalSearchParams<{ demo?: string }>();
  const [step, setStep] = useState<Step>('welcome');
  const [selected, setSelected] = useState<Behavior | null>(null);
  const [notif, setNotif] = useState<'granted' | 'denied' | null>(null);
  const [pingSent, setPingSent] = useState(false);
  const [pendingBehavior, setPendingBehavior] = useState<Behavior | null>(null);

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
      case 'account':
        setStep('logging');
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

  // Every "finish onboarding" path funnels through here so the account wall
  // (REP-46) can't be skipped. Already signed in → finish; otherwise stash the
  // chosen behavior and route to the sign-up step, which finalizes on success.
  const completeOnboarding = (behavior: Behavior | null) => {
    if (isAuthenticated) {
      void finalize(behavior);
      return;
    }
    setPendingBehavior(behavior);
    advance('account');
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
            <ModelTeaching colors={colors} />
          </View>
        );

      case 'rules':
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>Before you start</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              Five rules that decide whether this works for you.
            </Text>
            <GroundRulesTeaching colors={colors} />
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
              onPress={() => completeOnboarding(null)}
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
            <LoggingTeaching colors={colors} />
          </View>
        );

      case 'account':
        return (
          <View style={styles.stepBody}>
            <Text style={[styles.title, { color: colors.text }]}>Save your progress</Text>
            <Text style={[styles.lead, { color: colors.textMuted }]}>
              One quick step to finish. Your account keeps a safe backup of your
              streaks and behaviors, and lets you sync across devices with Pro.
            </Text>

            <SignInPanel onSignedIn={() => void finalize(pendingBehavior)} />

            <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="envelope.fill" size={18} color={colors.textMuted} />
              <Text style={[styles.noticeText, { color: colors.textMuted }]}>
                We use your email for your account and a gentle weekly digest —
                never spam, and you can turn it off anytime in Settings.
              </Text>
            </View>
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
        return { label: 'Start using Reprogrammer', onPress: () => completeOnboarding(selected) };
      default:
        return null; // 'pick', 'demo' and 'account' drive themselves from in-body actions.
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
        {step === 'account' ? (
          // The account wall can't be skipped — keep the header balanced.
          <View style={styles.headerSkip} />
        ) : (
          <Pressable
            onPress={() => completeOnboarding(null)}
            hitSlop={8}
            style={({ pressed }) => [styles.headerSkip, pressed && { opacity: PRESSED_OPACITY }]}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={[styles.headerSkipText, { color: colors.textMuted }]}>Skip</Text>
          </Pressable>
        )}
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

  // Demo (test ping)
  linkRow: {
    alignSelf: 'center',
    paddingVertical: Space.sm,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: Space.xs,
  },
  linkText: { ...Type.bodyBold, fontWeight: '600' },
});
