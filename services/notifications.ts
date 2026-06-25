import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Behavior, ReminderAttempt } from '../types';
import { addDays, startOfDay } from 'date-fns';
import { generateUUID } from '../utils/uuid';
import useStore from '../store/useStore';
import { perBehaviorDailyCap } from './levels';
import {
  generateTimesForDay,
  setLocalTimeOnDate,
  endOfLocalDay,
  dateKey,
  hashSeed,
  mulberry32,
  isReminderMuteActive,
  hasActiveFocusSession,
  parseHHmm,
  SCHEDULE_LEAD_MS,
} from './scheduler-core';
import {
  decideCheckInResponse,
  CHECKIN_CATEGORY,
  ANDROID_CHANNEL_ID,
} from './checkin-policy';

export { generateTimesForDay } from './scheduler-core';
export { CHECKIN_CATEGORY } from './checkin-policy';

const MAX_SCHEDULED = 60;
const RESCHEDULE_THROTTLE_MS = 60 * 1000;
const DAYS_HORIZON = 7;

let lastRescheduleAt = 0;
let categoryRegistered = false;
let channelRegistered = false;

export const ACTION_YES = 'CHECKIN_YES';
export const ACTION_NO = 'CHECKIN_NO';
export const ACTION_OFF = 'CHECKIN_OFF';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationCategory(): Promise<void> {
  // Notification categories/channels are native-only; the underlying APIs
  // throw on web. Skip cleanly so the web build (and dev preview) don't crash.
  if (Platform.OS === 'web') return;
  if (!categoryRegistered) {
    await Notifications.setNotificationCategoryAsync(CHECKIN_CATEGORY, [
      {
        identifier: ACTION_YES,
        buttonTitle: 'Check-in',
        options: { opensAppToForeground: false },
      },
      {
        identifier: ACTION_NO,
        buttonTitle: 'Snooze',
        options: { opensAppToForeground: false, isDestructive: false },
      },
      {
        identifier: ACTION_OFF,
        buttonTitle: 'Pause today',
        options: { opensAppToForeground: false },
      },
    ]);
    categoryRegistered = true;
  }
  if (Platform.OS === 'android' && !channelRegistered) {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Check-ins',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    channelRegistered = true;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

interface Candidate {
  behavior: Behavior;
  timestamp: number;
}

function buildCandidatesForBehavior(
  behavior: Behavior,
  now: number,
  daysHorizon: number,
  quietHours?: { from: string; to: string }
): Candidate[] {
  const results: Candidate[] = [];
  // Indefinite pause (REP-34): no timestamp to filter against, so skip the
  // behavior entirely — "always skip" until the user manually resumes.
  if (behavior.pausedIndefinitely) return results;
  const baseDate = new Date(now);
  const windowFromMin =
    setLocalTimeOnDate(baseDate, behavior.window.from) - startOfDay(baseDate).getTime();
  const windowToMin =
    setLocalTimeOnDate(baseDate, behavior.window.to) - startOfDay(baseDate).getTime();
  const windowMs = Math.max(0, windowToMin - windowFromMin);
  const windowHours = windowMs / (60 * 60 * 1000);
  const dailyCap = perBehaviorDailyCap(behavior.intervalMinutes, behavior.level, windowHours);

  for (let dayOffset = 0; dayOffset < daysHorizon; dayOffset++) {
    const date = addDays(startOfDay(now), dayOffset);
    if (!behavior.activeDays.includes(date.getDay())) continue;

    const rng = mulberry32(hashSeed(behavior.id, dateKey(date)));
    const times = generateTimesForDay({
      date,
      windowFrom: behavior.window.from,
      windowTo: behavior.window.to,
      intervalMinutes: behavior.intervalMinutes,
      level: behavior.level,
      now,
      rng,
      maxPings: dailyCap,
      quietHours,
      pausedUntil: behavior.pausedUntil,
    });
    for (const ts of times) {
      results.push({ behavior, timestamp: ts });
    }
  }
  return results;
}

async function scheduleCandidate(c: Candidate): Promise<void> {
  if (c.timestamp <= Date.now() + SCHEDULE_LEAD_MS) return;
  const store = useStore.getState();
  const attemptId = generateUUID();

  const body =
    c.behavior.kind === 'eliminate'
      ? `CATCH IT — ${c.behavior.pingMessage}`
      : c.behavior.pingMessage;

  try {
    const content: Notifications.NotificationContentInput = {
      title: c.behavior.title,
      body,
      sound: true,
      vibrate: [0, 250, 250, 250],
      categoryIdentifier: CHECKIN_CATEGORY,
      data: {
        behaviorId: c.behavior.id,
        attemptId,
        phase: 'initial',
      },
    };
    if (Platform.OS === 'android') {
      (content as any).channelId = ANDROID_CHANNEL_ID;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: 'date', date: new Date(c.timestamp) } as any,
    });

    const attempt: ReminderAttempt = {
      id: attemptId,
      behaviorId: c.behavior.id,
      scheduledFor: c.timestamp,
      phase: 'initial',
      status: 'scheduled',
      noCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notificationId,
    };
    await store.addReminderAttempt(attempt);
  } catch (error) {
    console.error('[SCHEDULER] Failed to schedule notification:', error);
  }
}

