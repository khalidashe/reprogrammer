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
import type { Domain } from '@/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useContentModals } from '@/components/library/content-modals-provider';
import { SearchBar } from '@/components/library/search-bar';
import { useIsPro } from '@/hooks/useIsPro';
import { FREE_GUIDE_IDS } from '@/constants/limits';

const CONTENT_MAX_WIDTH = 640;
const DOMAIN_ORDER: Domain[] = [
  'social',
  'emotional',
  'professional',
  'physical',
  'language_cognitive',
  'creative',
];

type DomainFilter = Domain | 'all';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { openGuide } = useContentModals();
  const router = useRouter();
  const { isPro } = useIsPro();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<DomainFilter>('all');

  const domainsPresent = useMemo(() => {
    const present = new Set(LIBRARY_GUIDES.map((g) => g.domain));
    return DOMAIN_ORDER.filter((d) => present.has(d));
  }, []);

  const q = query.trim().toLowerCase();
  const filteredGuides = useMemo(() => {
    return LIBRARY_GUIDES.filter((g) => {
      if (domain !== 'all' && g.domain !== domain) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        domainLabel(g.domain).toLowerCase().includes(q)
      );
    });
  }, [q, domain]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Space.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {LIBRARY_GUIDES.length} guides · research-grounded, with practice drills
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search guides…"
        colors={colors}
      />

      <View style={styles.chipRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <FilterChip
            label="All"
            active={domain === 'all'}
            colors={colors}
            onPress={() => setDomain('all')}
          />
          {domainsPresent.map((d) => (
            <FilterChip
              key={d}
              label={domainLabel(d)}
              active={domain === d}
              colors={colors}
              onPress={() => setDomain(d)}
            />
          ))}
        </ScrollView>
      </View>

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

function FilterChip({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: colors.tintSoft, borderColor: 'transparent' }
          : { borderColor: colors.border },
      ]}
      accessibilityLabel={`Filter by ${label}`}
      accessibilityState={{ selected: active }}
    >
      <Text
        style={[styles.chipText, { color: active ? colors.accentText : colors.textMuted }]}
      >
        {label}
      </Text>
    </Pressable>
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
        { backgroundColor: colors.surface, borderColor: colors.border },
        locked && { opacity: 0.62 },
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
        {locked ? (
          <View style={[styles.proPill, { backgroundColor: colors.tintSoft }]}>
            <IconSymbol name="lock.fill" size={11} color={colors.accentText} />
            <Text style={[styles.proPillText, { color: colors.accentText }]}>Pro</Text>
          </View>
        ) : (
          <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
        )}
      </View>
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
        {domainLabel(guide.domain)} · {guide.estimatedMinutes} min read
      </Text>
      <Text style={[styles.cardBody, { color: colors.textMuted }]} numberOfLines={2}>
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
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  title: { ...Type.h1 },
  subtitle: { ...Type.caption, marginTop: Space.xs },
  chipRowWrap: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  chipRow: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
    paddingBottom: Space.xs,
    gap: Space.xs,
  },
  chip: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  chipText: { ...Type.caption, fontWeight: '500' },
  scrollContent: {
    padding: Space.lg,
    paddingTop: Space.md,
    gap: Space.md,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  noMatches: {
    ...Type.body,
    textAlign: 'center',
    paddingVertical: Space.xxl,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.xs,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  cardTitle: { ...Type.bodyBold },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  proPillText: { ...Type.micro, letterSpacing: 0 },
  cardMeta: { ...Type.micro, letterSpacing: 0, marginTop: 2 },
  cardBody: { ...Type.caption, marginTop: Space.xs },
});
