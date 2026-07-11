import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, type ThemeColors } from '@/constants/theme';
import {
  LIBRARY_GUIDES,
  domainLabel,
  type LibraryGuide,
} from '@/services/library-content';
import { useContentModals } from '@/components/library/content-modals-provider';
import { SearchBar } from '@/components/library/search-bar';
import { useIsPro } from '@/hooks/useIsPro';
import { cardStyle, ScreenHeader, Pill } from '@/components/ui/primitives';
import { FREE_GUIDE_IDS } from '@/constants/limits';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { openGuide } = useContentModals();
  const router = useRouter();
  const { isPro } = useIsPro();
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
      <ScreenHeader
        title="Library"
        subtitle={`${LIBRARY_GUIDES.length} guides — research-grounded, with practice drills.`}
        colors={colors}
        insetsTop={insets.top}
      />

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
          filteredGuides.map((guide) => {
            const locked = !isPro && !FREE_GUIDE_IDS.has(guide.id);
            return (
              <GuideCard
                key={guide.id}
                guide={guide}
                colors={colors}
                locked={locked}
                onPress={() =>
                  locked ? router.push('/paywall') : openGuide(guide.id)
                }
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function GuideCard({
  guide,
  colors,
  locked,
  onPress,
}: {
  guide: LibraryGuide;
  colors: ThemeColors;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        cardStyle(colors, locked ? 'muted' : 'brandSoft'),
      ]}
      accessibilityLabel={
        locked
          ? `${guide.title} guide, Pro only`
          : `${guide.title} guide, ${guide.estimatedMinutes} minute read`
      }
      accessibilityHint={locked ? 'Opens the upgrade screen' : 'Opens the full guide'}
    >
      <View style={styles.cardTitleRow}>
        <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]}>
          {guide.title}
        </Text>
        {locked && <Pill label="PRO" colors={colors} tone="brand" color={colors.tint} />}
      </View>
      <Pill label={`${domainLabel(guide.domain)} · ${guide.estimatedMinutes} min`} colors={colors} tone="muted" />
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={3}>
        {guide.summary}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  cardTitle: { ...Type.bodyBold },
  cardBody: { ...Type.caption, marginTop: Space.xxs },
});