export async function scheduleForBehavior(behavior: Behavior): Promise<void> {
  await rescheduleAll({ force: true });
}

export async function rescheduleAll(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (!options?.force && now - lastRescheduleAt < RESCHEDULE_THROTTLE_MS) return;
  lastRescheduleAt = now;

  const store = useStore.getState();
  await cancelAllScheduled();

  // Global mute (REP-35): everything is cancelled above; schedule nothing until
  // un-muted. Honored here so launch + foreground reschedules both stay silent.
  if (isReminderMuteActive(store.appProfile, now)) return;

  // A live Pull-mode focus session (REP-7) is a self-imposed DND — a posture
  // ping mid-deep-work is the exact distraction being measured. Stay silent
  // until the session ends (or the safety cap elapses).
  if (hasActiveFocusSession(store.focusSessions, now)) return;

  const active = store.behaviors.filter((b) => !b.hidden);
  if (active.length === 0) return;

  const quietHours = store.appProfile.quietHours;
  const all: Candidate[] = [];
  for (const b of active) {
    all.push(...buildCandidatesForBehavior(b, now, DAYS_HORIZON, quietHours));
  }
  all.sort((a, b) => a.timestamp - b.timestamp);
  const toSchedule = all.slice(0, MAX_SCHEDULED);
  for (const c of toSchedule) {
    await scheduleCandidate(c);
  }
}

/**
 * Book programs (the pivot): a single daily "practice digest" reminder that
 * deep-links into Today. Replaces the per-behavior jitter pings for programs —
 * one calm nudge at the user's chosen time, not a stream. Self-contained
 * (cancels + reschedules its own identifier) so it survives `rescheduleAll`'s
 * behavior-only cancellation; call it on launch, on foreground, and after
 * enrolling. Honors the same global mute / notifications-denied rules.
 */
export const DAILY_DIGEST_ID = 'program-daily-digest';

export async function scheduleDailyDigest(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_DIGEST_ID);
  } catch {
    // not scheduled yet; ignore
  }

  const store = useStore.getState();
  if (store.appProfile.notificationsDenied) return;
  if (isReminderMuteActive(store.appProfile, Date.now())) return;

  const active = store.programEnrollments.filter(
    (e) => e.status === 'active' && e.deletedAt == null,
  );
  if (active.length === 0) return;

  // One digest at the earliest reminder time across active programs.
  const time = [...active.map((e) => e.reminderTime)].sort()[0] ?? '09:00';
  const { h, m } = parseHHmm(time);
  const body =
    active.length === 1
      ? "Today's practice is ready — pick up where you left off."
      : `Your practice today: ${active.length} programs.`;

  const content: Notifications.NotificationContentInput = {
    title: 'Reprogrammer',
    body,
    sound: true,
    data: { deepLink: 'today' },
  };
  if (Platform.OS === 'android') {
    (content as any).channelId = ANDROID_CHANNEL_ID;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_DIGEST_ID,
      content,
      trigger: { type: 'daily', hour: h, minute: m, repeats: true } as any,
    });
  } catch (error) {
    console.error('[DIGEST] Failed to schedule daily digest:', error);
  }
}

async function cancelAllScheduled(): Promise<void> {
  const store = useStore.getState();
  const open = store.reminderAttempts.filter((a) => a.status === 'scheduled');
  for (const attempt of open) {
    if (attempt.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(attempt.notificationId);
      } catch {
        // already fired or invalid; safe to ignore
      }
    }
    await store.updateReminderAttempt({
      ...attempt,
      status: 'disabled',
      updatedAt: Date.now(),
    });
  }
}

export async function cancelForBehavior(behaviorId: string): Promise<void> {
  const store = useStore.getState();
  const attempts = store.reminderAttempts.filter(
    (a) => a.behaviorId === behaviorId && a.status === 'scheduled'
  );
  for (const attempt of attempts) {
    if (attempt.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(attempt.notificationId);
      } catch {
        // already fired
      }
    }
    await store.updateReminderAttempt({
      ...attempt,
      status: 'disabled',
      updatedAt: Date.now(),
    });
  }
}

