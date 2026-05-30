/**
 * Tests for the pure check-in decision module. Run with:
 *   npx tsx services/__tests__/checkin-policy.test.ts
 *
 * Covers the orchestration paths that `handleCheckInResponse` delegates to:
 *  - Idempotency (resolved/disabled attempts)
 *  - Success (yes/tried), with and without level-up, with and without attempt
 *  - Snooze15 (first 'no')
 *  - Snooze30 (second 'no') — this case was unreachable under the old gate
 *  - Lapse (third consecutive 'no')
 *  - Android channelId branch
 */
import { startOfDay, subDays } from 'date-fns';
import {
  decideCheckInResponse,
  CHECKIN_CATEGORY,
  ANDROID_CHANNEL_ID,
} from '../checkin-policy';
import { Behavior, CheckIn, ReminderAttempt } from '../../types';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const B = 'b1';
const ATT = 'att1';
const today = startOfDay(Date.now()).getTime();
const day = (daysAgo: number, hour = 12) =>
  startOfDay(subDays(today, daysAgo)).getTime() + hour * 60 * 60 * 1000;

const makeBehavior = (overrides: Partial<Behavior> = {}): Behavior => ({
  id: B,
  kind: 'adopt',
  title: 'Morning pages',
  pingMessage: 'Two pages, longhand.',
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  window: { from: '09:00', to: '21:00' },
  intervalMinutes: 15,
  level: 1,
  lastLevelUpStreak: 0,
  createdAt: 0,
  hidden: false,
  bookmarked: false,
  ...overrides,
});

const makeAttempt = (overrides: Partial<ReminderAttempt> = {}): ReminderAttempt => ({
  id: ATT,
  behaviorId: B,
  scheduledFor: day(0, 10),
  phase: 'initial',
  status: 'scheduled',
  noCount: 0,
  createdAt: day(0, 9),
  updatedAt: day(0, 9),
  ...overrides,
});

const ci = (
  daysAgo: number,
  result: 'yes' | 'tried' | 'no',
  opts: { hour?: number; behaviorId?: string } = {}
): CheckIn => ({
  id: `${opts.behaviorId ?? B}-${daysAgo}-${opts.hour ?? 12}-${result}-${Math.random()}`,
  behaviorId: opts.behaviorId ?? B,
  at: day(daysAgo, opts.hour ?? 12),
  result,
});

const yesDays = (n: number): CheckIn[] =>
  Array.from({ length: n }, (_, i) => ci(i, 'yes'));

const now = Date.now();

// --- noop: missing behavior ---

{
  const decision = decideCheckInResponse('yes', undefined, makeAttempt(), [], 'ios', now);
  expect(decision.kind === 'noop', 'missing behavior → noop');
  expect(
    decision.kind === 'noop' && decision.reason === 'no-behavior',
    'missing behavior → reason: no-behavior'
  );
}

// --- noop: already-handled (resolved) ---

{
  const decision = decideCheckInResponse(
    'yes',
    makeBehavior(),
    makeAttempt({ status: 'resolved' }),
    [],
    'ios',
    now
  );
  expect(decision.kind === 'noop', 'resolved attempt → noop');
  expect(
    decision.kind === 'noop' && decision.reason === 'already-handled',
    'resolved attempt → reason: already-handled'
  );
}

// --- noop: already-handled (disabled) ---

{
  const decision = decideCheckInResponse(
    'no',
    makeBehavior(),
    makeAttempt({ status: 'disabled' }),
    [],
    'ios',
    now
  );
  expect(decision.kind === 'noop', 'disabled attempt → noop');
  expect(
    decision.kind === 'noop' && decision.reason === 'already-handled',
    'disabled attempt → reason: already-handled'
  );
}

// --- success: 'yes' below level-up threshold (streak 6) ---

