import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, type ThemeColors } from '@/constants/theme';
import useStore from '@/store/useStore';
import {
  LIBRARY_GUIDES,
  LIBRARY_PACKAGES,
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  CORE_STORIES,
  SCIENCE_SECTION,
  domainLabel,
  type LibraryGuide,
  type LibraryPackage,
  type AdoptTemplate,
  type EliminateTemplate,
  type CoreStory,
} from '@/services/library-content';
import { GROUND_RULES, type GroundRule } from '@/services/ground-rules';

type Tab = 'core' | 'programs' | 'states' | 'packages';

export default function LibraryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tab, setTab] = useState<Tab>('core');
  const { behaviors } = useStore();

  const addedTitles = new Set(behaviors.map((b) => b.title));

  const goToGuide = (id: string) =>
    router.push({ pathname: '/library/guide/[id]', params: { id } });
  const goToState = (id: string, kind: 'adopt' | 'eliminate') =>
    router.push({ pathname: '/library/state/[id]', params: { id, kind } });
  const goToCore = (id: string) =>
    router.push({ pathname: '/library/core/[id]', params: { id } });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {LIBRARY_GUIDES.length} guides · {ADOPT_TEMPLATES.length} adopt · {ELIMINATE_TEMPLATES.length} eliminate
        </Text>
      </View>

      <View style={styles.tabRow}>
        {(['core', 'programs', 'states', 'packages'] as const).map((t) => (
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
              {t === 'core'
                ? 'Core'
                : t === 'programs'
                  ? 'Programs'
                  : t === 'states'
                    ? 'States'
                    : 'Packages'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === 'core' && (
          <View style={styles.section}>
            <Text style={[styles.subSectionTitle, { color: colors.text }]}>Ground Rules</Text>
            {GROUND_RULES.map((rule, idx) => (
              <GroundRuleCard key={rule.id} rule={rule} index={idx + 1} colors={colors} />
            ))}
            <Text
              style={[styles.subSectionTitle, { color: colors.text, marginTop: 20 }]}
            >
              Stories
            </Text>
            {CORE_STORIES.map((story) => (
              <CoreStoryCard
                key={story.id}
                story={story}
                colors={colors}
                onPress={() => goToCore(story.id)}
              />
            ))}
            <Text
              style={[styles.subSectionTitle, { color: colors.text, marginTop: 20 }]}
            >
              The Science
            </Text>
            <Pressable
              onPress={() => goToCore('science')}
              style={[
                styles.card,
                { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {SCIENCE_SECTION.title}
              </Text>
              <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={3}>
                {SCIENCE_SECTION.intro}
              </Text>
            </Pressable>
          </View>
        )}

        {tab === 'programs' && (
          <View style={styles.section}>
            {LIBRARY_GUIDES.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                colors={colors}
                onPress={() => goToGuide(guide.id)}
              />
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
                added={addedTitles.has(t.title)}
                colors={colors}
                onPress={() => goToState(t.id, 'adopt')}
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
                added={addedTitles.has(t.title)}
                colors={colors}
                onPress={() => goToState(t.id, 'eliminate')}
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

function GroundRuleCard({
  rule,
  index,
  colors,
}: {
  rule: GroundRule;
  index: number;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.ruleCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.ruleHeader}>
        <View style={[styles.ruleNumber, { backgroundColor: colors.tint }]}>
          <Text style={[styles.ruleNumberText, { color: colors.textOnBrand }]}>{index}</Text>
        </View>
        <Text style={[styles.ruleTitle, { color: colors.text }]}>{rule.title}</Text>
      </View>
      <Text style={[styles.ruleBody, { color: colors.text }]}>{rule.body}</Text>
      <Text style={[styles.ruleCitation, { color: colors.textMuted }]}>{rule.citation}</Text>
    </View>
  );
}

function CoreStoryCard({
  story,
  colors,
  onPress,
}: {
  story: CoreStory;
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
    >
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>Story {story.index}</Text>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{story.title}</Text>
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={2}>
        {story.principle}
      </Text>
    </Pressable>
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

function TemplateCard({
  title,
  domain,
  message,
  added,
  colors,
  onPress,
}: {
  title: string;
  domain: string;
  message: string;
  added: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
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
        {added && (
          <View style={[styles.addedPill, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.addedPillText, { color: colors.textMuted }]}>Added</Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardBody, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
    </Pressable>
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
  addedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addedPillText: { fontSize: 11, fontWeight: '700' },
  ruleCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  ruleBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  ruleCitation: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});