export async function sendTestNotification(behavior: Behavior): Promise<void> {
  const store = useStore.getState();
  const attemptId = generateUUID();

  const content: Notifications.NotificationContentInput = {
    title: behavior.title,
    body: behavior.pingMessage,
    sound: true,
    vibrate: [0, 250, 250, 250],
    categoryIdentifier: CHECKIN_CATEGORY,
    data: { behaviorId: behavior.id, attemptId, phase: 'initial' },
  };
  if (Platform.OS === 'android') {
    (content as any).channelId = ANDROID_CHANNEL_ID;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content,
    trigger: { type: 'timeInterval', seconds: 1, repeats: false } as any,
  });

  const attempt: ReminderAttempt = {
    id: attemptId,
    behaviorId: behavior.id,
    scheduledFor: Date.now() + 1000,
    phase: 'initial',
    status: 'scheduled',
    noCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    notificationId,
  };
  await store.addReminderAttempt(attempt);
}

/**
 * A one-off real notification used only by onboarding (REP-39) so a new user can
 * feel a ping. It carries no check-in category actions and creates no attempt —
 * tapping it simply walks the onboarding tour forward (handled in _layout). On
 * web there are no local banners, so this is a clean no-op.
 */
export async function sendOnboardingPing(): Promise<void> {
  if (Platform.OS === 'web') return;
  const content: Notifications.NotificationContentInput = {
    title: 'Reprogrammer',
    body: 'This is a ping. Tap it to continue your setup.',
    sound: true,
    data: { onboardingDemo: true },
  };
  if (Platform.OS === 'android') {
    (content as any).channelId = ANDROID_CHANNEL_ID;
  }
  await Notifications.scheduleNotificationAsync({
    content,
    trigger: { type: 'timeInterval', seconds: 1, repeats: false } as any,
  });
}

export async function handleNotificationAction(
  behaviorId: string,
  attemptId: string,
  actionId: string
): Promise<void> {
  const store = useStore.getState();
  const behavior = store.behaviors.find((b) => b.id === behaviorId);
  if (!behavior) return;

  if (actionId === ACTION_OFF) {
    await store.updateBehavior({ ...behavior, pausedUntil: endOfLocalDay() });
    await cancelForBehavior(behaviorId);
    return;
  }

  const result: 'yes' | 'no' | null =
    actionId === ACTION_YES ? 'yes' : actionId === ACTION_NO ? 'no' : null;
  if (!result) return;

  const checkIn = {
    id: generateUUID(),
    behaviorId,
    at: Date.now(),
    result,
    updatedAt: Date.now(),
  };
  await store.addCheckIn(checkIn);
  await handleCheckInResponse(behaviorId, attemptId, result);
}

export async function handleCheckInResponse(
  behaviorId: string,
  attemptId: string,
  result: 'yes' | 'tried' | 'no'
): Promise<void> {
  const store = useStore.getState();
  const attempt = store.reminderAttempts.find((a) => a.id === attemptId);
  const behavior = store.behaviors.find((b) => b.id === behaviorId);
  const platform: 'ios' | 'android' = Platform.OS === 'android' ? 'android' : 'ios';

  const decision = decideCheckInResponse(
    result,
    behavior,
    attempt,
    store.checkIns,
    platform
  );

  switch (decision.kind) {
    case 'noop':
      return;

    case 'success':
      if (decision.resolveAttempt) {
        await store.updateReminderAttempt(decision.resolveAttempt);
      }
      if (decision.levelUp) {
        await store.updateBehavior(decision.levelUp.updatedBehavior);
        await rescheduleAll({ force: true });
      }
      return;

    case 'lapse':
      await store.updateReminderAttempt(decision.updateAttempt);
      await store.updateBehavior(decision.updatedBehavior);
      await cancelForBehavior(behaviorId);
      await store.updateAppProfile(decision.appProfilePatch);
      return;

    case 'snooze': {
      await store.updateReminderAttempt(decision.updateAttempt);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: decision.content as Notifications.NotificationContentInput,
        trigger: {
          type: 'date',
          date: new Date(decision.newAttempt.scheduledFor),
        } as any,
      });
      await store.addReminderAttempt({ ...decision.newAttempt, notificationId });
      return;
    }

    case 'skip':
      await store.updateReminderAttempt(decision.updateAttempt);
      return;
  }
}
