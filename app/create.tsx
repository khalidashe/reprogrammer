import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius } from '@/constants/theme';
import useStore from '@/store/useStore';
import { Behavior, BehaviorKind } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { cancelForBehavior, scheduleForBehavior } from '@/services/notifications';
import { useIsPro } from '@/hooks/useIsPro';
import { FREE_TIER_STATE_CAP } from '@/constants/limits';
import {
  INITIAL_LEVEL,
  INITIAL_LAST_LEVELUP_STREAK,
  INTERVAL_PRESETS,
  effectiveIntervalMinutes,
} from '@/services/levels';
import { useState, useMemo } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  hhmmToDate,
  dateToHHmm,
  hhmmToMinutes,
  formatTimeForDisplay,
} from '@/utils/time';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function CreateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  const { behaviors, addBehavior, updateBehavior } = useStore();
  const { isPro } = useIsPro();

  const editingBehavior = useMemo(
    () => (id ? behaviors.find(b => b.id === id as string) : null),
    [id, behaviors]
  );

  const activeStateCount = useMemo(
    () => behaviors.filter((b) => !b.hidden).length,
    [behaviors]
  );
  const wouldExceedFreeCap =
    !isPro && !editingBehavior && activeStateCount >= FREE_TIER_STATE_CAP;

  const [title, setTitle] = useState(editingBehavior?.title || '');
  const [pingMessage, setPingMessage] = useState(editingBehavior?.pingMessage || '');
  const [startTime, setStartTime] = useState(editingBehavior?.window.from || '09:00');
  const [endTime, setEndTime] = useState(editingBehavior?.window.to || '21:00');
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(
    editingBehavior?.intervalMinutes ?? 15
  );
  const [activeDays, setActiveDays] = useState<number[]>(
    editingBehavior?.activeDays || [0, 1, 2, 3, 4, 5, 6]
  );
  const [kind, setKind] = useState<BehaviorKind>(editingBehavior?.kind ?? 'adopt');
  const [replacementStateId, setReplacementStateId] = useState<string | undefined>(
    editingBehavior?.replacementStateId
  );

  const adoptStateOptions = useMemo(
    () => behaviors.filter((b) => b.kind === 'adopt' && !b.hidden && b.id !== editingBehavior?.id),
    [behaviors, editingBehavior?.id]
  );

  const startDisplay = formatTimeForDisplay(startTime);
  const endDisplay = formatTimeForDisplay(endTime);

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const previewText = useMemo(() => {
    const startMin = hhmmToMinutes(startTime);
    const endMin = hhmmToMinutes(endTime);
    const durationMin = endMin - startMin;
    if (durationMin <= 0 || intervalMinutes <= 0) return 'Invalid time window';
    const level = editingBehavior?.level ?? INITIAL_LEVEL;
    const effMin = effectiveIntervalMinutes(intervalMinutes, level);
    const totalPings = Math.max(1, Math.floor(durationMin / effMin));
    let spacingLabel: string;
    if (effMin >= 60) {
      const h = Math.floor(effMin / 60);
      const m = Math.round(effMin % 60);
      spacingLabel = m > 0 ? `${h}h ${m}m` : `${h}h`;
    } else {
      spacingLabel = `${Math.round(effMin)} min`;
    }
    const tail = effMin !== intervalMinutes ? ` (level ${level}, every ${intervalMinutes}m base)` : '';
    return `~${totalPings} pings today, ~every ${spacingLabel}${tail}`;
  }, [startTime, endTime, intervalMinutes, editingBehavior?.level]);

  const handleTimeChange = (which: 'start' | 'end') => (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (Platform.OS === 'android') {
      setPickerOpen(null);
    }
    if (event.type === 'dismissed' || !selected) return;
    const value = dateToHHmm(selected);
    if (which === 'start') setStartTime(value);
    else setEndTime(value);
  };

  const handleSave = async () => {
    if (wouldExceedFreeCap) {
      router.push('/paywall');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Label required', 'Please enter a state label');
      return;
    }

    if (hhmmToMinutes(endTime) <= hhmmToMinutes(startTime)) {
      Alert.alert('Invalid time window', 'The end time must be after the start time.');
      return;
    }

    if (activeDays.length === 0) {
      Alert.alert('No active days', 'Pick at least one day for this state.');
      return;
    }

    if (kind === 'eliminate' && !replacementStateId) {
      Alert.alert(
        'Replacement required',
        'An Eliminate state must be linked to an Adopt state. Create the Adopt first, then come back.'
      );
      return;
    }

    const effectivePing = pingMessage.trim() || title;

    if (editingBehavior) {
      const updated: Behavior = {
        ...editingBehavior,
        kind,
        title,
        pingMessage: effectivePing,
        window: { from: startTime, to: endTime },
        intervalMinutes,
        activeDays,
        replacementStateId: kind === 'eliminate' ? replacementStateId : undefined,
      };
      await cancelForBehavior(editingBehavior.id);
      await updateBehavior(updated);
      await scheduleForBehavior(updated);
    } else {
      const behavior: Behavior = {
        id: generateUUID(),
        kind,
        title,
        pingMessage: effectivePing,
        window: { from: startTime, to: endTime },
        intervalMinutes,
        activeDays,
        level: INITIAL_LEVEL,
        lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
        replacementStateId: kind === 'eliminate' ? replacementStateId : undefined,
        createdAt: Date.now(),
        hidden: false,
        bookmarked: false,
      };
      await addBehavior(behavior);
      await scheduleForBehavior(behavior);
    }

    router.replace('/');
  };

  const handleCancel = () => router.back();

  const renderTimeChip = (
    which: 'start' | 'end',
    display: { time: string; period: string }
  ) => {
    const isOpen = pickerOpen === which;
    return (
      <Pressable
        onPress={() => setPickerOpen(isOpen ? null : which)}
        style={[
          styles.timeChip,
          {
            backgroundColor: isOpen ? colors.tint : colors.background,
            borderColor: colors.tint,
          },
        ]}
      >
        <Text style={[styles.timeChipText, { color: isOpen ? colors.textOnBrand : colors.text }]}>
          {display.time}
        </Text>
        <Text style={[styles.timeChipPeriod, { color: isOpen ? colors.textOnBrand : colors.textMuted }]}>
          {display.period}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {wouldExceedFreeCap && (
          <Pressable
            onPress={() => router.push('/paywall')}
            style={[styles.capBanner, { backgroundColor: colors.tintSoft, borderColor: colors.tintMuted }]}
            accessibilityLabel="Free tier limit reached. Upgrade to Pro."
          >
            <Text style={[styles.capBannerTitle, { color: colors.text }]}>
              Free plan: {FREE_TIER_STATE_CAP} of {FREE_TIER_STATE_CAP} states used
            </Text>
            <Text style={[styles.capBannerSubtitle, { color: colors.textMuted }]}>
              Upgrade to Pro for unlimited states →
            </Text>
          </Pressable>
        )}

        <View style={styles.kindToggle}>
          <Pressable
            onPress={() => setKind('adopt')}
            style={[
              styles.kindButton,
              {
                backgroundColor: kind === 'adopt' ? colors.tint : colors.surfaceMuted,
              },
            ]}
            accessibilityLabel={`Adopt${kind === 'adopt' ? ', selected' : ''}`}
          >
            <Text
              style={[
                styles.kindButtonText,
                { color: kind === 'adopt' ? colors.textOnBrand : colors.text },
              ]}
            >
              Adopt
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setKind('eliminate')}
            style={[
              styles.kindButton,
              {
                backgroundColor: kind === 'eliminate' ? colors.tint : colors.surfaceMuted,
              },
            ]}
            accessibilityLabel={`Eliminate${kind === 'eliminate' ? ', selected' : ''}`}
          >
            <Text
              style={[
                styles.kindButtonText,
                { color: kind === 'eliminate' ? colors.textOnBrand : colors.text },
              ]}
            >
              Eliminate
            </Text>
          </Pressable>
        </View>

        {kind === 'eliminate' && (
          <View style={styles.replacementRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Replace with:</Text>
            <View style={styles.replacementChips}>
              {adoptStateOptions.length === 0 ? (
                <Text style={[Type.caption, { color: colors.textMuted, flex: 1 }]}>
                  No Adopt states yet — create one first.
                </Text>
              ) : (
                adoptStateOptions.map((b) => {
                  const active = replacementStateId === b.id;
                  return (
                    <Pressable
                      key={b.id}
                      onPress={() => setReplacementStateId(b.id)}
                      style={[
                        styles.replacementChip,
                        { backgroundColor: active ? colors.tint : colors.surfaceMuted },
                      ]}
                      accessibilityLabel={`Replace with ${b.title}${
                        active ? ', selected' : ''
                      }`}
                    >
                      <Text
                        style={[
                          styles.replacementChipText,
                          { color: active ? colors.textOnBrand : colors.text },
                        ]}
                      >
                        {b.title}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        )}

        <View style={styles.timeBlock}>
          <View style={styles.timeColumn}>
            <Text style={[styles.timeColumnLabel, { color: colors.textMuted }]}>From</Text>
            {renderTimeChip('start', startDisplay)}
          </View>
          <Text style={[styles.timeArrow, { color: colors.textMuted }]}>→</Text>
          <View style={styles.timeColumn}>
            <Text style={[styles.timeColumnLabel, { color: colors.textMuted }]}>To</Text>
            {renderTimeChip('end', endDisplay)}
          </View>
        </View>

        {pickerOpen === 'start' && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={hhmmToDate(startTime)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange('start')}
            />
          </View>
        )}
        {pickerOpen === 'end' && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={hhmmToDate(endTime)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange('end')}
            />
          </View>
        )}

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Repeat:</Text>
          <View style={styles.dayPills}>
            {DAY_LETTERS.map((letter, index) => {
              const active = activeDays.includes(index);
              return (
                <Pressable
                  key={index}
                  onPress={() => toggleDay(index)}
                  hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: active ? colors.tint : colors.surfaceMuted,
                    },
                  ]}
                  accessibilityLabel={`${DAY_NAMES[index]} ${
                    active ? 'active' : 'inactive'
                  }`}
                >
                  <Text
                    style={[
                      styles.dayPillLetter,
                      { color: active ? colors.textOnBrand : colors.text },
                    ]}
                  >
                    {letter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Label:</Text>
          <TextInput
            style={[styles.fieldInput, { color: colors.text, backgroundColor: colors.surfaceMuted }]}
            placeholder="State"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.pingRow}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Reminder:</Text>
          <TextInput
            style={[
              styles.pingInput,
              { color: colors.text, backgroundColor: colors.surfaceMuted },
            ]}
            placeholder={title ? `Default: "${title}"` : 'What should the reminder say?'}
            placeholderTextColor={colors.textMuted}
            value={pingMessage}
            onChangeText={setPingMessage}
            multiline
            accessibilityLabel="Reminder message shown in the notification"
            accessibilityHint="Optional. If left blank, the label is used."
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Every:</Text>
          <View style={styles.intervalChips}>
            {INTERVAL_PRESETS.map((mins) => {
              const active = intervalMinutes === mins;
              return (
                <Pressable
                  key={mins}
                  onPress={() => setIntervalMinutes(mins)}
                  hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                  style={[
                    styles.intervalChip,
                    {
                      backgroundColor: active ? colors.tint : colors.surfaceMuted,
                    },
                  ]}
                  accessibilityLabel={`Every ${mins} minutes${
                    active ? ', selected' : ''
                  }`}
                >
                  <Text
                    style={[
                      styles.intervalChipText,
                      { color: active ? colors.textOnBrand : colors.text },
                    ]}
                  >
                    {mins}m
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={[styles.previewText, { color: colors.textMuted }]}>{previewText}</Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCancel}
            style={[styles.actionButton, { backgroundColor: colors.surfaceMuted }]}
            accessibilityLabel="Cancel"
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            accessibilityLabel="Save state"
          >
            <Text style={[styles.actionButtonText, { color: colors.textOnBrand }]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Space.xxl,
    gap: Space.xl,
  },
  timeBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: Space.lg,
    marginTop: Space.sm,
  },
  timeColumn: {
    alignItems: 'center',
    gap: Space.xs,
  },
  timeColumnLabel: {
    ...Type.micro,
    textTransform: 'uppercase',
  },
  timeChip: {
    minWidth: 120,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  // The time chip is the visual centerpiece of the schedule section — a
  // larger-than-display2 numeric (32pt vs 28pt) to feel tappable as a target
  // without competing with screen headers.
  timeChipText: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  timeChipPeriod: {
    ...Type.micro,
    marginTop: 2,
    letterSpacing: 1,
  },
  timeArrow: {
    ...Type.h1,
    paddingBottom: Space.lg,
  },
  pickerWrapper: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  rowLabel: {
    width: 76,
    ...Type.bodyBold,
    textAlign: 'right',
  },
  dayPills: {
    flex: 1,
    flexDirection: 'row',
    gap: Space.xs,
  },
  dayPill: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillLetter: {
    ...Type.bodyBold,
  },
  fieldInput: {
    flex: 1,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    ...Type.body,
  },
  pingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  pingInput: {
    flex: 1,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    minHeight: 60,
    ...Type.body,
  },
  intervalChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.xs,
  },
  intervalChip: {
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs + 2,
    borderRadius: Radius.sm,
  },
  intervalChipText: {
    ...Type.caption,
    fontWeight: '600',
  },
  previewText: {
    ...Type.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: -4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Space.md,
    marginTop: Space.sm,
  },
  actionButton: {
    paddingHorizontal: Space.xxl,
    paddingVertical: Space.md,
    borderRadius: Radius.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    ...Type.bodyBold,
  },
  kindToggle: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  kindButton: {
    flex: 1,
    paddingVertical: Space.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  kindButtonText: {
    ...Type.bodyBold,
    letterSpacing: 0.5,
  },
  replacementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  replacementChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.xs,
  },
  replacementChip: {
    paddingHorizontal: Space.sm,
    paddingVertical: Space.xs + 2,
    borderRadius: Radius.sm,
  },
  replacementChipText: {
    ...Type.caption,
    fontWeight: '600',
  },
  capBanner: {
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  capBannerTitle: { ...Type.bodyBold },
  capBannerSubtitle: { ...Type.caption },
});
