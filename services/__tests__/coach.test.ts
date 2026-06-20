/**
 * Self-test for the Coach insight engine (REP-6 Phase 1). Run with:
 *   tsx services/__tests__/coach.test.ts
 *
 * Builds real WeeklyReview objects (via buildWeeklyReview) from crafted data
 * and asserts the right insights fire, rank, dedupe, and cap. Pure + offline.
 */
import { buildWeeklyReview } from '../weekly-review';
import { buildCoachInsights } from '../coach';
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
const NOW = todayStart + 12 * 60 * 60 * 1000;
const at = (daysAgo: number) => todayStart - daysAgo * DAY + 12 * 60 * 60 * 1000;

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

const ci = (behaviorId: string, daysAgo: number, result: 'yes' | 'tried' | 'no'): CheckIn => ({
  id: `${behaviorId}-${daysAgo}-${result}`,
  behaviorId,
  at: at(daysAgo),
  result,
});

const kinds = (review: ReturnType<typeof buildWeeklyReview>) =>
  buildCoachInsights(review).map((i) => i.kind);

// No behaviors → no card.
expect(buildCoachInsights(buildWeeklyReview([], [], [], NOW, 0)).length === 0, 'empty → no insights');

// Cold start: a behavior exists but nothing logged this week.
const cs = buildCoachInsights(buildWeeklyReview([mk('a')], [], [], NOW, 0));
expect(cs.length === 1 && cs[0].kind === 'cold_start', 'no activity → single cold_start insight');

// Best week: many good days this week, few last week.
const bwChecks: CheckIn[] = [
  ci('a', 0, 'yes'),
  ci('a', 1, 'yes'),
  ci('a', 2, 'yes'),
  ci('a', 3, 'yes'),
  ci('a', 8, 'yes'), // last week: 1 good day
];
const bw = buildWeeklyReview([mk('a')], bwChecks, [], NOW, 0);
expect(kinds(bw).includes('best_week'), 'big WoW rise → best_week');
expect(buildCoachInsights(bw)[0].kind === 'best_week', 'best_week leads the card');

// Momentum: a current streak of 3+.
const momChecks: CheckIn[] = [ci('a', 0, 'yes'), ci('a', 1, 'yes'), ci('a', 2, 'yes')];
const mom = buildWeeklyReview([mk('a')], momChecks, [], NOW, 0);
const momInsight = buildCoachInsights(mom).find((i) => i.kind === 'momentum');
expect(!!momInsight && momInsight.behaviorId === 'a', 'streak ≥3 → momentum with behaviorId');

// Capture win: counter (lower is better) dropped a lot vs last week.
const cap = mk('c', { captureSpec: { type: 'counter', label: 'Pickups', direction: 'down' } });
const capChecks: CheckIn[] = [ci('c', 0, 'yes'), ci('c', 1, 'yes')];
const capEntries: CaptureEntry[] = [
  { id: 'e1', behaviorId: 'c', at: at(0), value: 2 }, // 2 this week
  { id: 'e2', behaviorId: 'c', at: at(8), value: 10 }, // 10 last week → big drop
];
const capR = buildWeeklyReview([cap], capChecks, capEntries, NOW, 0);
const capInsight = buildCoachInsights(capR).find((i) => i.kind === 'capture_win');
expect(!!capInsight && capInsight.behaviorId === 'c', 'improving capture → capture_win');
expect(!!capInsight && capInsight.title.includes('falling'), 'down-direction win reads as falling');

// Regression: prior week beats this week → gentle support insight with the relapse guide.
const regChecks: CheckIn[] = [
  ci('r', 7, 'yes'),
  ci('r', 8, 'yes'),
  ci('r', 9, 'yes'),
  ci('r', 0, 'yes'), // 1 this week vs 3 last week
];
const reg = buildWeeklyReview([mk('r')], regChecks, [], NOW, 0);
const regInsight = buildCoachInsights(reg).find((i) => i.kind === 'regression');
expect(!!regInsight && regInsight.tone === 'support', 'regression → support insight');
expect(!!regInsight && regInsight.guideId === 'guide-relapse-and-restart', 'regression links relapse guide');

// Cap: never more than 3 insights.
expect(buildCoachInsights(bw).length <= 3, 'never exceeds 3 insights');

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — coach tests passed.');