{
  const checkIns = yesDays(6); // today + 5 prior days → streak 6
  const decision = decideCheckInResponse(
    'yes',
    makeBehavior(),
    makeAttempt(),
    checkIns,
    'ios',
    now
  );
  expect(decision.kind === 'success', 'yes streak=6 → success');
  expect(
    decision.kind === 'success' && decision.levelUp === undefined,
    'yes streak=6 → no levelUp'
  );
  expect(
    decision.kind === 'success' &&
      decision.resolveAttempt !== null &&
      decision.resolveAttempt.status === 'resolved',
    'yes streak=6 → resolveAttempt with status resolved'
  );
  expect(
    decision.kind === 'success' &&
      decision.resolveAttempt !== null &&
      decision.resolveAttempt.updatedAt === now,
    'yes streak=6 → resolveAttempt.updatedAt === now'
  );
}

// --- success: 'yes' crossing level-up threshold (streak 7, lastLevelUpStreak 0) ---

{
  const checkIns = yesDays(7);
  const decision = decideCheckInResponse(
    'yes',
    makeBehavior(),
    makeAttempt(),
    checkIns,
    'ios',
    now
  );
  expect(decision.kind === 'success', 'yes streak=7 → success');
  expect(
    decision.kind === 'success' && decision.levelUp !== undefined,
    'yes streak=7 → levelUp present'
  );
  expect(
    decision.kind === 'success' &&
      decision.levelUp !== undefined &&
      decision.levelUp.updatedBehavior.level === 2,
    'yes streak=7 → updatedBehavior.level === 2'
  );
  expect(
    decision.kind === 'success' &&
      decision.levelUp !== undefined &&
      decision.levelUp.updatedBehavior.lastLevelUpStreak === 7,
    'yes streak=7 → lastLevelUpStreak === 7'
  );
}

// --- success: 'yes' already-applied (streak 7, lastLevelUpStreak 7) ---

{
  const checkIns = yesDays(7);
  const decision = decideCheckInResponse(
    'yes',
    makeBehavior({ lastLevelUpStreak: 7 }),
    makeAttempt(),
    checkIns,
    'ios',
    now
  );
  expect(
    decision.kind === 'success' && decision.levelUp === undefined,
    'yes streak=7, lastLevelUpStreak=7 → no second level-up'
  );
}

// --- success: 'yes' at LEVEL_MAX clamps level but advances lastLevelUpStreak ---

{
  const checkIns = yesDays(35);
  const decision = decideCheckInResponse(
    'yes',
    makeBehavior({ level: 5, lastLevelUpStreak: 28 }),
    makeAttempt(),
    checkIns,
    'ios',
    now
  );
  expect(
    decision.kind === 'success' &&
      decision.levelUp !== undefined &&
      decision.levelUp.updatedBehavior.level === 5,
    'yes at LEVEL_MAX → level clamps at 5'
  );
  expect(
    decision.kind === 'success' &&
      decision.levelUp !== undefined &&
      decision.levelUp.updatedBehavior.lastLevelUpStreak === 35,
    'yes at LEVEL_MAX → lastLevelUpStreak still advances'
  );
}

// --- success: 'yes' without attempt still triggers level-up ---

{
  const checkIns = yesDays(7);
  const decision = decideCheckInResponse(
    'yes',
    makeBehavior(),
    undefined, // no attempt
    checkIns,
    'ios',
    now
  );
  expect(
    decision.kind === 'success' && decision.resolveAttempt === null,
    'yes without attempt → resolveAttempt === null'
  );
  expect(
    decision.kind === 'success' && decision.levelUp !== undefined,
    'yes without attempt + qualifying streak → levelUp still fires'
  );
}

// --- success: 'tried' resolves attempt but never levels up ---

