import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, type ThemeColors } from '@/constants/theme';
import {
  LIBRARY_GUIDES,
  LIBRARY_PROGRAMS,
  categoriesWithContent,
  categoryLabel,
  categoryTagline,
  guideCategory,
  isCrossBook,
  sourceBooksFor,
  type LibraryGuide,
  type LibraryProgram,
} from '@/services/library-content';
import type { LibraryCategory } from '@/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useContentModals } from '@/components/library/content-modals-provider';
import { SearchBar } from '@/components/library/search-bar';
import { useIsPro } from '@/hooks/useIsPro';
import { FREE_GUIDE_IDS } from '@/constants/limits';

const CONTENT_MAX_WIDTH = 640;
const FOUNDATION: LibraryCategory = 'foundation';

type CategoryFilter = LibraryCategory | 'all';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { openGuide, openProgram } = useContentModals();
  const router = useRouter();
  const { isPro } = useIsPro();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  // Stable: derived from static content.
  const categoriesPresent = useMemo(() => categoriesWithContent(), []);
  const q = query.trim().toLowerCase();

  // Category sections, each with its programs (books) and guides. Books lead,
  // then guides. Empty sections (and, under search, non-matching ones) drop out.
  const sections = useMemo(() => {
    const matchProgram = (p: LibraryProgram) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.book?.author.toLowerCase().includes(q) ?? false) ||
      sourceBooksFor(p).some((b) => b.author.toLowerCase().includes(q)) ||
      categoryLabel(p.category).toLowerCase().includes(q);
    const matchGuide = (g: LibraryGuide) =>
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      categoryLabel(guideCategory(g.id)).toLowerCase().includes(q);

    const cats = category === 'all' ? categoriesPresent : [category];
    return cats
      .map((cat) => ({
        category: cat,
        programs: LIBRARY_PROGRAMS.filter((p) => p.category === cat && matchProgram(p)),
        guides: LIBRARY_GUIDES.filter((g) => guideCategory(g.id) === cat && matchGuide(g)),
      }))
      .filter((s) => s.programs.length + s.guides.length > 0);
  }, [q, category, categoriesPresent]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Space.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {LIBRARY_GUIDES.length} guides · {LIBRARY_PROGRAMS.length} programs · start with The Foundation
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search the library…"
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
            active={category === 'all'}
            colors={colors}
            onPress={() => setCategory('all')}
          />
          {categoriesPresent.map((c) => (
            <FilterChip
              key={c}
              label={categoryLabel(c)}
              active={category === c}
              colors={colors}
              onPress={() => setCategory(c)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.length === 0 ? (
          <Text style={[styles.noMatches, { color: colors.textMuted }]}>
            No matches — try a different term.
          </Text>
        ) : (
          sections.map((section) => (
            <View key={section.category} style={styles.section}>
              <SectionHeader category={section.category} colors={colors} />
              {section.programs.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  colors={colors}
                  onPress={() => openProgram(p.id)}
                />
              ))}
              {section.guides.map((g) => {
                const locked = !isPro && !FREE_GUIDE_IDS.has(g.id);
                return (
                  <GuideCard
                    key={g.id}
                    guide={g}
                    colors={colors}
                    locked={locked}
                    onPress={() =>
                      locked ? router.push('/paywall') : openGuide(g.id)
                    }
                  />
                );
              })}
            </View>
          ))
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

function SectionHeader({
  category,
  colors,
}: {
  category: LibraryCategory;
  colors: ThemeColors;
}) {
  const isFoundation = category === FOUNDATION;
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {categoryLabel(category)}
        </Text>
        {isFoundation && (
          <View style={[styles.startHerePill, { backgroundColor: colors.tintSoft }]}>
            <Text style={[styles.startHereText, { color: colors.accentText }]}>
              START HERE
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.sectionTagline, { color: colors.textMuted }]}>
        {categoryTagline(category)}
      </Text>
    </View>
  );
}

function ProgramCard({
  program,
  colors,
  onPress,
}: {
  program: LibraryProgram;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const meta = isCrossBook(program)
    ? `Cross-book · ${program.sourceProgramIds!.length} books`
    : program.book
      ? `Book · ${program.book.author}`
      : `Program · ${program.guideIds.length} guides`;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityLabel={`${program.title}, ${program.book ? 'book program' : 'program'}`}
      accessibilityHint="Opens the program"
    >
      <View style={styles.cardTitleRow}>
        <View style={[styles.programBadge, { backgroundColor: colors.tintSoft }]}>
          <IconSymbol name="book.fill" size={13} color={colors.accentText} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]}>
          {program.title}
        </Text>
        <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
      </View>
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>{meta}</Text>
      <Text style={[styles.cardBody, { color: colors.textMuted }]} numberOfLines={2}>
        {program.description}
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
        {guide.estimatedMinutes} min read
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
    gap: Space.xl,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  section: { gap: Space.md },
  sectionHeader: { gap: Space.xxs, marginBottom: Space.xxs },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  sectionTitle: { ...Type.h2 },
  sectionTagline: { ...Type.caption },
  startHerePill: {
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  startHereText: { ...Type.micro },
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
  programBadge: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
