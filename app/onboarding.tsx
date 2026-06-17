import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
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
import useStore from '@/store/useStore';
import { Behavior } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { scheduleForBehavior } from '@/services/notifications';
import { INITIAL_LEVEL, INITIAL_LAST_LEVELUP_STREAK } from '@/services/levels';
import { featuredTemplates } from '@/services/library-content';
import { GROUND_RULES } from '@/services/ground-rules';

type Step = 'splash' | 'rules' | 'templates';

const templates = featuredTemplates();

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { addBehavior, setOnboarded } = useStore();
  const [step, setStep] = useState<Step>('splash');

  // The rules / templates screens need to clear the status bar; the splash
  // is centered so it doesn't.
  const contentPaddingTop = insets.top + Space.xxl;

  const addTemplate = async (template: (typeof templates)[0]) => {
    const behavior: Behavior = {
      id: generateUUID(),
      kind: 'adopt',
      title: template.title,
      pingMessage: template.pingMessage,
      practiceType: template.practiceType,
      domain: template.domain,
      libraryGuideId: template.libraryGuideId,
      window: template.window,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      intervalMinutes: template.intervalMinutes,
      level: INITIAL_LEVEL,
      lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
      createdAt: Date.now(),
      hidden: false,
      bookmarked: false,
    };
    await addBehavior(behavior);
    await scheduleForBehavior(behavior);
    await setOnboarded(true);
  };

  const skipOnboarding = async () => {
    await setOnboarded(true);
  };

  const startWithFoundation = async () => {
    await setOnboarded(true);
  };

  if (step === 'splash') {
    return (
      <View
        style={[
          styles.splashContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.splashTitle, { color: colors.text }]}>Reprogrammer</Text>
        <Text style={[styles.splashTagline, { color: colors.accentText }]}>
          Notice · Repeat · Reprogram
        </Text>
        <Pressable
          onPress={() => setStep('rules')}
          style={({ pressed }) => [
            styles.cta,
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

  if (step === 'rules') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { paddingTop: contentPaddingTop }]}>
          <Text style={[styles.title, { color: colors.text }]}>Before you start</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Five rules that decide whether this works for you.
          </Text>

          {GROUND_RULES.map((rule, idx) => (
            <View
              key={rule.id}
              style={[
                styles.ruleCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
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

          <Pressable
            onPress={() => setStep('templates')}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.tint, marginTop: Space.md },
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="button"
            accessibilityLabel="I understand"
          >
            <Text style={[styles.ctaText, { color: colors.textOnBrand }]}>I understand</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: contentPaddingTop }]}>
        <Pressable
          onPress={startWithFoundation}
          style={({ pressed }) => [
            styles.foundationCard,
            { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
            pressed && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Start with The Foundation"
        >
          <Text style={[styles.foundationLabel, { color: colors.accentText }]}>
            Start here
          </Text>
          <Text style={[styles.foundationTitle, { color: colors.text }]}>The Foundation</Text>
          <Text style={[styles.foundationBody, { color: colors.textMuted }]}>
            New to changing habits? Begin with a few short reads on how change actually
            works — they&apos;re at the top of your Library.
          </Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Pick a behavior to start</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          One behavior. Get it to automatic before adding another.
        </Text>

        <View style={styles.templates}>
          {templates.map((template) => (
            <Pressable
              key={template.id}
              onPress={() => addTemplate(template)}
              style={({ pressed }) => [
                styles.templateCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: PRESSED_OPACITY },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Add ${template.title}`}
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

        <Pressable
          onPress={skipOnboarding}
          style={({ pressed }) => [
            styles.skipButton,
            { backgroundColor: colors.surfaceMuted },
            pressed && { opacity: PRESSED_OPACITY },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Skip and create my own behavior"
        >
          <Text style={[styles.skipButtonText, { color: colors.text }]}>
            Skip — I&apos;ll create my own
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
    gap: Space.lg,
  },
  // Splash hero — the only place we use the editorial display-2 token.
  splashTitle: {
    ...Type.display2,
    fontSize: 40, // splash hero stays larger than guide titles
    fontWeight: '800',
  },
  splashTagline: {
    ...Type.caption,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: Space.xxl,
  },
  container: {
    flex: 1,
  },
  // paddingTop is applied dynamically (safe-area + Space.xxl) at the JSX site
  content: {
    padding: Space.xl,
    paddingBottom: Space.xxxl + Space.sm,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: {
    ...Type.display2,
    marginBottom: Space.xs + Space.xxs, // = 6, the small bump under the title
  },
  description: {
    ...Type.body,
    marginBottom: Space.xl,
  },
  ruleCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.md + Space.xxs, // = 14; sits between md (12) and lg (16)
    marginBottom: Space.sm + Space.xxs, // = 10
    gap: Space.sm,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm + Space.xxs, // = 10
  },
  ruleNumber: {
    width: Space.xxl,
    height: Space.xxl,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Lives inside a 24pt circle badge; the caption-1px override keeps the
  // numeral centered without overflowing the chip.
  ruleNumberText: {
    ...Type.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  ruleTitle: {
    ...Type.bodyBold,
    fontWeight: '700',
    flex: 1,
  },
  ruleBody: {
    ...Type.body,
  },
  ruleCitation: {
    ...Type.micro,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  foundationCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xs,
    marginBottom: Space.xl,
  },
  foundationLabel: {
    ...Type.micro,
  },
  foundationTitle: {
    ...Type.bodyBold,
    fontWeight: '700',
  },
  foundationBody: {
    ...Type.caption,
  },
  templates: {
    gap: Space.md,
    marginBottom: Space.xxl,
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.xs,
  },
  templateTitle: {
    ...Type.bodyBold,
    fontWeight: '700',
  },
  templateMessage: {
    ...Type.caption,
  },
  cta: {
    paddingVertical: Space.md + Space.xxs, // = 14
    paddingHorizontal: Space.xxl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: Space.sm,
  },
  ctaText: {
    ...Type.bodyBold,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    ...Type.body,
    fontWeight: '500',
  },
});