{
  const checkIns = yesDays(7);
  // Inject a 'tried' today to model the actual response (otherwise streak would
  // be 7 from yes-only fixtures and we'd be testing the streak edge, not tried).
  const withTried = [ci(0, 'tried', { hour: 14 }), ...checkIns];
  const decision = decideCheckInResponse(
    'tried',
    makeBehavior(),
    makeAttempt(),
    withTried,
    'ios',
    now
  );
  expect(decision.kind === 'success', 'tried → success');
  expect(
    decision.kind === 'success' && decision.levelUp === undefined,
    'tried never triggers levelUp'
  );
  expect(
    decision.kind === 'success' &&
      decision.resolveAttempt !== null &&
      decision.resolveAttempt.status === 'resolved',
    'tried → resolveAttempt with status resolved'
  );
}

// --- snooze15: first 'no' (attempt.noCount=0, consecutiveNos=1) ---

{
  const checkIns: CheckIn[] = [ci(0, 'no', { hour: 10 })];
  const decision = decideCheckInResponse(
    'no',
    makeBehavior(),
    makeAttempt({ noCount: 0 }),
    checkIns,
    'ios',
    now
  );
  expect(decision.kind === 'snooze', 'first no → snooze');
  if (decision.kind === 'snooze') {
    expect(decision.phase === 'snooze15', 'first no → phase snooze15');
    expect(decision.newAttempt.noCount === 1, 'first no → newAttempt.noCount === 1');
    expect(
      decision.newAttempt.phase === 'snooze15',
      'first no → newAttempt.phase === snooze15'
    );
    expect(
      decision.newAttempt.status === 'scheduled',
      'first no → newAttempt.status === scheduled'
    );
    expect(
      decision.newAttempt.scheduledFor === now + 15 * 60 * 1000,
      'first no → scheduledFor 15min ahead'
    );
    expect(
      decision.content.categoryIdentifier === CHECKIN_CATEGORY,
      'first no → content carries CHECKIN_CATEGORY'
    );
    expect(
      decision.content.data.phase === 'snooze15',
      'first no → content.data.phase === snooze15'
    );
    expect(
      decision.updateAttempt.status === 'skipped' && decision.updateAttempt.noCount === 1,
      'first no → updateAttempt skipped with noCount=1'
    );
  }
}

// --- snooze30: second 'no' (attempt.noCount=1, consecutiveNos=2) — the bug fix ---

{
  const checkIns: CheckIn[] = [
    ci(0, 'no', { hour: 10 }),
    ci(0, 'no', { hour: 11 }),
  ];
  const decision = decideCheckInResponse(
    'no',
    makeBehavior(),
    makeAttempt({ noCount: 1, phase: 'snooze15' }),
    checkIns,
    'ios',
    now
  );
  expect(decision.kind === 'snooze', 'second no → snooze (was unreachable before)');
  if (decision.kind === 'snooze') {
    expect(decision.phase === 'snooze30', 'second no → phase snooze30');
    expect(decision.newAttempt.noCount === 2, 'second no → newAttempt.noCount === 2');
    expect(
      decision.newAttempt.scheduledFor === now + 30 * 60 * 1000,
      'second no → scheduledFor 30min ahead'
    );
    expect(
      decision.content.data.phase === 'snooze30',
      'second no → content.data.phase === snooze30'
    );
  }
}

// --- lapse: third consecutive 'no' ---

