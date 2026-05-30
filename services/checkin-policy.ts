/**
 * Pure decision module for check-in responses.
 *
 * Mirrors the side-effect-free pattern used by `scheduler-core.ts`, `streak.ts`,
 * and `levels.ts`. The orchestrator in `notifications.ts` reads store state,
 * delegates the decision here, and applies the resulting effects.
 *
 * Kept free of imports from `expo-notifications`, `react-native`, and the
 * Zustand store so it can be unit-tested with plain `tsx` like its peers.
 */
import { addMinutes } from 'date-fns';
import { Behavior, CheckIn, ReminderAttempt } from '../types';
import { calculateStreak, consecutiveNoCount } from './streak';
import {
  shouldLevelUp,
  applyLevelUp,
  applyLapse,
  LAPSE_NO_THRESHOLD,
} from './levels';
import { endOfLocalDay } from './scheduler-core';
import { generateUUID } from '../utils/uuid';

export const CHECKIN_CATEGORY = 'behavior_checkin';
export const ANDROID_CHANNEL_ID = 'reprogrammer-checkin';

/**
 * Subset of expo-notifications' `NotificationContentInput` we actually
 * construct. Declared locally so this module does not depend on the SDK.
 * The orchestrator casts to the SDK type before calling `scheduleNotificationAsync`.
 */
export interface CheckInNotificationContent {
  title: string;
  body: string;
  sound: boolean;
  vibrate: number[];
  categoryIdentifier: string;
  data: { behaviorId: string; attemptId: string; phase: 'snooze15' | 'snooze30' };
  channelId?: string;
}

export type CheckInDecision =
  | { kind: 'noop'; reason: 'no-behavior' | 'already-handled' | 'no-attempt-for-no' }
  | {
      kind: 'success';
      resolveAttempt: ReminderAttempt | null;
      levelUp?: { updatedBehavior: Behavior };
    }
  | {
      kind: 'lapse';
      updateAttempt: ReminderAttempt;
      updatedBehavior: Behavior;
      appProfilePatch: { lastLapseAt: number; lastLapseAcknowledged: false };
    }
  | {
      kind: 'snooze';
      updateAttempt: ReminderAttempt;
      phase: 'snooze15' | 'snooze30';
      newAttempt: Omit<ReminderAttempt, 'notificationId'>;
      content: CheckInNotificationContent;
    }
  | { kind: 'skip'; updateAttempt: ReminderAttempt };

export function decideCheckInResponse(
  result: 'yes' | 'tried' | 'no',
  behavior: Behavior | undefined,
  attempt: ReminderAttempt | undefined,
  checkIns: CheckIn[],
  platform: 'ios' | 'android',
  now: number = Date.now()
): CheckInDecision {
  if (!behavior) return { kind: 'noop', reason: 'no-behavior' };

  if (attempt && (attempt.status === 'resolved' || attempt.status === 'disabled')) {
    return { kind: 'noop', reason: 'already-handled' };
  }

  if (result === 'yes' || result === 'tried') {
    const resolveAttempt: ReminderAttempt | null = attempt
      ? { ...attempt, status: 'resolved', updatedAt: now }
      : null;

    // Only a clean 'yes' day can level up; 'tried' preserves but never advances.
    if (result === 'yes') {
      const streak = calculateStreak(behavior.id, checkIns);
      if (shouldLevelUp(streak, behavior.lastLevelUpStreak)) {
        return {
          kind: 'success',
          resolveAttempt,
          levelUp: { updatedBehavior: applyLevelUp(behavior, streak) },
        };
      }
    }
    return { kind: 'success', resolveAttempt };
  }

  // result === 'no'
  if (!attempt) return { kind: 'noop', reason: 'no-attempt-for-no' };

  const noCount = attempt.noCount + 1;
  const updateAttempt: ReminderAttempt = {
    ...attempt,
    status: 'skipped',
    noCount,
    updatedAt: now,
  };

  const consecutiveNos = consecutiveNoCount(behavior.id, checkIns);
  if (consecutiveNos >= LAPSE_NO_THRESHOLD) {
    return {
      kind: 'lapse',
      updateAttempt,
      updatedBehavior: {
        ...applyLapse(behavior),
        pausedUntil: endOfLocalDay(now),
      },
      appProfilePatch: { lastLapseAt: now, lastLapseAcknowledged: false },
    };
  }

  // Previously gated on `noCount < 2`, which made snooze30 unreachable: each
  // new attempt is created with `noCount: 1`, so the second 'no' computed
  // `noCount = 2` and the gate skipped scheduling entirely. Restored to the
  // documented snooze15 → snooze30 → lapse cadence.
  if (noCount < 3) {
    const phase: 'snooze15' | 'snooze30' = noCount === 1 ? 'snooze15' : 'snooze30';
    const snoozeMinutes = phase === 'snooze15' ? 15 : 30;
    const snoozeTime = addMinutes(now, snoozeMinutes);
    const newAttemptId = generateUUID();

    const content: CheckInNotificationContent = {
      title: behavior.title,
      body:
        behavior.kind === 'eliminate'
          ? `CATCH IT — ${behavior.pingMessage}`
          : behavior.pingMessage,
      sound: true,
      vibrate: [0, 250, 250, 250],
      categoryIdentifier: CHECKIN_CATEGORY,
      data: { behaviorId: behavior.id, attemptId: newAttemptId, phase },
    };
    if (platform === 'android') {
      content.channelId = ANDROID_CHANNEL_ID;
    }

    const newAttempt: Omit<ReminderAttempt, 'notificationId'> = {
      id: newAttemptId,
      behaviorId: behavior.id,
      scheduledFor: snoozeTime.getTime(),
      phase,
      status: 'scheduled',
      noCount,
      createdAt: now,
      updatedAt: now,
    };

    return { kind: 'snooze', updateAttempt, phase, newAttempt, content };
  }

  // noCount ≥ 3 but consecutiveNos < LAPSE_NO_THRESHOLD: the chain accumulated
  // 'no's that were interrupted by other-chain check-ins. Mark skipped without
  // snooze or lapse.
  return { kind: 'skip', updateAttempt };
}
