import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Colors,
  Type,
  Space,
  Radius,
  PRESSED_OPACITY,
  controlSelected,
  controlResting,
  type ThemeColors,
} from '@/constants/theme';
import { useIsPro } from '@/hooks/useIsPro';
import {
  restorePurchases,
  logoutRevenueCat,
} from '@/services/revenuecat';
import useStore from '@/store/useStore';
import { useFeedback } from '@/components/ui/feedback';
import { haptics } from '@/services/haptics';
import { deriveStage } from '@/services/levels';
import { rescheduleAll } from '@/services/notifications';
import { isReminderMuteActive } from '@/services/scheduler-core';
import { hhmmToDate, dateToHHmm, formatTimeForDisplayString } from '@/utils/time';

const MANAGE_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  default: 'https://apps.apple.com/account/subscriptions',
});

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isPro, isSignedIn } = useIsPro();
  const user = useQuery(api.users.getCurrentUser);
  const deleteAccount = useMutation(api.account.deleteAccount);
  const { signOut } = useAuthActions();
  const { behaviors, checkIns, appProfile, updateAppProfile, getStreak } = useStore();
  const { showToast } = useFeedback();
  const [, setRefresh] = useState({});
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null);

  useFocusEffect(
    useCallback(() => {
      setRefresh({});
    }, [])
  );

  const activeStates = behaviors.filter((b) => !b.hidden);
  const bookmarkedCount = behaviors.filter((b) => b.bookmarked).length;
  const archivedCount = behaviors.filter((b) => b.hidden).length;
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
    { value: activeStates.length, isZero: activeStates.length === 0, label: 'Active behaviors' },
    { value: habitualCount, isZero: habitualCount === 0, label: 'Habitual behaviors' },
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
  const remindersMuted = isReminderMuteActive(appProfile);
  const privateSyncOn = appProfile.privacySyncConsent !== undefined;

  const handleToggleMute = async () => {
    haptics.selection();
    await updateAppProfile({
      remindersMutedUntil: remindersMuted ? undefined : 'indefinite',
    });
    await rescheduleAll({ force: true });
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      showToast('Purchases restored — any active subscription is now applied.');
    } catch (e: any) {
      showToast(`Restore failed — ${e?.message ?? 'please try again.'}`);
    }
  };

  const handleManage = () => {
    if (MANAGE_URL) Linking.openURL(MANAGE_URL);
  };

  const handleSignOut = async () => {
    try {
      await logoutRevenueCat();
    } catch {
      // ignore — RC may not be configured
    }
    await signOut();
  };

  const resetLocalData = async () => {
    await AsyncStorage.multiRemove([
      'rpg.behaviors.v3',
      'rpg.behaviors.v2',
      'rpg.behaviors.v1',
      'rpg.checkins.v1',
      'rpg.reminderAttempts.v1',
      'rpg.app.v1',
      'rpg.entries.v1',
      'rpg.focusSessions.v1',
    ]);
    useStore.setState({
      behaviors: [],
      checkIns: [],
      reminderAttempts: [],
      entries: [],
      focusSessions: [],
      appProfile: { hasOnboarded: false },
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently erases your account and all data from our servers — your behaviors, check-ins, reflections, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount({});
            } catch (e: any) {
              showToast(`Couldn't delete account — ${e?.message ?? 'please try again.'}`);
              return;
            }
            try {
              await logoutRevenueCat();
            } catch {
              // ignore — RC may not be configured
            }
            await signOut();
            await resetLocalData();
          },
        },
      ]
    );
  };

  const handleToggleQuietHours = async () => {
    haptics.selection();
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
        style={({ pressed }) => [
          styles.timeChip,
          isOpen ? controlSelected(colors) : controlResting(colors),
          pressed && { opacity: PRESSED_OPACITY },
        ]}
        accessibilityLabel={`Quiet hours ${which} time, currently ${formatTimeForDisplayString(value)}`}
      >
        <Text
          style={[
            styles.timeChipText,
            { color: isOpen ? colors.accentText : colors.text },
          ]}
        >
          {formatTimeForDisplayString(value)}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollInner}
    >
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                {
                  // Numbers are neutral data — green is reserved for the one
                  // genuinely "earned" metric (longest streak).
                  color: stat.isZero
                    ? colors.textMuted
                    : stat.label === 'Longest streak'
                      ? colors.tint
                      : colors.text,
                },
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

      <Section title="You" colors={colors}>
        {appProfile.goals ? (
          <Row label="Your goals" value={appProfile.goals} colors={colors} />
        ) : null}
        <ActionButton
          label={appProfile.goals ? 'Edit your goals' : 'Set your goals'}
          onPress={() => router.push('/goals')}
          colors={colors}
        />
      </Section>

      <Section title="Your behaviors" colors={colors}>
        <ActionButton
          label={`Bookmarked${bookmarkedCount ? ` (${bookmarkedCount})` : ''}`}
          onPress={() =>
            router.push({ pathname: '/manage-behaviors', params: { tab: 'bookmarked' } })
          }
          colors={colors}
        />
        <ActionButton
          label={`Archived${archivedCount ? ` (${archivedCount})` : ''}`}
          onPress={() =>
            router.push({ pathname: '/manage-behaviors', params: { tab: 'archived' } })
          }
          colors={colors}
        />
      </Section>

      <Section title="Subscription" colors={colors}>
        <Row
          label={isPro ? 'Reprogrammer Pro' : 'Free plan'}
          value={isPro ? 'Active' : 'Upgrade for unlimited behaviors + sync + AI'}
          colors={colors}
        />
        {!isPro && (
          <ActionButton
            label="Upgrade to Pro"
            onPress={() => router.push('/paywall')}
            primary
            colors={colors}
          />
        )}
        {isPro && (
          <ActionButton
            label="Manage subscription"
            onPress={handleManage}
            colors={colors}
          />
        )}
        <ActionButton
          label="Restore purchases"
          onPress={handleRestore}
          colors={colors}
        />
      </Section>

      <Section title="Account" colors={colors}>
        {isSignedIn ? (
          <>
            <Row
              label="Signed in"
              value={user?.email ?? user?.name ?? 'Account'}
              colors={colors}
            />
            <Row
              label="Private sync"
              value={
                privateSyncOn
                  ? 'On — your private writing backs up'
                  : 'Off — private writing stays on this device'
              }
              colors={colors}
            />
            <ActionButton
              label={privateSyncOn ? 'Manage private sync' : 'Turn on private sync'}
              onPress={() => router.push('/privacy-sync-consent')}
              colors={colors}
            />
            <ActionButton
              label="Sign out"
              onPress={handleSignOut}
              colors={colors}
              destructive
            />
            <ActionButton
              label="Delete account"
              onPress={handleDeleteAccount}
              colors={colors}
              destructive
            />
          </>
        ) : (
          <>
            <Row
              label="Not signed in"
              value="Sign in to sync across devices and access Pro."
              colors={colors}
            />
            <ActionButton
              label="Sign in"
              onPress={() => router.push('/auth')}
              primary
              colors={colors}
            />
          </>
        )}
      </Section>

      <Section title="Notifications" colors={colors}>
        <Row
          label="System permission"
          value={
            appProfile.notificationsDenied
              ? 'Disabled in system settings'
              : 'Enabled'
          }
          valueColor={appProfile.notificationsDenied ? colors.danger : undefined}
          colors={colors}
        />
        {appProfile.notificationsDenied && (
          <ActionButton
            label="Open system settings"
            onPress={() => void Linking.openSettings()}
            colors={colors}
          />
        )}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionSub, { color: colors.textMuted, flex: 1 }]}>
            Mute all reminders — silence every ping until you turn it back on.
          </Text>
          <Pressable
            onPress={handleToggleMute}
            style={({ pressed }) => [
              styles.toggle,
              remindersMuted ? controlSelected(colors) : controlResting(colors),
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: remindersMuted }}
            accessibilityLabel={
              remindersMuted ? 'Unmute all reminders' : 'Mute all reminders'
            }
          >
            <Text
              style={[
                styles.toggleText,
                { color: remindersMuted ? colors.accentText : colors.text },
              ]}
            >
              {remindersMuted ? 'Muted' : 'Off'}
            </Text>
          </Pressable>
        </View>
      </Section>

      <Section title="Quiet hours" colors={colors}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionSub, { color: colors.textMuted, flex: 1 }]}>
            Reminders pause inside this window across every behavior.
          </Text>
          <Pressable
            onPress={handleToggleQuietHours}
            style={({ pressed }) => [
              styles.toggle,
              quietHoursEnabled ? controlSelected(colors) : controlResting(colors),
              pressed && { opacity: PRESSED_OPACITY },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: quietHoursEnabled }}
            accessibilityLabel={
              quietHoursEnabled ? 'Disable quiet hours' : 'Enable quiet hours'
            }
          >
            <Text
              style={[
                styles.toggleText,
                { color: quietHoursEnabled ? colors.accentText : colors.text },
              ]}
            >
              {quietHoursEnabled ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>

        {quietHoursEnabled && quietHours ? (
          <View style={styles.timeRow}>
            <Text style={[styles.timeRowLabel, { color: colors.textMuted }]}>From</Text>
            {renderTimeChip('from', quietHours.from)}
            <Text style={[styles.timeRowLabel, { color: colors.textMuted }]}>to</Text>
            {renderTimeChip('to', quietHours.to)}
          </View>
        ) : null}

        {quietHoursEnabled && quietHours && pickerOpen ? (
          <DateTimePicker
            value={hhmmToDate(pickerOpen === 'from' ? quietHours.from : quietHours.to)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleQuietTimeChange(pickerOpen)}
          />
        ) : null}
      </Section>

      <Section title="About" colors={colors}>
        <Text style={[styles.descriptionText, { color: colors.textMuted }]}>
          Reprogrammer uses spaced repetition to help you become aware of automatic
          behaviors and practice changing them.
        </Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          Notice · Repeat · Reprogram
        </Text>
        <ActionButton
          label="How it works"
          onPress={() => router.push('/how-it-works')}
          colors={colors}
        />
      </Section>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        {title}
      </Text>
      <View style={[styles.sectionBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? colors.textMuted }]}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  primary,
  destructive,
  colors,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  destructive?: boolean;
  colors: ThemeColors;
}) {
  const bg = primary ? colors.tint : colors.surfaceMuted;
  const fg = primary
    ? colors.textOnBrand
    : destructive
      ? colors.danger
      : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg },
        pressed && { opacity: PRESSED_OPACITY },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollInner: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingBottom: Space.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
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
  statValue: { ...Type.display2, fontWeight: '700' },
  statLabel: { ...Type.caption, textAlign: 'center' },
  section: { padding: Space.lg, gap: Space.sm },
  sectionTitle: { ...Type.caption, fontWeight: '600', marginLeft: Space.sm },
  sectionBody: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.md,
    gap: Space.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  sectionSub: { ...Type.caption },
  row: { gap: Space.xxs },
  rowLabel: { ...Type.bodyBold },
  rowValue: { ...Type.caption },
  button: {
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: Space.xs,
  },
  buttonText: { ...Type.bodyBold },
  toggle: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeChipText: { ...Type.bodyBold },
  descriptionText: { ...Type.body },
  tagline: {
    ...Type.body,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: Space.xs,
  },
  spacing: { height: Space.massive },
});
