import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, type ThemeColors } from '@/constants/theme';
import useStore from '@/store/useStore';
import { generateUUID } from '@/utils/uuid';
import { scheduleForBehavior } from '@/services/notifications';
import { INITIAL_LEVEL, INITIAL_LAST_LEVELUP_STREAK } from '@/services/levels';
import {
  LIBRARY_GUIDES,
  LIBRARY_PACKAGES,
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  domainLabel,
  type LibraryGuide,
  type LibraryPackage,
  type AdoptTemplate,
  type EliminateTemplate,
} from '@/services/library-content';
import type { Behavior } from '@/types';

type Tab = 'programs' | 'states' | 'packages';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tab, setTab] = useState<Tab>('programs');
  const { behaviors, addBehavior } = useStore();

  const addedTemplateIds = useMemo(
    () => new Set(behaviors.map((b) => b.title)),
    [behaviors]
  );

  const handleAddAdopt = async (template: AdoptTemplate) => {
    const behavior: Behavior = {
      id: generateUUID(),
      kind: 'adopt',
      title: template.title,
      pingMessage: template.pingMessage,
      practiceType: template.practiceType,
      domain: template.domain,
      libraryGuideId: template.libraryGuideId,
      window: template.window,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      intervalMinutes: template.intervalMinutes,
      level: INITIAL_LEVEL,
      lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
      createdAt: Date.now(),
      hidden: false,
      bookmarked: false,
    };
    await addBehavior(behavior);
    await scheduleForBehavior(behavior);
    Alert.alert('Added', `"${template.title}" is now in your active states.`);
  };

  const handleAddEliminate = async (template: EliminateTemplate) => {
    const replacement = behaviors.find(
      (b) => b.kind === 'adopt' && (b.id === template.replacementAdoptId || b.title === ADOPT_TEMPLATES.find((a) => a.id === template.replacementAdoptId)?.title)
    );
    if (!replacement) {
      const adoptTemplate = ADOPT_TEMPLATES.find((a) => a.id === template.replacementAdoptId);
      Alert.alert(
        'Add replacement first',
        `"${template.title}" needs an active "${adoptTemplate?.title ?? 'replacement'}" Adopt state. Add that one first, then come back.`
      );
      return;
    }
    const behavior: Behavior = {
      id: generateUUID(),
      kind: 'eliminate',
      title: template.title,
      pingMessage: template.pingMessage,
      domain: template.domain,
      replacementStateId: replacement.id,
      window: { from: '09:00', to: '21:00' },
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      intervalMinutes: 30,
      level: INITIAL_LEVEL,
      lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
      createdAt: Date.now(),
      hidden: false,
      bookmarked: false,
    };
    await addBehavior(behavior);
    await scheduleForBehavior(behavior);
    Alert.alert('Added', `"${template.title}" is now in your active states.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          16 guides, 17 adopt templates, 12 eliminate templates.
        </Text>
      </View>

      <View style={styles.tabRow}>
        {(['programs', 'states', 'packages'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tabButton,
              {
                backgroundColor: tab === t ? colors.tint : 'transparent',
                borderColor: tab === t ? colors.tint : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                { color: tab === t ? colors.textOnBrand : colors.text },
              ]}
            >
              {t === 'programs' ? 'Programs' : t === 'states' ? 'States' : 'Packages'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === 'programs' && (
          <View style={styles.section}>
            {LIBRARY_GUIDES.map((guide) => (
              <GuideCard key={guide.id} guide={guide} colors={colors} />
            ))}
          </View>
        )}

        {tab === 'states' && (
          <View style={styles.section}>
            <Text style={[styles.subSectionTitle, { color: colors.text }]}>Adopt</Text>
            {ADOPT_TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                title={t.title}
                domain={domainLabel(t.domain)}
                message={t.pingMessage}
                added={addedTemplateIds.has(t.title)}
                colors={colors}
                onAdd={() => handleAddAdopt(t)}
              />
            ))}
            <Text
              style={[styles.subSectionTitle, { color: colors.text, marginTop: 16 }]}
            >
              Eliminate
            </Text>
            {ELIMINATE_TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                title={t.title}
                domain={domainLabel(t.domain)}
                message={t.pingMessage}
                added={addedTemplateIds.has(t.title)}
                colors={colors}
                onAdd={() => handleAddEliminate(t)}
              />
            ))}
          </View>
        )}

        {tab === 'packages' && (
          <View style={styles.section}>
            {LIBRARY_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} colors={colors} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function GuideCard({ guide, colors }: { guide: LibraryGuide; colors: ThemeColors }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{guide.title}</Text>
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
        {domainLabel(guide.domain)} · {guide.estimatedMinutes} min read
      </Text>
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={3}>
        {guide.summary}
      </Text>
    </View>
  );
}

function TemplateCard({
  title,
  domain,
  message,
  added,
  colors,
  onAdd,
}: {
  title: string;
  domain: string;
  message: string;
  added: boolean;
  colors: ThemeColors;
  onAdd: () => void;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.cardMeta, { color: colors.textMuted }]}>{domain}</Text>
        </View>
        <Pressable
          onPress={onAdd}
          disabled={added}
          style={[
            styles.addButton,
            {
              backgroundColor: added ? colors.surfaceMuted : colors.tint,
            },
          ]}
        >
          <Text
            style={[
              styles.addButtonText,
              { color: added ? colors.textMuted : colors.textOnBrand },
            ]}
          >
            {added ? 'Added' : 'Add'}
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

function PackageCard({ pkg, colors }: { pkg: LibraryPackage; colors: ThemeColors }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{pkg.title}</Text>
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
        {pkg.guideIds.length} guides
      </Text>
      <Text style={[styles.cardBody, { color: colors.text }]}>{pkg.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabButtonText: { fontSize: 13, fontWeight: '600' },
  scrollContent: { padding: 16, paddingTop: 8, gap: 12 },
  section: { gap: 10 },
  subSectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 11, marginTop: 2 },
  cardBody: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: { fontSize: 12, fontWeight: '700' },
});
