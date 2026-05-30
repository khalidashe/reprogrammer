import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Type, Space, Radius } from '@/constants/theme';
import useStore from '@/store/useStore';
import { useCallback, useState } from 'react';
import { deriveStage } from '@/services/levels';
import { rescheduleAll } from '@/services/notifications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  hhmmToDate,
  dateToHHmm,
  formatTimeForDisplayString,
} from '@/utils/time';

/**
 * Profile screen. Reached from the small profile icon on the Dashboard.
 * Hidden from the tab bar — surfaced via `href: null` in (tabs)/_layout.tsx.
 */
export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { behaviors, checkIns, appProfile, updateAppProfile, getStreak } = useStore();
  const [, setRefresh] = useState({});
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null);

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const activeStates = behaviors.filter((b) => !b.hidden);
  const totalCheckIns = checkIns.length;
  const successCount = checkIns.filter((c) => c.result === 'yes').length;
  const successRate =
    totalCheckIns > 0 ? Math.round((successCount / totalCheckIns) * 100) : 0;
  const longestStreak = Math.max(0, ...behaviors.map((b) => getStreak(b.id)));
  const daysActive = new Set(
    checkIns.map((c) => new Date(c.at).toDateString())
  ).size;
  const habitualCount = behaviors.filter(
    (b) => deriveStage(b.level, getStreak(b.id)) === 'habitual'
  ).length;

  const stats: { value: string | number; isZero: boolean; label: string }[] = [
    { value: activeStates.length, isZero: activeStates.length === 0, label: 'Active states' },
    { value: habitualCount, isZero: habitualCount === 0, label: 'Habitual states' },
    { value: totalCheckIns, isZero: totalCheckIns === 0, label: 'Total check-ins' },
    {
      value: totalCheckIns > 0 ? `${successRate}%` : '—',
      isZero: totalCheckIns === 0,
      label: 'Success rate',
    },
    { value: longestStreak, isZero: longestStreak === 0, label: 'Longest streak' },
    { value: daysActive, isZero: daysActive === 0, label: 'Days active' },
  ];

  const quietHours = appProfile.quietHours;
  const quietHoursEnabled = quietHours != null;

  const handleToggleQuietHours = async () => {
    if (quietHoursEnabled) {
      await updateAppProfile({ quietHours: undefined });
    } else {
      await updateAppProfile({ quietHours: { from: '22:00', to: '07:00' } });
    }
    await rescheduleAll({ force: true });
  };

  const handleQuietTimeChange = (which: 'from' | 'to') => async (
    event: DateTimePickerEvent,
    selected?: Date
  ) => {
    if (Platform.OS === 'android') {
      setPickerOpen(null);
    }
    if (event.type === 'dismissed' || !selected || !quietHours) return;
    const value = dateToHHmm(selected);
    await updateAppProfile({
      quietHours: {
        from: which === 'from' ? value : quietHours.from,
        to: which === 'to' ? value : quietHours.to,
      },
    });
    await rescheduleAll({ force: true });
  };

  const renderTimeChip = (which: 'from' | 'to', value: string) => {
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
        accessibilityLabel={`Quiet hours ${which} time, currently ${formatTimeForDisplayString(value)}`}
      >
        <Text
          style={[
            styles.timeChipText,
            { color: isOpen ? colors.textOnBrand : colors.text },
          ]}
        >
          {formatTimeForDisplayString(value)}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Space.xxl }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <Text style={[styles.backText, { color: colors.tint }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              {
                backgroundColor: stat.isZero ? colors.surfaceMuted : colors.tintSoft,
                borderColor: stat.isZero ? colors.border : colors.tintMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: stat.isZero ? colors.textMuted : colors.tint },
              ]}
            >
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <Text
          style={[styles.notificationStatus, { color: appProfile.notificationsDenied ? colors.danger : colors.textMuted }]}
        >
          {appProfile.notificationsDenied
            ? 'Disabled in system settings'
            : 'Enabled'}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quiet hours
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              Reminders pause inside this window across every state.
            </Text>
          </View>
          <Pressable
            onPress={handleToggleQuietHours}
            style={[
              styles.toggle,
              {
                backgroundColor: quietHoursEnabled ? colors.tint : colors.surfaceMuted,
              },
            ]}
            accessibilityLabel={
              quietHoursEnabled ? 'Disable quiet hours' : 'Enable quiet hours'
            }
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color: quietHoursEnabled ? colors.textOnBrand : colors.text,
                },
              ]}
            >
              {quietHoursEnabled ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>

        {quietHoursEnabled ? (
          <View style={styles.timeRow}>
            <Text style={[styles.timeRowLabel, { color: colors.textMuted }]}>From</Text>
            {renderTimeChip('from', quietHours.from)}
            <Text style={[styles.timeRowLabel, { color: colors.textMuted }]}>to</Text>
            {renderTimeChip('to', quietHours.to)}
          </View>
        ) : null}

        {quietHoursEnabled && pickerOpen ? (
          <DateTimePicker
            value={hhmmToDate(pickerOpen === 'from' ? quietHours.from : quietHours.to)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleQuietTimeChange(pickerOpen)}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About Reprogrammer
        </Text>
        <Text style={[styles.descriptionText, { color: colors.textMuted }]}>
          Reprogrammer uses spaced repetition to help you become aware of automatic
          behaviors and practice changing them.
        </Text>
        <Text style={[styles.tagline, { color: colors.tint }]}>
          Notice · Repeat · Reprogram
        </Text>
      </View>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // paddingTop is applied dynamically (safe-area + Space.xxl) at the JSX site
  header: {
    paddingHorizontal: Space.xl,
    paddingBottom: Space.lg,
    gap: Space.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    ...Type.body,
    fontWeight: '500',
  },
  title: {
    ...Type.display2,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Space.lg,
    gap: Space.md,
  },
  statCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    alignItems: 'center',
    gap: Space.xs,
  },
  statValue: {
    ...Type.display2,
    fontWeight: '700',
  },
  statLabel: {
    ...Type.caption,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Space.xl,
    marginTop: Space.xxl,
    gap: Space.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  sectionTitle: {
    ...Type.h2,
    fontWeight: '600',
  },
  sectionSub: { ...Type.caption, marginTop: Space.xs },
  notificationStatus: { ...Type.body },
  toggle: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs + Space.xxs, // = 6
    borderRadius: Radius.sm,
  },
  toggleText: { ...Type.bodyBold },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  timeRowLabel: { ...Type.body },
  timeChip: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  timeChipText: { ...Type.bodyBold },
  descriptionText: {
    ...Type.body,
  },
  tagline: {
    ...Type.body,
    fontWeight: '600',
    letterSpacing: 1,
  },
  spacing: {
    height: Space.massive,
  },
});
