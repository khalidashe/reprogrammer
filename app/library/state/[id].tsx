import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ADOPT_TEMPLATES } from '@/services/library/adopt';
import { ELIMINATE_TEMPLATES } from '@/services/library/eliminate';
import { LIBRARY_GUIDES } from '@/services/library/guides';
import { domainLabel } from '@/services/library/types';
import useStore from '@/store/useStore';
import { generateUUID } from '@/utils/uuid';
import { scheduleForBehavior } from '@/services/notifications';
import { INITIAL_LEVEL, INITIAL_LAST_LEVELUP_STREAK } from '@/services/levels';
import type { Behavior } from '@/types';
import { StringListBlock, ProseBlock } from '@/components/library/GuideBody';

export default function StateDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: 'adopt' | 'eliminate' }>();
  const { behaviors, addBehavior } = useStore();

  const adopt = ADOPT_TEMPLATES.find((t) => t.id === id);
  const eliminate = ELIMINATE_TEMPLATES.find((t) => t.id === id);
  const template = adopt ?? eliminate;
  const isAdopt = !!adopt || kind === 'adopt';

  if (!template) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'State' }} />
        <Text style={[styles.errorText, { color: colors.text }]}>Template not found</Text>
      </View>
    );
  }

  const guideId = isAdopt ? adopt?.libraryGuideId : eliminate?.relatedGuideIds?.[0];
  const guide = guideId ? LIBRARY_GUIDES.find((g) => g.id === guideId) : undefined;

  const added = behaviors.some((b) => b.title === template.title);

  const handleAddAdopt = async () => {
    if (!adopt) return;
    const behavior: Behavior = {
      id: generateUUID(),
      kind: 'adopt',
      title: adopt.title,
      pingMessage: adopt.pingMessage,
      practiceType: adopt.practiceType,
      domain: adopt.domain,
      libraryGuideId: adopt.libraryGuideId,
      window: adopt.window,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      intervalMinutes: adopt.intervalMinutes,
      level: INITIAL_LEVEL,
      lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
      createdAt: Date.now(),
      hidden: false,
      bookmarked: false,
    };
    await addBehavior(behavior);
    await scheduleForBehavior(behavior);
    Alert.alert('Added', `"${adopt.title}" is now in your active states.`);
  };

  const handleAddEliminate = async () => {
    if (!eliminate) return;
    const replacementAdopt = ADOPT_TEMPLATES.find((a) => a.id === eliminate.replacementAdoptId);
    const replacement = behaviors.find(
      (b) =>
        b.kind === 'adopt' &&
        (b.id === eliminate.replacementAdoptId || b.title === replacementAdopt?.title)
    );
    if (!replacement) {
      Alert.alert(
        'Add replacement first',
        `"${eliminate.title}" needs an active "${replacementAdopt?.title ?? 'replacement'}" Adopt state. Add that one first, then come back.`
      );
      return;
    }
    const behavior: Behavior = {
      id: generateUUID(),
      kind: 'eliminate',
      title: eliminate.title,
      pingMessage: eliminate.pingMessage,
      domain: eliminate.domain,
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
    Alert.alert('Added', `"${eliminate.title}" is now in your active states.`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: template.title }} />
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.tint }]}>
          {isAdopt ? 'Adopt' : 'Eliminate'} · {domainLabel(template.domain)}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{template.title}</Text>

        <View
          style={[
            styles.pingBox,
            { borderColor: colors.tintMuted, backgroundColor: colors.tintSoft },
          ]}
        >
          <Text style={[styles.pingLabel, { color: colors.textMuted }]}>PING MESSAGE</Text>
          <Text style={[styles.pingText, { color: colors.text }]}>{template.pingMessage}</Text>
        </View>

        {adopt && (
          <>
            <ProseBlock title="Description" text={adopt.description} colors={colors} />
            {adopt.tactics && adopt.tactics.length > 0 && (
              <StringListBlock title="Tactics" items={adopt.tactics} colors={colors} />
            )}
            {adopt.whyItWorks && (
              <ProseBlock title="Why It Works" text={adopt.whyItWorks} colors={colors} />
            )}
            {adopt.resources && adopt.resources.length > 0 && (
              <StringListBlock title="Resources" items={adopt.resources} colors={colors} />
            )}
          </>
        )}

        {eliminate && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Frequency</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>{eliminate.frequency}</Text>
            </View>
            <StringListBlock title="Triggers" items={eliminate.triggers} colors={colors} />
            {eliminate.whatItSoundsLike && (
              <ProseBlock
                title="What It Sounds Like"
                text={eliminate.whatItSoundsLike}
                colors={colors}
              />
            )}
            {eliminate.whyItsCostly && (
              <ProseBlock
                title="Why It’s Costly"
                text={eliminate.whyItsCostly}
                colors={colors}
              />
            )}
            {eliminate.replacementNote && (
              <ProseBlock
                title="Replacement"
                text={eliminate.replacementNote}
                colors={colors}
              />
            )}
          </>
        )}

        {guide && (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/library/guide/[id]', params: { id: guide.id } })
            }
            style={[
              styles.guideLink,
              { borderColor: colors.tintMuted, backgroundColor: colors.tintSoft },
            ]}
          >
            <Text style={[styles.guideLinkLabel, { color: colors.textMuted }]}>
              READ THE PROGRAM
            </Text>
            <Text style={[styles.guideLinkTitle, { color: colors.text }]}>{guide.title}</Text>
            <Text style={[styles.guideLinkSummary, { color: colors.textMuted }]} numberOfLines={2}>
              {guide.summary}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={isAdopt ? handleAddAdopt : handleAddEliminate}
          disabled={added}
          style={[
            styles.addButton,
            { backgroundColor: added ? colors.surfaceMuted : colors.tint },
          ]}
        >
          <Text
            style={[
              styles.addButtonText,
              { color: added ? colors.textMuted : colors.textOnBrand },
            ]}
          >
            {added ? 'Already Active' : `Add to My States`}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  pingBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
    gap: 4,
  },
  pingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  pingText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  guideLink: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    gap: 4,
  },
  guideLinkLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  guideLinkTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  guideLinkSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    paddingTop: 60,
    fontSize: 16,
  },
});
