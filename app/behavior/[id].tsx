import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius, type ThemeColors } from '@/constants/theme';
import useStore from '@/store/useStore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState, type ComponentProps } from 'react';
import { cancelForBehavior, rescheduleAll, sendTestNotification } from '@/services/notifications';
import type { CheckIn } from '@/types';
import { endOfLocalDay, isBehaviorPaused } from '@/services/scheduler-core';
import { deriveStage, stageLabel } from '@/services/levels';
import { lastNDaysStatus } from '@/services/consistency';
import { useFeedback } from '@/components/ui/feedback';
import { useContentModals } from '@/components/library/content-modals-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatPausedUntil(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BehaviorDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  const {
    behaviors,
    checkIns,
    getStreak,
    deleteBehavior,
    updateBehavior,
    updateCheckIn,
    deleteCheckIn,
  } = useStore();
  const { openGuide } = useContentModals();
  const { showSheet, showToast } = useFeedback();
  const [, setRefresh] = useState({});

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const behavior = behaviors.find((b) => b.id === (id as string));
  const recentCheckIns = (behavior
    ? checkIns.filter((c) => c.behaviorId === behavior.id).sort((a, b) => b.at - a.at)
    : []
  ).slice(0, 20);

  if (!behavior) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Behavior not found
        </Text>
      </View>
    );
  }

  const streak = getStreak(behavior.id);
  const isEliminate = behavior.kind === 'eliminate';

  // Last 14 days of consistency (oldest → today).
  const last14 = lastNDaysStatus(checkIns, behavior.id, 14);

  const handleEdit = () => {
    router.push({ pathname: '/create', params: { id: behavior.id } });
  };

  const handleDelete = () => {
    showSheet({
      title: 'Delete behavior',
      message: 'Are you sure? This cannot be undone.',
      actions: [
        { label: 'Cancel', style: 'cancel' },
        {
          label: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelForBehavior(behavior.id);
            await deleteBehavior(behavior.id);
            router.back();
          },
        },
      ],
    });
  };

  const handleToggleBookmark = async () => {
    await updateBehavior({
      ...behavior,
      bookmarked: !behavior.bookmarked,
    });
  };

  const handleArchive = async () => {
    await updateBehavior({
      ...behavior,
      hidden: true,
    });
    router.back();
  };

  const handleCheckInLongPress = (item: CheckIn) => {
    const yesLabel = isEliminate ? 'Caught it' : 'Practiced';
    const triedLabel = isEliminate ? 'Struggled' : 'Showed up';
    const noLabel = 'Skipped';
    const change = (next: 'yes' | 'tried' | 'no') => {
      if (next === item.result) return;
      void updateCheckIn({ ...item, result: next });
    };
    showSheet({
      title: 'Change this check-in',
      actions: [
        ...(item.result !== 'yes' ? [{ label: yesLabel, onPress: () => change('yes') }] : []),
        ...(item.result !== 'tried' ? [{ label: triedLabel, onPress: () => change('tried') }] : []),
        ...(item.result !== 'no' ? [{ label: noLabel, onPress: () => change('no') }] : []),
        {
          label: 'Delete',
          style: 'destructive' as const,
          onPress: () => void deleteCheckIn(item.id),
        },
        { label: 'Cancel', style: 'cancel' as const },
      ],
    });
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification(behavior);
      showToast('Test notification sent — check in 1 second');
    } catch {
      showToast('Failed to send test notification');
    }
  };

  const isPaused = isBehaviorPaused(behavior);

  const pauseUntil = (resumeAt: number) =>
    Promise.all([
      updateBehavior({ ...behavior, pausedUntil: resumeAt, pausedIndefinitely: false }),
      cancelForBehavior(behavior.id),
    ]);

  const pauseIndefinitely = () =>
    Promise.all([
      updateBehavior({ ...behavior, pausedUntil: undefined, pausedIndefinitely: true }),
      cancelForBehavior(behavior.id),
    ]);

  const handlePausePress = () => {
    if (isPaused) {
      const pausedMsg = behavior.pausedIndefinitely
        ? `${behavior.title} is paused until you turn it back on.`
        : `${behavior.title} is paused until ${formatPausedUntil(behavior.pausedUntil!)}.`;
      showSheet({
        title: 'Resume now?',
        message: pausedMsg,
        actions: [
          {
            label: 'Resume now',
            onPress: () =>
              Promise.all([
                updateBehavior({ ...behavior, pausedUntil: undefined, pausedIndefinitely: false }),
                rescheduleAll({ force: true }),
              ]),
          },
          { label: 'Stay paused', style: 'cancel' },
        ],
      });
      return;
    }

    showSheet({
      title: 'Pause this behavior',
      message:
        'Reminders stop; your streak and history stay. Pick a length — you can resume any time.',
      actions: [
        { label: 'Until tonight', onPress: () => pauseUntil(endOfLocalDay()) },
        { label: '1 day', onPress: () => pauseUntil(Date.now() + DAY_MS) },
        { label: '3 days', onPress: () => pauseUntil(Date.now() + 3 * DAY_MS) },
        { label: '1 week', onPress: () => pauseUntil(Date.now() + 7 * DAY_MS) },
        { label: 'Until I turn it back on', onPress: () => pauseIndefinitely() },
        { label: 'Cancel', style: 'cancel' },
      ],
    });
  };

  const windowLabel =
    behavior.window.from === '00:00' && behavior.window.to === '23:59'
      ? 'All day'
      : `${behavior.window.from} – ${behavior.window.to}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{behavior.title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>
          {behavior.pingMessage}
        </Text>
        {isPaused ? (
          <View
            style={[
              styles.pausedChip,
              { backgroundColor: colors.warningSoft, borderColor: colors.warning },
            ]}
          >
            <IconSymbol name="pause.fill" size={12} color={colors.warning} />
            <Text style={[styles.pausedChipText, { color: colors.warning }]}>
              {behavior.pausedIndefinitely
                ? 'Paused — tap Resume'
                : `Paused until ${formatPausedUntil(behavior.pausedUntil!)}`}
            </Text>
          </View>
        ) : null}
        {behavior.libraryGuideId ? (
          <Pressable
            onPress={() => openGuide(behavior.libraryGuideId!)}
            style={styles.guideLink}
            accessibilityLabel="Read the guide"
          >
            <IconSymbol name="book.fill" size={14} color={colors.tint} />
            <Text style={[styles.guideLinkText, { color: colors.accentText }]}>
              Read the guide
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.heroStage, { color: colors.accentText }]}>
          {stageLabel(deriveStage(behavior.level, streak))}
        </Text>
        <Text style={[styles.heroValue, { color: colors.text }]}>{streak}</Text>
        <Text style={[styles.heroDays, { color: colors.textMuted }]}>day streak</Text>
        <View style={styles.dots}>
          {last14.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    s === 'yes'
                      ? colors.tint
                      : s === 'tried'
                        ? colors.warning
                        : s === 'no'
                          ? colors.stateDisabledStripe
                          : colors.surfaceMuted,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Details</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowKey, { color: colors.textMuted }]}>Time window</Text>
          <Text style={[styles.rowVal, { color: colors.text }]}>{windowLabel}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowKey, { color: colors.textMuted }]}>Interval</Text>
          <Text style={[styles.rowVal, { color: colors.text }]}>
            every {behavior.intervalMinutes} min
          </Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={[styles.rowKey, { color: colors.textMuted }]}>Level</Text>
          <Text style={[styles.rowVal, { color: colors.text }]}>
            L{behavior.level} · {stageLabel(deriveStage(behavior.level, streak))}
          </Text>
        </View>
      </View>

      {/* Actions sit above the check-in log so they're reachable without
          scrolling past a long history. */}
      <View style={styles.actionRow}>
        <ActionChip
          icon={isPaused ? 'play.fill' : 'pause.fill'}
          label={isPaused ? 'Resume' : 'Pause'}
          colors={colors}
          onPress={handlePausePress}
        />
        <ActionChip
          icon={behavior.bookmarked ? 'bookmark.fill' : 'bookmark'}
          label={behavior.bookmarked ? 'Saved' : 'Bookmark'}
          colors={colors}
          active={behavior.bookmarked}
          onPress={handleToggleBookmark}
        />
        <ActionChip
          icon="archivebox.fill"
          label="Archive"
          colors={colors}
          onPress={handleArchive}
        />
        {__DEV__ ? (
          <ActionChip
            icon="bell.fill"
            label="Test ping"
            colors={colors}
            onPress={handleTestNotification}
          />
        ) : null}
      </View>

      <Pressable
        onPress={handleEdit}
        style={[
          styles.editButton,
          { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted },
        ]}
        accessibilityLabel="Edit behavior"
      >
        <IconSymbol name="pencil" size={16} color={colors.accentText} />
        <Text style={[styles.editButtonText, { color: colors.accentText }]}>
          Edit behavior
        </Text>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        style={styles.deleteLink}
        accessibilityLabel="Delete behavior"
        accessibilityHint="Permanently removes this behavior and all its history"
      >
        <IconSymbol name="trash.fill" size={14} color={colors.danger} />
        <Text style={[styles.deleteLinkText, { color: colors.danger }]}>Delete behavior</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Recent check-ins
        </Text>
        {recentCheckIns.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No check-ins yet
          </Text>
        ) : (
          recentCheckIns.map((item) => {
            const date = new Date(item.at);
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const meta = {
              yes: {
                bg: colors.successSoft,
                stripe: colors.success,
                labelColor: colors.accentText,
                glyph: isEliminate ? '✓ Caught it' : '✓ Practiced',
              },
              tried: {
                bg: colors.warningSoft,
                stripe: colors.warning,
                labelColor: colors.warning,
                glyph: isEliminate ? '◐ Struggled' : '◐ Showed up',
              },
              no: {
                bg: colors.surfaceMuted,
                stripe: colors.stateDisabledStripe,
                labelColor: colors.textMuted,
                glyph: '× Skipped',
              },
            }[item.result];

            return (
              <Pressable
                key={item.id}
                onLongPress={() => handleCheckInLongPress(item)}
                delayLongPress={400}
                accessibilityLabel={`Check-in: ${meta.glyph}, ${dateStr} ${timeStr}`}
                accessibilityHint="Long-press to change or delete"
                style={[
                  styles.checkInItem,
                  { backgroundColor: meta.bg, borderLeftColor: meta.stripe },
                ]}
              >
                <View style={styles.checkInHeader}>
                  <Text style={[styles.checkInResult, { color: meta.labelColor }]}>
                    {meta.glyph}
                  </Text>
                  <Text style={[styles.checkInTime, { color: colors.textMuted }]}>
                    {dateStr} · {timeStr}
                  </Text>
                </View>
                {item.note ? (
                  <Text style={[styles.checkInNote, { color: colors.text }]}>{item.note}</Text>
                ) : null}
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function ActionChip({
  icon,
  label,
  colors,
  active,
  onPress,
}: {
  icon: ComponentProps<typeof IconSymbol>['name'];
  label: string;
  colors: ThemeColors;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionChip,
        {
          borderColor: active ? colors.tint : colors.border,
          backgroundColor: active ? colors.tintSoft : 'transparent',
        },
      ]}
      accessibilityLabel={label}
    >
      <IconSymbol name={icon} size={19} color={active ? colors.accentText : colors.textMuted} />
      <Text
        style={[styles.actionChipLabel, { color: active ? colors.accentText : colors.textMuted }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingBottom: Space.xxxl,
  },
  header: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.lg,
  },
  title: { ...Type.display2 },
  message: { ...Type.body, marginTop: Space.sm },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    marginTop: Space.md,
  },
  guideLinkText: { ...Type.bodyBold },
  pausedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Space.xs,
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs,
    marginTop: Space.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  pausedChipText: { ...Type.caption, fontWeight: '600' },
  hero: {
    marginHorizontal: Space.xl,
    marginTop: Space.xl,
    paddingVertical: Space.xl,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroStage: { ...Type.caption, fontWeight: '600' },
  heroValue: { ...Type.display, marginVertical: 2 },
  heroDays: { ...Type.body },
  dots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Space.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: Space.xl,
    marginTop: Space.xl,
  },
  sectionTitle: {
    ...Type.caption,
    fontWeight: '600',
    marginBottom: Space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Space.md,
    borderBottomWidth: 1,
  },
  rowLast: { borderBottomWidth: 0 },
  rowKey: { ...Type.body },
  rowVal: { ...Type.bodyBold },
  emptyText: {
    ...Type.body,
    paddingVertical: Space.lg,
  },
  checkInItem: {
    padding: Space.md,
    borderRadius: Radius.sm,
    marginBottom: Space.sm,
    borderLeftWidth: 3,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInResult: { ...Type.bodyBold },
  checkInTime: { ...Type.caption },
  checkInNote: { ...Type.caption, marginTop: Space.xs },
  actionRow: {
    flexDirection: 'row',
    gap: Space.sm,
    paddingHorizontal: Space.xl,
    marginTop: Space.xxl,
  },
  actionChip: {
    flex: 1,
    alignItems: 'center',
    gap: Space.xs,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: 'center',
  },
  actionChipLabel: { ...Type.micro, letterSpacing: 0 },
  editButton: {
    flexDirection: 'row',
    gap: Space.sm,
    marginHorizontal: Space.xl,
    marginTop: Space.md,
    paddingVertical: Space.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  editButtonText: { ...Type.bodyBold },
  deleteLink: {
    flexDirection: 'row',
    gap: Space.xs,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: Space.lg,
    padding: Space.sm,
  },
  deleteLinkText: { ...Type.caption, fontWeight: '600' },
  errorText: {
    textAlign: 'center',
    ...Type.body,
    marginTop: Space.xl,
  },
});
