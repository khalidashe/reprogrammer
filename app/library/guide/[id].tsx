import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { LIBRARY_GUIDES } from '@/services/library/guides';
import { domainLabel } from '@/services/library/types';
import {
  StoryBlock,
  RevealsBlock,
  PrincipleBlock,
  ResearchBlock,
  TacticsBlock,
  ConnectionBlock,
} from '@/components/library/GuideBody';

export default function GuideDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  const guide = LIBRARY_GUIDES.find((g) => g.id === id);

  if (!guide) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Guide' }} />
        <Text style={[styles.errorText, { color: colors.text }]}>Guide not found</Text>
      </View>
    );
  }

  const relatedGuides = (guide.relatedGuideIds ?? [])
    .map((relatedId) => LIBRARY_GUIDES.find((g) => g.id === relatedId))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: guide.title }} />
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.tint }]}>
          {domainLabel(guide.domain)} · {guide.estimatedMinutes} min read
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{guide.title}</Text>
        <Text style={[styles.summary, { color: colors.textMuted }]}>{guide.summary}</Text>

        <StoryBlock text={guide.story} colors={colors} />
        <RevealsBlock text={guide.whatItReveals} colors={colors} />
        <PrincipleBlock text={guide.principle} colors={colors} />
        <ResearchBlock entries={guide.research} colors={colors} />
        <TacticsBlock tactics={guide.howToApply} colors={colors} />
        <ConnectionBlock text={guide.connection} colors={colors} />

        {relatedGuides.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              Related Guides
            </Text>
            <View style={styles.relatedChips}>
              {relatedGuides.map((related) => (
                <Pressable
                  key={related.id}
                  onPress={() =>
                    router.push({ pathname: '/library/guide/[id]', params: { id: related.id } })
                  }
                  style={[
                    styles.chip,
                    { borderColor: colors.tintMuted, backgroundColor: colors.tintSoft },
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors.text }]}>{related.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
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
    marginBottom: 10,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },
  relatedSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  relatedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    paddingTop: 60,
    fontSize: 16,
  },
});
