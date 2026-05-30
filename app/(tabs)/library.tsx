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
        {
          backgroundColor: locked ? colors.surfaceMuted : colors.tintSoft,
          borderColor: locked ? colors.border : colors.tintMuted,
        },
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
        {locked && (
          <Text style={[styles.cardLockBadge, { color: colors.tint }]}>PRO</Text>
        )}
      </View>
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
  cardTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: Space.sm },
  cardTitle: { ...Type.bodyBold },
  cardLockBadge: { ...Type.micro, fontWeight: '700', letterSpacing: 1 },
  cardMeta: { ...Type.micro, marginTop: 2 },
  cardBody: { ...Type.caption, marginTop: Space.xs },
});
