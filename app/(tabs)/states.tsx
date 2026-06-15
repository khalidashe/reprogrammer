import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  type ThemeColors,
} from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import {
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  LIBRARY_PROGRAMS,
  domainLabel,
  practiceTypeIcons,
  practiceTypeLabel,
  type AdoptTemplate,
  type EliminateTemplate,
  type LibraryProgram,
} from '@/services/library-content';
import { useContentModals } from '@/components/library/content-modals-provider';
import { SearchBar } from '@/components/library/search-bar';

const CONTENT_MAX_WIDTH = 640;
type TabName = 'behaviors' | 'programs';
type IconName = ComponentProps<typeof IconSymbol>['name'];

export default function BehaviorsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('behaviors');
  const [query, setQuery] = useState('');
  const [, setRefresh] = useState({});
  const { openAdopt, openEliminate, openProgram } = useContentModals();

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const q = query.trim().toLowerCase();

  const filteredAdopt = useMemo(() => {
    if (!q) return ADOPT_TEMPLATES;
    return ADOPT_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        domainLabel(t.domain).toLowerCase().includes(q) ||
        t.pingMessage.toLowerCase().includes(q)
    );
  }, [q]);

  const filteredEliminate = useMemo(() => {
    if (!q) return ELIMINATE_TEMPLATES;
    return ELIMINATE_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        domainLabel(t.domain).toLowerCase().includes(q) ||
        t.pingMessage.toLowerCase().includes(q)
    );
  }, [q]);

  const filteredPrograms = useMemo(() => {
    if (!q) return LIBRARY_PROGRAMS;
    return LIBRARY_PROGRAMS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerWrap, { paddingTop: insets.top + Space.md }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {activeTab === 'behaviors' ? 'Behaviors' : 'Programs'}
          </Text>

          <View style={[styles.toggle, { backgroundColor: colors.surfaceMuted }]}>
            <Pressable
              onPress={() => setActiveTab('behaviors')}
              style={[
                styles.toggleButton,
                activeTab === 'behaviors' && { backgroundColor: colors.tint },
              ]}
              accessibilityLabel="Behaviors tab"
            >
              <IconSymbol
                name="square.stack.fill"
                size={18}
                color={activeTab === 'behaviors' ? colors.textOnBrand : colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('programs')}
              style={[
                styles.toggleButton,
                activeTab === 'programs' && { backgroundColor: colors.tint },
              ]}
              accessibilityLabel="Programs tab"
            >
              <IconSymbol
                name="square.grid.2x2.fill"
                size={18}
                color={activeTab === 'programs' ? colors.textOnBrand : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {activeTab === 'behaviors'
            ? 'A catalog to build good patterns and break bad ones — tap to add.'
            : 'Curated sequences of behaviors built around one goal.'}
        </Text>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={
          activeTab === 'behaviors' ? 'Search behaviors…' : 'Search programs…'
        }
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'behaviors' ? (
          <TemplatesBrowser
            colors={colors}
            adoptTemplates={filteredAdopt}
            eliminateTemplates={filteredEliminate}
            onSelectAdopt={(t) => openAdopt(t.id)}
            onSelectEliminate={(t) => openEliminate(t.id)}
          />
        ) : (
          <ProgramsBrowser
            colors={colors}
            programs={filteredPrograms}
            onSelect={(program) => openProgram(program.id)}
          />
        )}
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  title,
  count,
  colors,
  spaced,
}: {
  title: string;
  count: string;
  colors: ThemeColors;
  spaced?: boolean;
}) {
  return (
    <View style={[styles.sectionHeader, spaced ? { marginTop: Space.lg } : null]}>
      <Text style={[styles.subSectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{count}</Text>
    </View>
  );
}

interface TemplatesBrowserProps {
  colors: ThemeColors;
  adoptTemplates: readonly AdoptTemplate[];
  eliminateTemplates: readonly EliminateTemplate[];
  onSelectAdopt: (t: AdoptTemplate) => void;
  onSelectEliminate: (t: EliminateTemplate) => void;
}

function TemplatesBrowser({
  colors,
  adoptTemplates,
  eliminateTemplates,
  onSelectAdopt,
  onSelectEliminate,
}: TemplatesBrowserProps) {
  if (adoptTemplates.length === 0 && eliminateTemplates.length === 0) {
    return (
      <Text style={[styles.noMatches, { color: colors.textMuted }]}>
        No matches — try a different term.
      </Text>
    );
  }
  return (
    <View>
      {adoptTemplates.length > 0 ? (
        <>
          <SectionHeader
            title="Adopt"
            count={`${adoptTemplates.length} to build`}
            colors={colors}
          />
          <View style={styles.list}>
            {adoptTemplates.map((t) => (
              <TemplateRow
                key={t.id}
                title={t.title}
                domain={domainLabel(t.domain)}
                ping={t.pingMessage}
                practiceType={t.practiceType}
                kind="adopt"
                colors={colors}
                onPress={() => onSelectAdopt(t)}
              />
            ))}
          </View>
        </>
      ) : null}
      {eliminateTemplates.length > 0 ? (
        <>
          <SectionHeader
            title="Eliminate"
            count={`${eliminateTemplates.length} to break`}
            colors={colors}
            spaced={adoptTemplates.length > 0}
          />
          <View style={styles.list}>
            {eliminateTemplates.map((t) => (
              <TemplateRow
                key={t.id}
                title={t.title}
                domain={domainLabel(t.domain)}
                ping={t.pingMessage}
                kind="eliminate"
                colors={colors}
                onPress={() => onSelectEliminate(t)}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function TemplateRow({
  title,
  domain,
  ping,
  practiceType,
  kind,
  colors,
  onPress,
}: {
  title: string;
  domain: string;
  ping: string;
  practiceType?: AdoptTemplate['practiceType'];
  kind: 'adopt' | 'eliminate';
  colors: ThemeColors;
  onPress: () => void;
}) {
  const isEliminate = kind === 'eliminate';
  const icon: IconName = isEliminate
    ? 'minus.circle'
    : practiceType
      ? (practiceTypeIcons(practiceType)[0] as IconName)
      : 'circle';
  const practiceLbl = practiceType ? practiceTypeLabel(practiceType) : null;
  const meta = [domain, practiceLbl].filter(Boolean).join(' · ');
  const badgeBg = isEliminate ? colors.dangerSoft : colors.tintSoft;
  const badgeColor = isEliminate ? colors.danger : colors.accentText;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityLabel={`${title}, ${isEliminate ? 'Eliminate' : 'Adopt'}, ${meta}`}
      accessibilityHint="Opens details to add this behavior"
    >
      <View style={[styles.rowBadge, { backgroundColor: badgeBg }]}>
        <IconSymbol name={icon} size={18} color={badgeColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.textMuted }]} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={[styles.rowPing, { color: colors.textMuted }]} numberOfLines={1}>
          {ping}
        </Text>
      </View>
      <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

interface ProgramsBrowserProps {
  colors: ThemeColors;
  programs: readonly LibraryProgram[];
  onSelect: (program: LibraryProgram) => void;
}

function ProgramsBrowser({ colors, programs, onSelect }: ProgramsBrowserProps) {
  if (programs.length === 0) {
    return (
      <Text style={[styles.noMatches, { color: colors.textMuted }]}>
        No matches — try a different term.
      </Text>
    );
  }
  return (
    <View style={styles.list}>
      {programs.map((program) => (
        <Pressable
          key={program.id}
          onPress={() => onSelect(program)}
          style={[styles.programCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityLabel={`${program.title} program, ${program.guideIds.length} guides`}
          accessibilityHint="Opens program details"
        >
          <View style={styles.programTop}>
            <View style={[styles.rowBadge, { backgroundColor: colors.tintSoft }]}>
              <IconSymbol name="book.fill" size={18} color={colors.accentText} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.programName, { color: colors.text }]}>
                {program.title}
              </Text>
              <Text style={[styles.programMeta, { color: colors.textMuted }]}>
                {program.book
                  ? `Book · ${program.book.author}`
                  : `${program.guideIds.length} guides${program.sequence ? ` · ${program.sequence.length}-step sequence` : ''}`}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
          </View>
          <Text
            style={[styles.programDescription, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {program.description}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...Type.h1 },
  subtitle: { ...Type.caption, marginTop: Space.xs },
  toggle: {
    flexDirection: 'row',
    padding: Space.xs,
    borderRadius: Radius.md,
    gap: Space.xs,
  },
  toggleButton: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    minWidth: 44,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: Space.lg,
    paddingTop: Space.md,
  },
  noMatches: {
    ...Type.body,
    textAlign: 'center',
    paddingVertical: Space.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Space.sm,
  },
  subSectionTitle: { ...Type.h2 },
  sectionCount: { ...Type.caption },
  list: { gap: Space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 68,
  },
  rowBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 1 },
  rowTitle: { ...Type.bodyBold },
  rowMeta: { ...Type.micro, letterSpacing: 0, marginTop: 1 },
  rowPing: { ...Type.caption, marginTop: 1 },
  programCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.sm,
  },
  programTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  programName: { ...Type.bodyBold },
  programMeta: { ...Type.micro, letterSpacing: 0, marginTop: 1 },
  programDescription: { ...Type.caption },
});
