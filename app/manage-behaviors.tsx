import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, type ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { deriveStage, stageLabel } from '@/services/levels';
import { cancelForBehavior, rescheduleAll } from '@/services/notifications';
import type { Behavior } from '@/types';

const CONTENT_MAX_WIDTH = 640;
type Tab = 'bookmarked' | 'archived';

export default function ManageBehaviorsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'archived' ? 'archived' : 'bookmarked');
  const { behaviors, getStreak, updateBehavior, deleteBehavior } = useStore();
  const [, setRefresh] = useState({});

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const bookmarked = behaviors.filter((b) => b.bookmarked);
  const archived = behaviors.filter((b) => b.hidden);
  const rows = tab === 'archived' ? archived : bookmarked;

  const openDetail = (b: Behavior) =>
    router.push({ pathname: '/behavior/[id]', params: { id: b.id } });

  const handleRestore = async (b: Behavior) => {
    await updateBehavior({ ...b, hidden: false });
    await rescheduleAll({ force: true });
  };

  const handleDelete = (b: Behavior) => {
    Alert.alert(
      'Delete behavior',
      `Permanently delete "${b.title}" and all its history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelForBehavior(b.id);
            await deleteBehavior(b.id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.segmentWrap}>
        <View style={[styles.segment, { backgroundColor: colors.surfaceMuted }]}>
          <SegmentButton
            label={`Bookmarked${bookmarked.length ? ` (${bookmarked.length})` : ''}`}
            active={tab === 'bookmarked'}
            colors={colors}
            onPress={() => setTab('bookmarked')}
          />
          <SegmentButton
            label={`Archived${archived.length ? ` (${archived.length})` : ''}`}
            active={tab === 'archived'}
            colors={colors}
            onPress={() => setTab('archived')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {rows.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            {tab === 'archived'
              ? 'No archived behaviors. Archiving one from its detail screen parks it here with its history intact.'
              : 'No bookmarked behaviors yet. Tap “Bookmark” on a behavior to save it here.'}
          </Text>
        ) : (
          rows.map((b) => (
            <BehaviorRow
              key={b.id}
              behavior={b}
              streak={getStreak(b.id)}
              archived={tab === 'archived'}
              colors={colors}
              onOpen={() => openDetail(b)}
              onRestore={() => handleRestore(b)}
              onDelete={() => handleDelete(b)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function SegmentButton({
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
      style={[styles.segmentBtn, active && { backgroundColor: colors.surface }]}
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text
        style={[styles.segmentBtnText, { color: active ? colors.text : colors.textMuted }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BehaviorRow({
  behavior,
  streak,
  archived,
  colors,
  onOpen,
  onRestore,
  onDelete,
}: {
  behavior: Behavior;
  streak: number;
  archived: boolean;
  colors: ThemeColors;
  onOpen: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const kind = behavior.kind === 'eliminate' ? 'Eliminate' : 'Adopt';
  const stage = stageLabel(deriveStage(behavior.level, streak));
  const meta =
    `${kind} · ${stage} · ${streak}d streak` +
    (behavior.hidden && !archived ? ' · Archived' : '');
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        style={styles.rowMain}
        onPress={onOpen}
        accessibilityLabel={`${behavior.title}, ${meta}`}
        accessibilityHint="Opens behavior details"
      >
        <View style={[styles.badge, { backgroundColor: colors.tintSoft }]}>
          <IconSymbol
            name={archived ? 'archivebox.fill' : 'bookmark.fill'}
            size={16}
            color={colors.accentText}
          />
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
            {behavior.title}
          </Text>
          <Text style={[styles.rowMeta, { color: colors.textMuted }]} numberOfLines={1}>
            {meta}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={colors.textMuted} />
      </Pressable>
      {archived ? (
        <View style={styles.rowActions}>
          <Pressable
            onPress={onRestore}
            style={[styles.actionBtn, { backgroundColor: colors.tintSoft }]}
            accessibilityLabel={`Restore ${behavior.title}`}
          >
            <IconSymbol name="play.fill" size={13} color={colors.accentText} />
            <Text style={[styles.actionBtnText, { color: colors.accentText }]}>Restore</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={[styles.actionBtn, { backgroundColor: colors.dangerSoft }]}
            accessibilityLabel={`Delete ${behavior.title}`}
          >
            <IconSymbol name="trash.fill" size={13} color={colors.danger} />
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmentWrap: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    paddingBottom: Space.sm,
  },
  segment: {
    flexDirection: 'row',
    padding: Space.xs,
    borderRadius: Radius.md,
    gap: Space.xs,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  segmentBtnText: { ...Type.bodyBold },
  scrollContent: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: Space.lg,
    paddingTop: Space.sm,
    gap: Space.sm,
  },
  empty: {
    ...Type.body,
    textAlign: 'center',
    paddingVertical: Space.xxl,
  },
  row: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.sm,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { ...Type.bodyBold },
  rowMeta: { ...Type.micro, letterSpacing: 0 },
  rowActions: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.xs,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    minHeight: 40,
  },
  actionBtnText: { ...Type.caption, fontWeight: '600' },
});
