import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  type ThemeColors,
} from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { useCallback, useState, type ComponentProps } from 'react';
import type { Behavior } from '@/types';
import { deriveStage, stageLabel } from '@/services/levels';
import { practiceTypeIcons } from '@/services/library-content';
import { useContentModals } from '@/components/library/content-modals-provider';
import { cancelForBehavior, rescheduleAll } from '@/services/notifications';
import { endOfLocalDay } from '@/services/scheduler-core';

const RELAPSE_BANNER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const CONTENT_MAX_WIDTH = 640;

function todayWeekday(): number {
  return new Date().getDay(); // 0 = Sunday
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatToday(): string {
  // Pin to en-US Gregorian so the dashboard date doesn't drift with system locale
  // (Hijri-configured sims previously showed "Friday, 12 Dhu'l-H.").
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    behaviors,
    checkIns,
    reminderAttempts,
    appProfile,
    updateAppProfile,
    updateBehavior,
    deleteBehavior,
    getStreak,
  } = useStore();
  const router = useRouter();
  const { openGuide } = useContentModals();
  const [, setRefresh] = useState({});
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const activeBehaviors = behaviors.filter((b) => !b.hidden);
  const todayStart = startOfTodayMs();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const today = todayWeekday();

  // Today's progress across all active behaviors (for the header).
  // 'tried' counts as engagement — showing up is the practice.
  const todaysCheckInsCount = checkIns.filter(
    (c) =>
      c.at >= todayStart &&
      c.at < todayEnd &&
      (c.result === 'yes' || c.result === 'tried')
  ).length;
  const todaysAttemptsCount = reminderAttempts.filter(
    (a) => a.scheduledFor >= todayStart && a.scheduledFor < todayEnd && a.phase === 'initial'
  ).length;
  const progressPct = todaysAttemptsCount
    ? Math.min(100, Math.round((todaysCheckInsCount / todaysAttemptsCount) * 100))
    : 0;

  const handleCreate = () => router.push('/create');
  const handleOpenProfile = () => router.push('/settings');

  // --- Select-mode handlers ---

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleTilePress = (id: string) => {
    if (selectMode) {
      toggleSelected(id);
      return;
    }
    router.push(`/behavior/${id}`);
  };

  const handleTileLongPress = (id: string) => {
    if (selectMode) return;
    setSelectMode(true);
    setSelectedIds(new Set([id]));
  };

  const selectedBehaviors = activeBehaviors.filter((b) => selectedIds.has(b.id));
  const anySelectedPaused = selectedBehaviors.some(
    (b) => b.pausedUntil != null && b.pausedUntil > Date.now()
  );

  const bulkPauseUntil = async (resumeAt: number) => {
    await Promise.all(
      selectedBehaviors.map((b) =>
        Promise.all([
          updateBehavior({ ...b, pausedUntil: resumeAt }),
          cancelForBehavior(b.id),
        ])
      )
    );
    exitSelectMode();
  };

  const handleBulkPause = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    Alert.alert(
      `Pause ${count} ${count === 1 ? 'behavior' : 'behaviors'}`,
      'Reminders stop; streaks and history stay. Pick a length.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Until tonight', onPress: () => bulkPauseUntil(endOfLocalDay()) },
        { text: '1 day', onPress: () => bulkPauseUntil(Date.now() + DAY_MS) },
        { text: '3 days', onPress: () => bulkPauseUntil(Date.now() + 3 * DAY_MS) },
        { text: '1 week', onPress: () => bulkPauseUntil(Date.now() + 7 * DAY_MS) },
      ]
    );
  };

  const handleBulkResume = async () => {
    if (selectedIds.size === 0) return;
    await Promise.all(
      selectedBehaviors
        .filter((b) => b.pausedUntil != null)
        .map((b) => updateBehavior({ ...b, pausedUntil: undefined }))
    );
    await rescheduleAll({ force: true });
    exitSelectMode();
  };

  const handleBulkArchive = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    Alert.alert(
      `Archive ${count} ${count === 1 ? 'behavior' : 'behaviors'}?`,
      'Archived behaviors are hidden but keep their history. You can restore them later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            await Promise.all(
              selectedBehaviors.map((b) =>
                Promise.all([
                  updateBehavior({ ...b, hidden: true }),
                  cancelForBehavior(b.id),
                ])
              )
            );
            exitSelectMode();
          },
        },
      ]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    Alert.alert(
      `Delete ${count} ${count === 1 ? 'behavior' : 'behaviors'}?`,
      'This cannot be undone. Check-in history for these behaviors will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(
              selectedBehaviors.map(async (b) => {
                await cancelForBehavior(b.id);
                await deleteBehavior(b.id);
              })
            );
            exitSelectMode();
          },
        },
      ]
    );
  };

  const showRelapseBanner =
    appProfile.lastLapseAt != null &&
    appProfile.lastLapseAcknowledged !== true &&
    Date.now() - appProfile.lastLapseAt < RELAPSE_BANNER_TTL_MS;

  const handleOpenRelapseGuide = () => {
    openGuide('guide-relapse-and-restart');
    void updateAppProfile({ lastLapseAcknowledged: true });
  };

  const handleDismissRelapseBanner = () => {
    void updateAppProfile({ lastLapseAcknowledged: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar: profile · today · add — or, in select mode: cancel · N selected */}
      <View style={[styles.topBar, { paddingTop: insets.top + Space.md }]}>
        {selectMode ? (
          <>
            <Pressable
              onPress={exitSelectMode}
              style={[styles.profileButton, { backgroundColor: colors.surfaceMuted }]}
              accessibilityLabel="Cancel selection"
            >
              <IconSymbol name="xmark" size={18} color={colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {selectedIds.size} selected
              </Text>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>
                Tap tiles to add or remove
              </Text>
            </View>
            {/* Spacer to balance the left button so the header stays centered. */}
            <View style={styles.addButton} />
          </>
        ) : (
          <>
            <Pressable
              onPress={handleOpenProfile}
              style={[styles.profileButton, { backgroundColor: colors.surfaceMuted }]}
              accessibilityLabel="Open profile"
            >
              <IconSymbol name="person.fill" size={20} color={colors.textMuted} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={[styles.dateText, { color: colors.text }]}>{formatToday()}</Text>
              {todaysAttemptsCount > 0 ? (
                <>
                  <Text style={[styles.progressText, { color: colors.textMuted }]}>
                    {todaysCheckInsCount} of {todaysAttemptsCount} practiced today
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: colors.tint, width: `${progressPct}%` },
                      ]}
                    />
                  </View>
                </>
              ) : (
                <Text style={[styles.progressText, { color: colors.textMuted }]}>
                  {activeBehaviors.length} active{' '}
                  {activeBehaviors.length === 1 ? 'behavior' : 'behaviors'}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleCreate}
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              accessibilityLabel="Add behavior"
            >
              <IconSymbol name="plus" size={22} color={colors.textOnBrand} />
            </Pressable>
          </>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.gridScroll}>
        {appProfile.notificationsDenied ? (
          <View
            style={[
              styles.permissionBanner,
              {
                backgroundColor: colors.dangerSoft,
                borderColor: colors.danger,
              },
            ]}
          >
            <View style={styles.permissionBannerBody}>
              <Text style={[styles.relapseBannerTitle, { color: colors.text }]}>
                Notifications are off.
              </Text>
              <Text
                style={[styles.relapseBannerSub, { color: colors.textMuted }]}
              >
                Reprogrammer can&apos;t remind you without them. Enable in system settings.
              </Text>
            </View>
            <Pressable
              onPress={() => void Linking.openSettings()}
              style={[
                styles.permissionBannerCta,
                { backgroundColor: colors.danger },
              ]}
              accessibilityLabel="Open notification settings"
            >
              <Text
                style={[styles.permissionBannerCtaText, { color: colors.textOnBrand }]}
              >
                Open Settings
              </Text>
            </Pressable>
          </View>
        ) : null}
        {showRelapseBanner ? (
          <View
            style={[
              styles.relapseBanner,
              {
                backgroundColor: colors.warningSoft,
                borderColor: colors.warning,
              },
            ]}
          >
            <Pressable
              onPress={handleOpenRelapseGuide}
              style={styles.relapseBannerBody}
              accessibilityLabel="Open the When You Slip guide"
              accessibilityHint="Compassionate restart practice after a missed day"
            >
              <Text style={[styles.relapseBannerTitle, { color: colors.text }]}>
                Yesterday was hard.
              </Text>
              <Text
                style={[styles.relapseBannerSub, { color: colors.textMuted }]}
              >
                A short read on how to come back without making it bigger than it is.
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDismissRelapseBanner}
              style={styles.relapseBannerDismiss}
              hitSlop={8}
              accessibilityLabel="Dismiss restart prompt"
            >
              <IconSymbol name="xmark" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : null}
        {activeBehaviors.length === 0 ? (
          <View
            style={[
              styles.emptyDashboard,
              { borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyHeadline, { color: colors.text }]}>
              No behaviors yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              Behaviors are the patterns you choose to practice. Browse the catalog or
              create one from scratch.
            </Text>
            <View style={styles.emptyCtaRow}>
              <Pressable
                onPress={() => router.push('/(tabs)/states')}
                style={[
                  styles.emptyCta,
                  { backgroundColor: colors.tint },
                ]}
                accessibilityLabel="Browse behaviors catalog"
              >
                <Text
                  style={[styles.emptyCtaText, { color: colors.textOnBrand }]}
                >
                  Browse behaviors
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                style={[styles.emptyCta, { borderColor: colors.border, borderWidth: 1 }]}
                accessibilityLabel="Create behavior from scratch"
              >
                <Text
                  style={[styles.emptyCtaText, { color: colors.textMuted }]}
                >
                  Create from scratch
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.grid}>
            {activeBehaviors.map((b) => (
              <StateTile
                key={b.id}
                behavior={b}
                today={today}
                streak={getStreak(b.id)}
                colors={colors}
                selectMode={selectMode}
                isSelected={selectedIds.has(b.id)}
                onPress={() => handleTilePress(b.id)}
                onLongPress={() => handleTileLongPress(b.id)}
              />
            ))}

            {/* Empty "+" tile to add a behavior directly from the grid. Hidden
                during selection — the top-bar Create button is also gone there. */}
            {!selectMode && (
              <Pressable
                onPress={handleCreate}
                style={[
                  styles.tile,
                  styles.emptyTile,
                  { borderColor: colors.border, backgroundColor: 'transparent' },
                ]}
                accessibilityLabel="Add a new behavior"
              >
                <IconSymbol name="plus" size={30} color={colors.textMuted} />
                <Text style={[styles.emptyLabel, { color: colors.textMuted }]}>
                  Add behavior
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {selectMode ? (
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              bottom: tabBarHeight,
              paddingBottom: Space.sm,
            },
          ]}
        >
          <BulkActionButton
            label="Pause"
            icon="pause.fill"
            color={colors.warning}
            disabled={selectedIds.size === 0}
            onPress={handleBulkPause}
          />
          <BulkActionButton
            label="Resume"
            icon="play.fill"
            color={colors.tint}
            disabled={selectedIds.size === 0 || !anySelectedPaused}
            onPress={handleBulkResume}
          />
          <BulkActionButton
            label="Archive"
            icon="archivebox.fill"
            color={colors.textMuted}
            disabled={selectedIds.size === 0}
            onPress={handleBulkArchive}
          />
          <BulkActionButton
            label="Delete"
            icon="trash.fill"
            color={colors.danger}
            disabled={selectedIds.size === 0}
            onPress={handleBulkDelete}
          />
        </View>
      ) : null}
    </View>
  );
}

interface BulkActionButtonProps {
  label: string;
  icon: ComponentProps<typeof IconSymbol>['name'];
  color: string;
  disabled: boolean;
  onPress: () => void;
}

function BulkActionButton({
  label,
  icon,
  color,
  disabled,
  onPress,
}: BulkActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.bulkAction, { opacity: disabled ? 0.35 : 1 }]}
      accessibilityLabel={`${label} selected behaviors`}
      accessibilityState={{ disabled }}
    >
      <IconSymbol name={icon} size={22} color={color} />
      <Text style={[styles.bulkActionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

interface TileProps {
  behavior: Behavior;
  today: number;
  streak: number;
  colors: ThemeColors;
  selectMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function StateTile({
  behavior,
  today,
  streak,
  colors,
  selectMode,
  isSelected,
  onPress,
  onLongPress,
}: TileProps) {
  const isPaused = behavior.pausedUntil != null && behavior.pausedUntil > Date.now();
  const isActiveToday = behavior.activeDays.includes(today);
  const isEnabled = !isPaused && isActiveToday;
  const isEliminate = behavior.kind === 'eliminate';
  const stage = deriveStage(behavior.level, streak);
  const isHabitual = stage === 'habitual';
  const practiceIcons = behavior.practiceType
    ? practiceTypeIcons(behavior.practiceType)
    : [];

  const windowLabel =
    behavior.window.from === '00:00' && behavior.window.to === '23:59'
      ? 'All day'
      : `${behavior.window.from}–${behavior.window.to}`;

  const labelSuffix = selectMode
    ? isSelected
      ? ', selected'
      : ', not selected'
    : '';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={[
        styles.tile,
        { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        !isEnabled && { opacity: 0.55 },
        isSelected && { borderColor: colors.tint, borderWidth: 2 },
      ]}
      accessibilityLabel={`${behavior.title}, ${
        isEliminate ? 'Eliminate' : 'Adopt'
      }, ${isPaused ? 'Paused' : stageLabel(stage)}, ${
        streak > 0 ? `${streak} day streak` : 'no current streak'
      }${labelSuffix}`}
      accessibilityHint={
        selectMode ? 'Toggles selection' : 'Opens behavior details. Long-press to select.'
      }
    >
      <View style={styles.tileTop}>
        <View style={styles.ptypeRow}>
          {practiceIcons.map((iconName, i) => (
            <IconSymbol
              key={i}
              name={iconName as ComponentProps<typeof IconSymbol>['name']}
              size={15}
              color={colors.textMuted}
            />
          ))}
        </View>
        <Text
          style={[
            styles.kindLabel,
            { color: isEliminate ? colors.danger : colors.textMuted },
          ]}
        >
          {isEliminate ? 'Eliminate' : 'Adopt'}
        </Text>
      </View>

      <Text numberOfLines={2} style={[styles.tileTitle, { color: colors.text }]}>
        {behavior.title}
      </Text>

      {streak > 0 ? (
        <View style={styles.streakRow}>
          <IconSymbol name="flame.fill" size={14} color={colors.warning} />
          <Text style={[styles.streakNum, { color: colors.warning }]}>{streak}</Text>
          <Text style={[styles.streakLbl, { color: colors.textMuted }]}>day streak</Text>
        </View>
      ) : (
        <View style={styles.streakRow}>
          <IconSymbol name="play.fill" size={11} color={colors.textMuted} />
          <Text style={[styles.startLbl, { color: colors.textMuted }]}>Start today</Text>
        </View>
      )}

      <View style={styles.tileFooter}>
        <View
          style={[
            styles.stagePill,
            { backgroundColor: isHabitual ? colors.tintSoft : colors.surfaceMuted },
          ]}
        >
          <Text
            style={[
              styles.stagePillText,
              { color: isHabitual ? colors.accentText : colors.textMuted },
            ]}
          >
            {isPaused ? 'Paused' : stageLabel(stage)}
          </Text>
        </View>
        <Text style={[styles.windowText, { color: colors.textMuted }]}>{windowLabel}</Text>
      </View>

      {selectMode ? (
        <View
          pointerEvents="none"
          style={[
            styles.selectBadge,
            {
              backgroundColor: isSelected ? colors.tint : colors.background,
              borderColor: isSelected ? colors.tint : colors.border,
            },
          ]}
        >
          {isSelected ? (
            <IconSymbol name="checkmark" size={14} color={colors.textOnBrand} />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
    gap: Space.md,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  dateText: {
    ...Type.bodyBold,
  },
  progressText: {
    ...Type.caption,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    borderRadius: Radius.pill,
    marginTop: 7,
    overflow: 'hidden',
    maxWidth: 220,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridScroll: {
    padding: Space.lg,
    paddingTop: Space.sm,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  relapseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    padding: Space.md,
    marginBottom: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  permissionBanner: {
    gap: Space.sm,
    padding: Space.md,
    marginBottom: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  permissionBannerBody: {
    gap: Space.xs,
  },
  permissionBannerCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  permissionBannerCtaText: { ...Type.bodyBold },
  relapseBannerBody: {
    flex: 1,
    gap: Space.xs,
  },
  relapseBannerTitle: { ...Type.bodyBold },
  relapseBannerSub: { ...Type.caption },
  relapseBannerDismiss: {
    padding: Space.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  tile: {
    width: `${(100 - 4) / 2}%`,
    minWidth: 150,
    minHeight: 138,
    aspectRatio: 1,
    borderRadius: Radius.lg,
    padding: Space.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ptypeRow: {
    flexDirection: 'row',
    gap: Space.xs,
  },
  kindLabel: {
    ...Type.micro,
    letterSpacing: 0,
  },
  tileTitle: {
    ...Type.bodyBold,
    marginTop: Space.sm,
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    marginTop: Space.xs,
  },
  streakNum: {
    ...Type.bodyBold,
  },
  streakLbl: {
    ...Type.caption,
  },
  startLbl: {
    ...Type.caption,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.sm,
  },
  stagePill: {
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  stagePillText: {
    ...Type.micro,
    letterSpacing: 0,
  },
  windowText: {
    ...Type.micro,
    letterSpacing: 0,
  },
  emptyTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Space.xs,
  },
  emptyLabel: {
    ...Type.caption,
    fontWeight: '500',
  },
  emptyDashboard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingHorizontal: Space.xl,
    paddingVertical: Space.xxl,
    marginTop: Space.xxl,
    gap: Space.sm,
    alignItems: 'center',
  },
  emptyHeadline: {
    ...Type.h2,
  },
  emptyBody: {
    ...Type.body,
    textAlign: 'center',
  },
  emptyCtaRow: {
    flexDirection: 'row',
    gap: Space.sm,
    marginTop: Space.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyCta: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    minWidth: 130,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: {
    ...Type.bodyBold,
  },
  selectBadge: {
    position: 'absolute',
    top: Space.sm,
    right: Space.sm,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: Space.md,
    paddingTop: Space.md,
    borderTopWidth: 1,
  },
  bulkAction: {
    alignItems: 'center',
    gap: Space.xs,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    minWidth: 64,
    minHeight: 44,
  },
  bulkActionLabel: { ...Type.caption, fontWeight: '600' },
});
