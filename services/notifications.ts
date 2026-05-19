import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Behavior, ReminderAttempt } from '../types';
import { addDays, addMinutes, startOfDay } from 'date-fns';
import { generateUUID } from '../utils/uuid';
import useStore from '../store/useStore';
import {
  effectiveIntervalMinutes,
  onNo,
  onYes,
  perBehaviorDailyCap,
} from './fsrs';

const MAX_SCHEDULED = 60;
const RESCHEDULE_THROTTLE_MS = 60 * 1000;
const MIN_GAP_RATIO = 0.4;
let lastRescheduleAt = 0;

export const CHECKIN_CATEGORY = 'behavior_checkin';
export const ACTION_YES = 'CHECKIN_YES';
export const ACTION_NO = 'CHECKIN_NO';
export const ACTION_OFF = 'CHECKIN_OFF';

let categoryRegistered = false;

export async function setupNotificationCategory(): Promise<void> {
  if (categoryRegistered) return;
  await Notifications.setNotificationCategoryAsync(CHECKIN_CATEGORY, [
    {
      identifier: ACTION_YES,
      buttonTitle: '✓ Did it',
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_NO,
      buttonTitle: '✗ Missed',
      options: { opensAppToForeground: false, isDestructive: true },
    },
    {
      identifier: ACTION_OFF,
      buttonTitle: 'Turn off',
      options: { opensAppToForeground: false },
    },
  ]);
  categoryRegistered = true;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function parseHHmmOnDay(time: string, date: Date): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function sampleExponential(meanMs: number, rng: () => number): number {
  const u = Math.max(rng(), 1e-9);
  return -Math.log(u) * meanMs;
}

export function generateTimesForDay(args: {
  date: Date;
  windowFrom: string;
  windowTo: string;
  intervalMinutes: number;
  stability: number;
  now: number;
  rng?: () => number;
  maxPings?: number;
}): number[] {
  const {
    date,
    windowFrom,
    windowTo,
    intervalMinutes,
    stability,
    now,
    rng = Math.random,
    maxPings,
  } = args;
  const windowStart = parseHHmmOnDay(windowFrom, date);
  const windowEnd = parseHHmmOnDay(windowTo, date);
  const fullWindowMs = windowEnd - windowStart;
  if (fullWindowMs <= 0 || intervalMinutes <= 0) return [];

  const effMin = effectiveIntervalMinutes(intervalMinutes, stability);
  const meanMs = effMin * 60 * 1000;
  const minGapMs = meanMs * MIN_GAP_RATIO;
  const earliest = Math.max(now, windowStart);

  const times: number[] = [];
  let t = windowStart;
  let safety = 0;
  while (safety++ < 5000) {
    const gap = Math.max(sampleExponential(meanMs, rng), minGapMs);
    t += gap;
    if (t >= windowEnd) break;
    if (t < earliest) continue;
    times.push(Math.floor(t));
    if (maxPings && times.length >= maxPings) break;
  }
  return times;
}

interface Candidate {
  behavior: Behavior;
  timestamp: number;
}

function buildCandidatesForBehavior(
  behavior: Behavior,
  now: number,
  daysHorizon: number = 7
): Candidate[] {
  const results: Candidate[] = [];
  const windowHours =
    (parseHHmmOnDay(behavior.window.to, new Date(now)) -
      parseHHmmOnDay(behavior.window.from, new Date(now))) /
    (60 * 60 * 1000);
  const dailyCap = perBehaviorDailyCap(
    behavior.intervalMinutes,
    behavior.stability,
    Math.max(0, windowHours)
  );
  for (let dayOffset = 0; dayOffset < daysHorizon; dayOffset++) {
    const date = addDays(startOfDay(now), dayOffset);
    if (!behavior.activeDays.includes(date.getDay())) continue;
    if (behavior.pausedUntil && date.getTime() < behavior.pausedUntil) continue;
    const times = generateTimesForDay({
      date,
      windowFrom: behavior.window.from,
      windowTo: behavior.window.to,
      intervalMinutes: behavior.intervalMinutes,
      stability: behavior.stability,
      now,
      maxPings: dailyCap,
    });
    for (const ts of times) {
      results.push({ behavior, timestamp: ts });
    }
  }
  return results;
}

const SCHEDULE_LEAD_MS = 1000;

async function scheduleCandidate(c: Candidate): Promise<void> {
  if (c.timestamp <= Date.now() + SCHEDULE_LEAD_MS) return;
  const store = useStore.getState();
  const attemptId = generateUUID();
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: c.behavior.title,
        body: c.behavior.pingMessage,
        sound: true,
        vibrate: [0, 250, 250, 250],
        categoryIdentifier: CHECKIN_CATEGORY,
        data: {
          behaviorId: c.behavior.id,
          attemptId,
          phase: 'initial',
        },
      },
      trigger: {
        type: 'date',
        date: new Date(c.timestamp),
      } as any,
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
  await cancelForBehavior(behavior.id);
  if (behavior.hidden) return;
  const now = Date.now();
  const candidates = buildCandidatesForBehavior(behavior, now);
  for (const c of candidates) {
    await scheduleCandidate(c);
  }
}

