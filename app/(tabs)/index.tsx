import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, type ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useStore from '@/store/useStore';
import { useCallback, useState } from 'react';
import type { Behavior } from '@/types';
import { deriveStage, stageLabel } from '@/services/levels';
import { domainLabel } from '@/services/library-content';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function todayWeekday(): number {
  return new Date().getDay(); // 0 = Sunday
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviors, checkIns, reminderAttempts, getStreak } = useStore();
  const router = useRouter();
  const [, setRefresh] = useState({});

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const activeBehaviors = behaviors.filter((b) => !b.hidden);
  const todayStart = startOfTodayMs();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const today = todayWeekday();

  // Today's progress across all active states (for the header).
  const todaysCheckInsCount = checkIns.filter(
    (c) => c.at >= todayStart && c.at < todayEnd && c.result === 'yes'
  ).length;
  const todaysAttemptsCount = reminderAttempts.filter(
    (a) => a.scheduledFor >= todayStart && a.scheduledFor < todayEnd && a.phase === 'initial'
  ).length;

  const handleCreate = () => router.push('/create');
  const handleOpenState = (id: string) => router.push(`/behavior/${id}`);
  const handleOpenProfile = () => router.push('/explore');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar: profile · today · add */}
      <View style={styles.topBar}>
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
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {todaysCheckInsCount} of {todaysAttemptsCount} practiced today
            </Text>
          ) : (
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              {activeBehaviors.length} active{' '}
              {activeBehaviors.length === 1 ? 'state' : 'states'}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleCreate}
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          accessibilityLabel="Add state"
        >
          <IconSymbol name="plus" size={22} color={colors.textOnBrand} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.gridScroll}>
        <View style={styles.grid}>
          {activeBehaviors.map((b) => (
            <StateTile
              key={b.id}
              behavior={b}
              today={today}
              streak={getStreak(b.id)}
              colors={colors}
              onPress={() => handleOpenState(b.id)}
            />
          ))}

          {/* Empty "+" tile to add a state directly from the grid */}
          <Pressable
            onPress={handleCreate}
            style={[
              styles.tile,
              styles.emptyTile,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            accessibilityLabel="Add a new state"
          >
            <IconSymbol name="plus" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyLabel, { color: colors.textMuted }]}>Add state</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

interface TileProps {
  behavior: Behavior;
  today: number;
  streak: number;
  colors: ThemeColors;
  onPress: () => void;
}

function StateTile({ behavior, today, streak, colors, onPress }: TileProps) {
  const isPaused = behavior.pausedUntil != null && behavior.pausedUntil > Date.now();
  const isActiveToday = behavior.activeDays.includes(today);
  const isEnabled = !isPaused && isActiveToday;
  const stage = deriveStage(behavior.level, streak);
  const textColor = isEnabled ? colors.stateEnabledText : colors.stateDisabledText;
  const kindBadgeBg = behavior.kind === 'eliminate' ? colors.warning + '33' : colors.tint + '33';
  const kindBadgeText = behavior.kind === 'eliminate' ? colors.warning : colors.tint;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: isEnabled ? colors.stateEnabledBg : colors.stateDisabledBg,
          overflow: 'hidden',
        },
      ]}
    >
      {!isEnabled && <DiagonalStripes color={colors.stateDisabledStripe} />}

      <View style={styles.tileContent}>
        <View style={styles.tileTopRow}>
          <Text
            numberOfLines={2}
            style={[styles.tileTitle, { color: textColor }]}
          >
            {behavior.title}
          </Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <IconSymbol name="flame.fill" size={12} color={colors.warning} />
              <Text style={[styles.streakNumber, { color: colors.warning }]}>{streak}</Text>
            </View>
          )}
        </View>

        <View style={styles.kindRow}>
          <View style={[styles.kindBadge, { backgroundColor: kindBadgeBg }]}>
            <Text style={[styles.kindBadgeText, { color: kindBadgeText }]}>
              {behavior.kind === 'eliminate' ? 'ELIMINATE' : 'ADOPT'}
            </Text>
          </View>
          <Text style={[styles.stageText, { color: textColor }]}>{stageLabel(stage)}</Text>
        </View>

        {behavior.domain && (
          <Text style={[styles.domainText, { color: textColor, opacity: 0.7 }]}>
            {domainLabel(behavior.domain)}
          </Text>
        )}

        <Text style={[styles.tileWindow, { color: textColor }]}>
          {behavior.window.from} – {behavior.window.to}
        </Text>

        <View style={styles.daysRow}>
          {DAY_LABELS.map((label, idx) => {
            const isActive = behavior.activeDays.includes(idx);
            return (
              <Text
                key={idx}
                style={[
                  styles.dayLabel,
                  {
                    color: isActive
                      ? isEnabled
                        ? colors.stateEnabledText
                        : colors.stateDisabledText
                      : colors.textMuted,
                    opacity: isActive ? 1 : 0.4,
                    fontWeight: isActive ? '700' : '400',
                  },
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Renders a diagonal-stripe overlay for paused/inactive state tiles.
 * Uses lightweight rotated View bars so we don't depend on SVG or images.
 */
function DiagonalStripes({ color }: { color: string }) {
  const bars = Array.from({ length: 14 });
  return (
    <View pointerEvents="none" style={styles.stripesContainer}>
      {bars.map((_, i) => (
        <View
          key={i}
          style={[
            styles.stripeBar,
            {
              top: i * 18 - 80,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const TILE_GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridScroll: {
    padding: 16,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  tile: {
    width: `${(100 - 4) / 2}%`, // two columns with gap
    aspectRatio: 1,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
  },
  tileContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  tileWindow: {
    fontSize: 12,
    opacity: 0.85,
    marginTop: 4,
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  kindBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kindBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  domainText: {
    fontSize: 11,
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayLabel: {
    fontSize: 11,
    width: 14,
    textAlign: 'center',
  },
  emptyTile: {
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  emptyLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  stripesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  stripeBar: {
    position: 'absolute',
    left: -60,
    width: 300,
    height: 6,
    opacity: 0.45,
    transform: [{ rotate: '-45deg' }],
  },
});
