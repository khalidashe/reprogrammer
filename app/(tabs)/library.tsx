import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, type ThemeColors } from '@/constants/theme';
import {
  LIBRARY_GUIDES,
  domainLabel,
  type LibraryGuide,
} from '@/services/library-content';
import { useContentModals } from '@/components/library/content-modals-provider';
import { SearchBar } from '@/components/library/search-bar';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { openGuide } = useContentModals();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filteredGuides = useMemo(() => {
    if (!q) return LIBRARY_GUIDES;
    return LIBRARY_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        domainLabel(g.domain).toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Space.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {LIBRARY_GUIDES.length} guides — research-grounded, with practice drills.
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search guides…"
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredGuides.length === 0 ? (
          <Text style={[styles.noMatches, { color: colors.textMuted }]}>
            No matches — try a different term.
          </Text>
        ) : (
          filteredGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              colors={colors}
              onPress={() => openGuide(guide.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function GuideCard({
  guide,
  colors,
  onPress,
}: {
  guide: LibraryGuide;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
      ]}
      accessibilityLabel={`${guide.title} guide, ${guide.estimatedMinutes} minute read`}
      accessibilityHint="Opens the full guide"
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{guide.title}</Text>
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
        {domainLabel(guide.domain)} · {guide.estimatedMinutes} min read
      </Text>
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={3}>
        {guide.summary}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
  },
  title: { ...Type.h1 },
  subtitle: { ...Type.caption, marginTop: Space.xs },
  scrollContent: {
    padding: Space.lg,
    paddingTop: Space.md,
    gap: Space.md,
  },
  noMatches: {
    ...Type.body,
    textAlign: 'center',
    paddingVertical: Space.xxl,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.xs,
  },
  cardTitle: { ...Type.bodyBold },
  cardMeta: { ...Type.micro, marginTop: 2 },
  cardBody: { ...Type.caption, marginTop: Space.xs },
});
