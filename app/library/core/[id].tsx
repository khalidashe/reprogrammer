import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CORE_STORIES, SCIENCE_SECTION } from '@/services/library/core';
import {
  StoryBlock,
  RevealsBlock,
  PrincipleBlock,
  ResearchBlock,
  ConnectionBlock,
} from '@/components/library/GuideBody';

export default function CoreGuideDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  if (id === 'science') {
    return <ScienceScreen />;
  }

  const story = CORE_STORIES.find((s) => s.id === id);
  if (!story) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Core Guide' }} />
        <Text style={[styles.errorText, { color: colors.text }]}>Story not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: `Story ${story.index}` }} />
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.tint }]}>Story {story.index}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{story.title}</Text>

        <StoryBlock text={story.narrative} colors={colors} />
        <RevealsBlock text={story.whatItReveals} colors={colors} />
        <PrincipleBlock text={story.principle} colors={colors} />
        <ResearchBlock entries={story.research} colors={colors} />
        {story.connection && <ConnectionBlock text={story.connection} colors={colors} />}
      </View>
    </ScrollView>
  );
}

function ScienceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: SCIENCE_SECTION.title }} />
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.tint }]}>Core Guide</Text>
        <Text style={[styles.title, { color: colors.text }]}>{SCIENCE_SECTION.title}</Text>
        <Text style={[styles.summary, { color: colors.textMuted }]}>{SCIENCE_SECTION.intro}</Text>

        {SCIENCE_SECTION.topics.map((topic) => (
          <View key={topic.heading} style={styles.topic}>
            <Text style={[styles.topicHeading, { color: colors.text }]}>{topic.heading}</Text>
            <Text style={[styles.topicBody, { color: colors.text }]}>{topic.body}</Text>
            {topic.bullets &&
              topic.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={[styles.bullet, { color: colors.tint }]}>•</Text>
                  <Text style={[styles.bulletText, { color: colors.text }]}>{bullet}</Text>
                </View>
              ))}
          </View>
        ))}

        <ResearchBlock entries={SCIENCE_SECTION.summary} colors={colors} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  topic: {
    marginBottom: 28,
  },
  topicHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  topicBody: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 14,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    textAlign: 'center',
    paddingTop: 60,
    fontSize: 16,
  },
});
