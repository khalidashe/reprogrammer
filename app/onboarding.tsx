import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
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
  const { addBehavior, setOnboarded } = useStore();
  const [step, setStep] = useState<Step>('splash');

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

  if (step === 'splash') {
    return (
      <View
        style={[
          styles.splashContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.splashTitle, { color: colors.text }]}>Reprogrammer</Text>
        <Text style={[styles.splashTagline, { color: colors.tint }]}>
          NOTICE · REPEAT · REPROGRAM
        </Text>
        <Pressable
          onPress={() => setStep('rules')}
          style={[styles.cta, { backgroundColor: colors.tint }]}
        >
          <Text style={[styles.ctaText, { color: colors.textOnBrand }]}>Begin</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'rules') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
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
                <View style={[styles.ruleNumber, { backgroundColor: colors.tint }]}>
                  <Text style={[styles.ruleNumberText, { color: colors.textOnBrand }]}>
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
            style={[styles.cta, { backgroundColor: colors.tint, marginTop: 12 }]}
          >
            <Text style={[styles.ctaText, { color: colors.textOnBrand }]}>I understand</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Pick a state to start</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          One state. Get it to automatic before adding another.
        </Text>

        <View style={styles.templates}>
          {templates.map((template) => (
            <Pressable
              key={template.id}
              onPress={() => addTemplate(template)}
              style={[styles.templateCard, { borderColor: colors.tint }]}
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
          style={[styles.skipButton, { backgroundColor: colors.surfaceMuted }]}
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
    padding: 20,
    gap: 16,
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: '800',
  },
  splashTagline: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  ruleCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  ruleBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  ruleCitation: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  templates: {
    gap: 12,
    marginBottom: 24,
  },
  templateCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  templateMessage: {
    fontSize: 13,
  },
  cta: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
