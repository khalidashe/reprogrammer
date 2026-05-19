import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, type ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { useCallback, useState } from 'react';
import type { Behavior } from '@/types';

type TabName = 'states' | 'packages';

interface Package {
  id: string;
  name: string;
  category: string;
  stateCount: number;
  source?: 'therapist' | 'curated';
}

/**
 * Curated packages — placeholder content that demonstrates the planned shape
 * of REP-32 (assessment-curated) and REP-33 (therapist-curated) packages.
 * Wire to a real data source once the backend is available.
 */
const SAMPLE_PACKAGES: Package[] = [
  {
    id: 'pkg-presence',
    name: 'Quiet Presence',
    category: 'Mindfulness',
    stateCount: 6,
    source: 'curated',
  },
  {
    id: 'pkg-anxiety',
    name: 'Calm Under Stress',
    category: 'Anxiety',
    stateCount: 8,
    source: 'curated',
  },
  {
    id: 'pkg-confidence',
    name: 'Daily Confidence',
    category: 'Self-esteem',
    stateCount: 5,
    source: 'curated',
  },
];

export default function StatesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviors } = useStore();
  const [activeTab, setActiveTab] = useState<TabName>('states');
  const [, setRefresh] = useState({});
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const allStates = behaviors.filter((b) => !b.hidden);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with tab toggle (Diamond = States | Square = Packages) */}
      <View style={styles.header}>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'states' ? (
          <StatesGrid
            states={allStates}
            colors={colors}
            onSelect={(id) => router.push(`/behavior/${id}`)}
            onCreate={() => router.push('/create')}
          />
        ) : (
          <PackagesList packages={SAMPLE_PACKAGES} colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

interface StatesGridProps {
  states: Behavior[];
  colors: ThemeColors;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

function StatesGrid({ states, colors, onSelect, onCreate }: StatesGridProps) {
  if (states.length === 0) {
    return (
      <View style={[styles.emptyState, { borderColor: colors.border }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No states yet</Text>
        <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
          States are the behaviors and habits you choose to practice — like &quot;sit up
          straight&quot; or &quot;take a breath before replying.&quot;
        </Text>
        <Pressable
          onPress={onCreate}
          style={[styles.createCta, { backgroundColor: colors.tint }]}
        >
          <Text style={[styles.createCtaText, { color: colors.textOnBrand }]}>
            Create your first state
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {states.map((s) => {
        const category = s.tags?.[0] ?? 'General';
        const solo = (s.behaviorsToEliminate?.length ?? 0) > 0 ? 'Partner' : 'Solo';
        return (
          <Pressable
            key={s.id}
            onPress={() => onSelect(s.id)}
            style={[
              styles.stateCard,
              { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
            ]}
          >
            <Text
              numberOfLines={2}
              style={[styles.stateName, { color: colors.text }]}
            >
              {s.title}
            </Text>
            <Text style={[styles.stateMeta, { color: colors.textMuted }]}>
              {category}
            </Text>
            <Text style={[styles.stateMeta, { color: colors.textMuted }]}>{solo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface PackagesListProps {
  packages: Package[];
  colors: ThemeColors;
}

function PackagesList({ packages, colors }: PackagesListProps) {
  return (
    <View style={styles.packageList}>
      <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
        Curated collections of states — recommended for your goals or assigned by your
        therapist.
      </Text>
      {packages.map((p) => (
        <Pressable
          key={p.id}
          style={[
            styles.packageCard,
            { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
          ]}
        >
          <View style={styles.packageHeader}>
            <Text style={[styles.packageName, { color: colors.text }]}>{p.name}</Text>
            {p.source === 'therapist' && (
              <View style={[styles.sourceBadge, { backgroundColor: colors.infoSoft }]}>
                <Text style={[styles.sourceBadgeText, { color: colors.info }]}>Therapist</Text>
              </View>
            )}
          </View>
          <Text style={[styles.packageMeta, { color: colors.textMuted }]}>
            {p.category} · {p.stateCount} states
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  toggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stateCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  stateName: {
    fontSize: 16,
    fontWeight: '700',
  },
  stateMeta: {
    fontSize: 12,
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createCta: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  createCtaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  packageList: {
    gap: 12,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  packageCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageName: {
    fontSize: 16,
    fontWeight: '700',
  },
  packageMeta: {
    fontSize: 13,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