{
  const checkIns: CheckIn[] = [
    ci(0, 'no', { hour: 10 }),
    ci(0, 'no', { hour: 11 }),
    ci(0, 'no', { hour: 12 }),
  ];
  const decision = decideCheckInResponse(
    'no',
    makeBehavior({ level: 3 }),
    makeAttempt({ noCount: 2, phase: 'snooze30' }),
    checkIns,
    'ios',
    now
  );
  expect(decision.kind === 'lapse', 'third consecutive no → lapse');
  if (decision.kind === 'lapse') {
    expect(
      decision.updatedBehavior.level === 2,
      'lapse demotes level (3 → 2)'
    );
    expect(
      decision.updatedBehavior.lastLevelUpStreak === 0,
      'lapse resets lastLevelUpStreak to 0'
    );
    expect(
      typeof decision.updatedBehavior.pausedUntil === 'number' &&
        decision.updatedBehavior.pausedUntil! > now,
      'lapse sets pausedUntil to end-of-day (future timestamp)'
    );
    expect(
      decision.appProfilePatch.lastLapseAt === now,
      'lapse → appProfilePatch.lastLapseAt === now'
    );
    expect(
      decision.appProfilePatch.lastLapseAcknowledged === false,
      'lapse → appProfilePatch.lastLapseAcknowledged === false'
    );
    expect(
      decision.updateAttempt.status === 'skipped' && decision.updateAttempt.noCount === 3,
      'lapse → updateAttempt skipped with noCount=3'
    );
  }
}

// --- lapse at level 1: demotion floors at 1 but pause + AppProfile patch still apply ---

{
  const checkIns: CheckIn[] = [
    ci(0, 'no', { hour: 10 }),
    ci(0, 'no', { hour: 11 }),
    ci(0, 'no', { hour: 12 }),
  ];
  const decision = decideCheckInResponse(
    'no',
    makeBehavior({ level: 1 }),
    makeAttempt({ noCount: 2 }),
    checkIns,
    'ios',
    now
  );
  expect(decision.kind === 'lapse', 'lapse at level 1 still fires');
  if (decision.kind === 'lapse') {
    expect(
      decision.updatedBehavior.level === 1,
      'lapse at level 1 → level stays at 1 (floor)'
    );
    expect(
      decision.appProfilePatch.lastLapseAt === now,
      'lapse at level 1 → AppProfile patch still applied'
    );
  }
}

// --- noop: 'no' without attempt ---

{
  const decision = decideCheckInResponse(
    'no',
    makeBehavior(),
    undefined,
    [ci(0, 'no')],
    'ios',
    now
  );
  expect(
    decision.kind === 'noop' && decision.reason === 'no-attempt-for-no',
    'no without attempt → noop/no-attempt-for-no'
  );
}

// --- platform: android snooze content has channelId ---

{
  const decision = decideCheckInResponse(
    'no',
    makeBehavior(),
    makeAttempt({ noCount: 0 }),
    [ci(0, 'no', { hour: 10 })],
    'android',
    now
  );
  expect(
    decision.kind === 'snooze' && decision.content.channelId === ANDROID_CHANNEL_ID,
    'android → content.channelId === ANDROID_CHANNEL_ID'
  );
}

// --- platform: ios snooze content omits channelId ---

{
  const decision = decideCheckInResponse(
    'no',
    makeBehavior(),
    makeAttempt({ noCount: 0 }),
    [ci(0, 'no', { hour: 10 })],
    'ios',
    now
  );
  expect(
    decision.kind === 'snooze' && decision.content.channelId === undefined,
    'ios → content.channelId undefined'
  );
}

// --- content body: eliminate prefix ---

{
  const decision = decideCheckInResponse(
    'no',
    makeBehavior({ kind: 'eliminate', pingMessage: 'scrolling' }),
    makeAttempt({ noCount: 0 }),
    [ci(0, 'no', { hour: 10 })],
    'ios',
    now
  );
  expect(
    decision.kind === 'snooze' && decision.content.body === 'CATCH IT — scrolling',
    'eliminate behavior → content.body has CATCH IT prefix'
  );
}

// --- content body: adopt has no prefix ---

{
  const decision = decideCheckInResponse(
    'no',
    makeBehavior({ kind: 'adopt', pingMessage: 'write' }),
    makeAttempt({ noCount: 0 }),
    [ci(0, 'no', { hour: 10 })],
    'ios',
    now
  );
  expect(
    decision.kind === 'snooze' && decision.content.body === 'write',
    'adopt behavior → content.body is pingMessage as-is'
  );
}

// --- summary ---

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('All checkin-policy tests passed.');
