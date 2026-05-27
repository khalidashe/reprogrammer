import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import useStore from '@/store/useStore';
import { Behavior } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { scheduleForBehavior } from '@/services/notifications';
import { INITIAL_LEVEL, INITIAL_LAST_LEVELUP_STREAK } from '@/services/levels';
import { featuredTemplates } from '@/services/library-content';

const templates = featuredTemplates();

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addBehavior, setOnboarded } = useStore();

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Reprogrammer</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Notice • Repeat • Reprogram
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          Choose a state to practice, or skip to create your own.
        </Text>

        <View style={styles.templates}>
          {templates.map((template) => (
            <Pressable
              key={template.title}
              onPress={() => addTemplate(template)}
              style={[styles.templateCard, { borderColor: colors.tint }]}
            >
              <Text style={[styles.templateTitle, { color: colors.text }]}>
                {template.title}
              </Text>
              <Text style={[styles.templateMessage, { color: colors.text }]}>
                {template.pingMessage}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={skipOnboarding}
          style={[styles.skipButton, { backgroundColor: colors.tint }]}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  templates: {
    gap: 12,
    marginBottom: 30,
  },
  templateCard: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  templateMessage: {
    fontSize: 14,
  },
  skipButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
