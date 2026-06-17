/**
 * Self-test for the Weekly Review aggregation (REP-5 Phase 1). Run with:
 *   tsx services/__tests__/weekly-review.test.ts
 *
 * Verifies window boundaries, success/tried/rep counts, week-over-week delta,
 * the hard-day note pick, current-week streak, hidden-behavior exclusion, and
 * overall regression detection.
 */
import {
  buildWeeklyReview,
  weekWindow,
  windowDayStatuses,
  WEEK_DAYS,
} from '../weekly-review';
import { Behavior, CaptureEntry, CheckIn } from '../../types';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const DAY = 24 * 60 * 60 * 1000;
const todayStart = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();
const NOW = todayStart + 12 * 60 * 60 * 1000; // today noon

const mk = (id: string, over: Partial<Behavior> = {}): Behavior => ({
  id,
  kind: 'adopt',
  title: id,
  pingMessage: '',
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  window: { from: '09:00', to: '21:00' },
  intervalMinutes: 30,
  level: 1,
  lastLevelUpStreak: 0,
  createdAt: 0,
  hidden: false,
  bookmarked: false,
  ...over,
});

const ci = (
  behaviorId: string,
  daysAgo: number,
  result: 'yes' | 'tried' | 'no',
  note?: string
): CheckIn => ({
  id: `${behaviorId}-${daysAgo}-${result}`,
  behaviorId,
  at: todayStart - daysAgo * DAY + 12 * 60 * 60 * 1000,
  result,
  note,
});

const at = (daysAgo: number) => todayStart - daysAgo * DAY + 12 * 60 * 60 * 1000;

// Window math: a 7-day, day-aligned window; today is the last day.
const w0 = weekWindow(NOW, 0);
expect(w0.end - w0.start === WEEK_DAYS * DAY, 'window spans exactly 7 days');
expect(w0.end === todayStart + DAY, 'window ends at start of tomorrow');
const wPrev = weekWindow(NOW, 1);
expect(wPrev.end === w0.start, 'prior window abuts the current one (no overlap)');

// Behavior "a": 3 success + 1 tried(note) + 1 no this week; 2 success last week.
const a = mk('a');
const hidden = mk('h', { hidden: true });
const checkIns: CheckIn[] = [
  ci('a', 0, 'yes'),
  ci('a', 1, 'yes'),
  ci('a', 2, 'yes'),
  ci('a', 3, 'tried', 'this one was hard'),
  ci('a', 4, 'no'),
  ci('a', 7, 'yes'),
  ci('a', 8, 'yes'),
  // hidden behavior should be excluded entirely
  ci('h', 0, 'yes'),
];

const dayStatuses = windowDayStatuses(checkIns, 'a', w0);
expect(dayStatuses.length === WEEK_DAYS, 'day statuses has 7 entries');
expect(dayStatuses[WEEK_DAYS - 1] === 'yes', 'today (last entry) is yes');

const review = buildWeeklyReview([a, hidden], checkIns, [], NOW, 0);
expect(review.behaviors.length === 1, 'hidden behaviors are excluded');

const row = review.behaviors[0];
expect(row.successDays === 3, 'counts 3 success days');
expect(row.triedDays === 1, 'counts 1 tried day');
expect(row.showedUpDays === 4, 'showed up on 4 days (yes + tried)');
expect(row.reps === 3, 'counts 3 reps (yes check-ins)');
expect(row.prevSuccessDays === 2, 'prior week had 2 success days');
expect(row.deltaPct === 50, 'delta is +50% (3 vs 2)');
expect(row.streak === 3, 'current streak is 3 (yes today and prior 2 days)');
expect(
  !!row.hardestNote &&
    row.hardestNote.result === 'tried' &&
    row.hardestNote.text === 'this one was hard',
  'hard-day note is the tried reflection'
);
expect(review.totalReps === 3, 'total reps aggregates to 3');
expect(review.totalSuccessDays === 3 && review.totalPrevSuccessDays === 2, 'totals aggregate');
expect(review.regressed === false, 'not regressed when success days rose');

// A past week view computes that window and omits the live streak.
const past = buildWeeklyReview([a], checkIns, [], NOW, 1);
expect(past.behaviors[0].successDays === 2, 'past-week view counts that window');
expect(past.behaviors[0].streak === undefined, 'streak only computed for the live week');

// Regression: prior week beats this week.
const r = mk('r');
const regCheckIns: CheckIn[] = [
  ci('r', 7, 'yes'),
  ci('r', 8, 'yes'),
  ci('r', 9, 'yes'),
  ci('r', 0, 'yes'),
];
const reg = buildWeeklyReview([r], regCheckIns, [], NOW, 0);
expect(reg.regressed === true, 'regressed when success days drop vs prior week');
expect(reg.behaviors[0].deltaPct === Math.round(((1 - 3) / 3) * 100), 'delta is negative on regression');

// Capture summary (counter, direction down): 5 this week, 2 last week.
const cb = mk('cb', {
  captureSpec: { type: 'counter', label: 'Pickups', direction: 'down' },
});
const cbEntries: CaptureEntry[] = [
  { id: 'e1', behaviorId: 'cb', at: at(0), value: 2 },
  { id: 'e2', behaviorId: 'cb', at: at(1), value: 3 },
  { id: 'e3', behaviorId: 'cb', at: at(8), value: 2 },
];
const cap = buildWeeklyReview([cb], [], cbEntries, NOW, 0).behaviors[0].capture;
expect(!!cap, 'capture summary present when behavior has a captureSpec');
expect(cap!.total === 5, 'counter total sums this week (2 + 3)');
expect(cap!.prevTotal === 2, 'counter prior-week total');
expect(cap!.deltaPct === Math.round(((5 - 2) / 2) * 100), 'capture delta is +150%');
expect(cap!.improved === false, 'a down-direction counter that rose is not improved');
expect(cap!.loggedDays === 2, 'logged days counts days with entries');
expect(
  cap!.daily.length === 7 && cap!.daily[6] === 2 && cap!.daily[5] === 3,
  'daily sums land on the right days'
);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — weekly-review tests passed.');
