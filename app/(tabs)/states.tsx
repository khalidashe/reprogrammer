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
import { useCallback, useMemo, useState } from 'react';
import {
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  LIBRARY_PACKAGES,
  domainLabel,
  type AdoptTemplate,
  type EliminateTemplate,
  type LibraryPackage,
} from '@/services/library-content';
import { useContentModals } from '@/components/library/content-modals-provider';
import { SearchBar } from '@/components/library/search-bar';

type TabName = 'states' | 'packages';

export default function StatesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('states');
  const [query, setQuery] = useState('');
  const [, setRefresh] = useState({});
  const { openAdopt, openEliminate, openPackage } = useContentModals();

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

  const filteredPackages = useMemo(() => {
    if (!q) return LIBRARY_PACKAGES;
    return LIBRARY_PACKAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Space.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {activeTab === 'states' ? 'States' : 'Packages'}
        </Text>

        <View style={[styles.toggle, { backgroundColor: colors.surfaceMuted }]}>
          <Pressable
            onPress={() => setActiveTab('states')}
            style={[
              styles.toggleButton,
              activeTab === 'states' && { backgroundColor: colors.tint },
            ]}
            accessibilityLabel="States tab"
          >
            <IconSymbol
              name="square.stack.fill"
              size={18}
              color={activeTab === 'states' ? colors.textOnBrand : colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('packages')}
            style={[
              styles.toggleButton,
              activeTab === 'packages' && { backgroundColor: colors.tint },
            ]}
            accessibilityLabel="Packages tab"
          >
            <IconSymbol
              name="square.grid.2x2.fill"
              size={18}
              color={activeTab === 'packages' ? colors.textOnBrand : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={
          activeTab === 'states' ? 'Search states…' : 'Search packages…'
        }
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'states' ? (
          <TemplatesBrowser
            colors={colors}
            adoptTemplates={filteredAdopt}
            eliminateTemplates={filteredEliminate}
            onSelectAdopt={(t) => openAdopt(t.id)}
            onSelectEliminate={(t) => openEliminate(t.id)}
          />
        ) : (
          <PackagesBrowser
            colors={colors}
            packages={filteredPackages}
            onSelect={(pkg) => openPackage(pkg.id)}
          />
        )}
      </ScrollView>
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
    <View style={styles.section}>
      {adoptTemplates.length > 0 ? (
        <>
          <Text style={[styles.subSectionTitle, { color: colors.text }]}>
            Adopt
          </Text>
          <View style={styles.grid}>
            {adoptTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                title={t.title}
                domain={domainLabel(t.domain)}
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
          <Text
            style={[
              styles.subSectionTitle,
              {
                color: colors.text,
                marginTop: adoptTemplates.length > 0 ? 16 : 0,
              },
            ]}
          >
            Eliminate
          </Text>
          <View style={styles.grid}>
            {eliminateTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                title={t.title}
                domain={domainLabel(t.domain)}
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

function TemplateCard({
  title,
  domain,
  kind,
  colors,
  onPress,
}: {
  title: string;
  domain: string;
  kind: 'adopt' | 'eliminate';
  colors: ThemeColors;
  onPress: () => void;
}) {
  const isEliminate = kind === 'eliminate';
  const bg = isEliminate ? colors.warningSoft : colors.tintSoft;
  const border = isEliminate ? colors.warning : colors.tintMuted;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.gridCard,
        { backgroundColor: bg, borderColor: border },
      ]}
      accessibilityLabel={`${title}, ${kind === 'eliminate' ? 'Eliminate' : 'Adopt'}, ${domain}`}
      accessibilityHint="Opens template details"
    >
      <Text
        numberOfLines={3}
        style={[styles.gridCardTitle, { color: colors.text }]}
      >
        {title}
      </Text>
      <Text style={[styles.gridCardMeta, { color: colors.textMuted }]}>
        {domain}
      </Text>
    </Pressable>
  );
}

interface PackagesBrowserProps {
  colors: ThemeColors;
  packages: readonly LibraryPackage[];
  onSelect: (pkg: LibraryPackage) => void;
}

function PackagesBrowser({ colors, packages, onSelect }: PackagesBrowserProps) {
  return (
    <View style={styles.packageList}>
      <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
        Curated collections of guides.
      </Text>
      {packages.length === 0 ? (
        <Text style={[styles.noMatches, { color: colors.textMuted }]}>
          No matches — try a different term.
        </Text>
      ) : (
        packages.map((pkg) => (
          <Pressable
            key={pkg.id}
            onPress={() => onSelect(pkg)}
            style={[
              styles.packageCard,
              { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
            ]}
            accessibilityLabel={`${pkg.title} package, ${pkg.guideIds.length} guides`}
            accessibilityHint="Opens package details"
          >
            <Text style={[styles.packageName, { color: colors.text }]}>
              {pkg.title}
            </Text>
            <Text style={[styles.packageMeta, { color: colors.textMuted }]}>
              {pkg.guideIds.length} guides
            </Text>
            <Text
              style={[styles.packageDescription, { color: colors.text }]}
              numberOfLines={2}
            >
              {pkg.description}
            </Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...Type.h1 },
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
    alignItems: 'center',
  },
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
  section: { gap: Space.sm },
  subSectionTitle: { ...Type.h2, marginBottom: Space.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  gridCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.md,
    justifyContent: 'space-between',
  },
  gridCardTitle: { ...Type.bodyBold },
  gridCardMeta: { ...Type.caption },
  packageList: { gap: Space.md },
  sectionHint: { ...Type.caption, marginBottom: Space.xs },
  packageCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.lg,
    gap: Space.xs,
  },
  packageName: { ...Type.h2 },
  packageMeta: { ...Type.caption },
  packageDescription: { ...Type.caption, marginTop: Space.xs },
});
