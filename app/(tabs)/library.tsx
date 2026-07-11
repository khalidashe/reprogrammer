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
import { cardStyle, ScreenHeader, Pill, SectionTitle } from '@/components/ui/primitives';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FREE_GUIDE_IDS } from '@/constants/limits';
import type { Domain } from '@/types';

/**
 * Library groupings. Each group collects guides by domain under a labeled
 * header, rendered as a horizontal scroll. Extend freely.
 */
const LIBRARY_GROUPS: { title: string; domains: Domain[] }[] = [
  { title: 'Mind & Wellness', domains: ['emotional'] },
  { title: 'Career & Focus', domains: ['professional'] },
  { title: 'Body & Presence', domains: ['physical'] },
  { title: 'Social & Connection', domains: ['social'] },
];

const GROUPED_DOMAINS = new Set(LIBRARY_GROUPS.flatMap((g) => g.domains));

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { openGuide } = useContentModals();
  const router = useRouter();
  const { isPro } = useIsPro();
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Mind & Wellness': true,
    'Career & Focus': true,
    'Body & Presence': true,
    'Social & Connection': true,
  });

  const toggleGroup = (title: string) =>
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));

  const closeSearch = () => {
    setQuery('');
    setSearchActive(false);
  };

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

  const groupedGuides = useMemo(() => {
    const inGroup = filteredGuides.filter((g) => GROUPED_DOMAINS.has(g.domain));
    const ungrouped = filteredGuides.filter((g) => !GROUPED_DOMAINS.has(g.domain));
    return { inGroup, ungrouped };
  }, [filteredGuides]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Library"
        subtitle={`${LIBRARY_GUIDES.length} guides — research-grounded, with practice drills.`}
        colors={colors}
        insetsTop={insets.top}
        right={
          !searchActive ? (
            <Pressable
              onPress={() => setSearchActive(true)}
              style={[styles.searchTrigger, { backgroundColor: colors.surfaceMuted }]}
              hitSlop={8}
              accessibilityLabel="Search guides"
            >
              <IconSymbol name="magnifyingglass" size={20} color={colors.textMuted} />
            </Pressable>
          ) : undefined
        }
      />

      {searchActive ? (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search guides…"
          colors={colors}
          autoFocus
          onCancel={closeSearch}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredGuides.length === 0 ? (
          <Text style={[styles.noMatches, { color: colors.textMuted }]}>
            No matches — try a different term.
          </Text>
        ) : (
          <>
            {LIBRARY_GROUPS.map((group) => {
              const guides = groupedGuides.inGroup.filter((g) =>
                group.domains.includes(g.domain)
              );
              if (guides.length === 0) return null;
              const expanded = !!expandedGroups[group.title];
              const visible = expanded ? guides : guides.slice(0, 3);
              return (
                <View key={group.title} style={styles.group}>
                  <SectionTitle
                    title={group.title}
                    colors={colors}
                    right={
                      <Pressable
                        onPress={() => toggleGroup(group.title)}
                        hitSlop={8}
                        accessibilityLabel={
                          expanded ? `Collapse ${group.title}` : `View all ${group.title}`
                        }
                      >
                        <Text style={[styles.viewAll, { color: colors.tint }]}>
                          {expanded ? 'Show less' : `View all (${guides.length})`}
                        </Text>
                      </Pressable>
                    }
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hScroll}
                  >
                    {visible.map((guide) => (
                      <View key={guide.id} style={styles.guideRowH}>
                        <GuideCardRow
                          guide={guide}
                          colors={colors}
                          isPro={isPro}
                          router={router}
                          openGuide={openGuide}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function GuideCardRow({
  guide,
  colors,
  isPro,
  router,
  openGuide,
}: {
  guide: LibraryGuide;
  colors: ThemeColors;
  isPro: boolean;
  router: ReturnType<typeof useRouter>;
  openGuide: ReturnType<typeof useContentModals>['openGuide'];
}) {
  const locked = !isPro && !FREE_GUIDE_IDS.has(guide.id);
  return (
    <Pressable
      onPress={() => (locked ? router.push('/paywall') : openGuide(guide.id))}
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
        <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
          {guide.title}
        </Text>
        {locked && <Pill label="PRO" colors={colors} tone="brand" color={colors.tint} />}
      </View>
      <Pill label={`${domainLabel(guide.domain)} · ${guide.estimatedMinutes} min`} colors={colors} tone="muted" />
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={2}>
        {guide.summary}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchTrigger: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Space.lg,
    paddingTop: Space.md,
    gap: Space.md,
  },
  group: {
    gap: Space.md,
    marginTop: Space.lg - 2,
  },
  hScroll: {
    paddingHorizontal: Space.lg,
    gap: Space.md,
  },
  guideRowH: {
    width: 280,
  },
  viewAll: {
    ...Type.micro,
    fontWeight: '600',
  },
  noMatches: {
    ...Type.body,
    textAlign: 'center',
    paddingVertical: Space.xxl,
  },
  card: {
    width: 280,
    height: 120,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.xs,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  cardTitle: { ...Type.bodyBold },
  cardBody: { ...Type.caption, marginTop: Space.xxs },
});