export async function rescheduleAll(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (!options?.force && now - lastRescheduleAt < RESCHEDULE_THROTTLE_MS) return;
  lastRescheduleAt = now;

  const store = useStore.getState();

  for (const b of store.behaviors) {
    await cancelForBehavior(b.id);
  }

  const active = store.behaviors.filter((b) => !b.hidden);
  const daysHorizon = Math.max(
    1,
    Math.min(7, Math.ceil(MAX_SCHEDULED / Math.max(1, active.length * 20)))
  );

  const all: Candidate[] = [];
  for (const b of active) {
    all.push(...buildCandidatesForBehavior(b, now, daysHorizon));
  }
  all.sort((a, b) => a.timestamp - b.timestamp);
  const toSchedule = all.slice(0, MAX_SCHEDULED);
  for (const c of toSchedule) {
    await scheduleCandidate(c);
  }
}

export async function cancelForBehavior(behaviorId: string): Promise<void> {
  const store = useStore.getState();
  const attempts = store.getReminderAttempts(behaviorId);

  for (const attempt of attempts) {
    if (attempt.status !== 'scheduled') continue;
    if (attempt.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(attempt.notificationId);
      } catch {
        // notification may have already fired or expired
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

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: behavior.title,
      body: behavior.pingMessage,
      sound: true,
      vibrate: [0, 250, 250, 250],
      categoryIdentifier: CHECKIN_CATEGORY,
      data: {
        behaviorId: behavior.id,
        attemptId,
        phase: 'initial',
      },
    },
    trigger: {
      type: 'timeInterval',
      seconds: 1,
      repeats: false,
    } as any,
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

export async function handleNotificationAction(
  behaviorId: string,
  attemptId: string,
  actionId: string
): Promise<void> {
  const store = useStore.getState();
  const behavior = store.behaviors.find((b) => b.id === behaviorId);
  if (!behavior) return;

  if (actionId === ACTION_OFF) {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    await store.updateBehavior({ ...behavior, pausedUntil: endOfDay.getTime() });
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
  };
  await store.addCheckIn(checkIn);
  await handleCheckInResponse(behaviorId, attemptId, result);
}

export async function handleCheckInResponse(
  behaviorId: string,
  attemptId: string,
  result: 'yes' | 'no'
): Promise<void> {
  const store = useStore.getState();

  const attempt = store.reminderAttempts.find((a) => a.id === attemptId);
  if (!attempt) return;

  const behavior = store.behaviors.find((b) => b.id === behaviorId);
  if (!behavior) return;

  if (result === 'yes') {
    await store.updateReminderAttempt({
      ...attempt,
      status: 'resolved',
      updatedAt: Date.now(),
    });
    await store.updateBehavior(onYes(behavior));
    return;
  }

  const nextPhase: 'snooze15' | 'snooze30' = attempt.noCount >= 1 ? 'snooze30' : 'snooze15';
  const snoozeMinutes = nextPhase === 'snooze15' ? 15 : 30;
  const snoozeTime = addMinutes(Date.now(), snoozeMinutes);

  await store.updateReminderAttempt({
    ...attempt,
    status: 'skipped',
    updatedAt: Date.now(),
    noCount: attempt.noCount + 1,
  });

  const updatedBehavior = onNo(behavior);

  if (attempt.noCount < 2) {
    await store.updateBehavior(updatedBehavior);
    const newAttemptId = generateUUID();
    const newNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: behavior.title,
        body: behavior.pingMessage,
        sound: true,
        vibrate: [0, 250, 250, 250],
        categoryIdentifier: CHECKIN_CATEGORY,
        data: {
          behaviorId,
          attemptId: newAttemptId,
          phase: nextPhase,
        },
      },
      trigger: {
        type: 'date',
        date: snoozeTime,
      } as any,
    });

    const newAttempt: ReminderAttempt = {
      id: newAttemptId,
      behaviorId,
      scheduledFor: snoozeTime.getTime(),
      phase: nextPhase,
      status: 'scheduled',
      noCount: attempt.noCount + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notificationId: newNotificationId,
    };
    await store.addReminderAttempt(newAttempt);
  } else {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    await store.updateBehavior({
      ...updatedBehavior,
      pausedUntil: endOfDay.getTime(),
    });
    await cancelForBehavior(behaviorId);
  }
}
