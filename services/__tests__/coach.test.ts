/**
 * Self-test for the Coach insight engine (REP-6 Phase 1). Run with:
 *   tsx services/__tests__/coach.test.ts
 *
 * Builds real WeeklyReview objects (via buildWeeklyReview) from crafted data
 * and asserts the right insights fire, rank, dedupe, and cap. Pure + offline.
 */
import { buildWeeklyReview } from '../weekly-review';
import { buildCoachInsights } from '../coach';
import { Behavior, CaptureEntry, CheckIn, CoachPrescription } from '../../types';

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

// ── Phase 2: prescriptions (the "do") ───────────────────────────────────────

// Cold start pairs a "do": add your first behavior.
expect(cs[0].prescription?.action === 'add_behavior', 'cold_start prescribes adding a behavior');

// Regression pairs the relapse guide (read) with a recovery program (do), and
// snapshots the behavior's success days as the loop baseline.
expect(regInsight?.prescription?.action === 'open_program', 'regression prescribes a program');
expect(
  regInsight?.prescription?.targetId === 'pkg-rebuild-your-habits',
  'default recovery program is Rebuild Your Habits'
);
expect(regInsight?.prescription?.behaviorId === 'r', 'regression prescription targets the behavior');
expect(regInsight?.prescription?.baselineSuccessDays === 1, 'baseline = this week\'s success days');

// Emotional behaviors get the CBT recovery program instead.
const emoChecks: CheckIn[] = [ci('e', 7, 'yes'), ci('e', 8, 'yes'), ci('e', 9, 'yes'), ci('e', 0, 'yes')];
const emo = buildWeeklyReview([mk('e', { domain: 'emotional' })], emoChecks, [], NOW, 0);
const emoReg = buildCoachInsights(emo).find((i) => i.kind === 'regression');
expect(emoReg?.prescription?.targetId === 'pkg-feeling-good', 'emotional regression → Feeling Good');

// ── Phase 2: close the loop ─────────────────────────────────────────────────

const liveStart = buildWeeklyReview([mk('a')], [], [], NOW, 0).window.start;
const rx = (over: Partial<CoachPrescription> = {}): CoachPrescription => ({
  id: 'rx1',
  insightKind: 'regression',
  behaviorId: 'L',
  action: 'open_program',
  targetId: 'pkg-rebuild-your-habits',
  baselineSuccessDays: 1,
  windowStart: liveStart - 7 * DAY, // prescribed last week
  prescribedAt: at(8),
  status: 'active',
  updatedAt: at(8),
  ...over,
});

// Loop win: prescribed last week, behavior is now well above baseline.
const winChecks: CheckIn[] = [ci('L', 0, 'yes'), ci('L', 1, 'yes'), ci('L', 2, 'yes'), ci('L', 3, 'yes')];
const winR = buildWeeklyReview([mk('L')], winChecks, [], NOW, 0);
const winInsights = buildCoachInsights(winR, [rx()]);
expect(winInsights[0].kind === 'loop_win', 'recovered behavior → loop_win leads the card');
expect(
  winInsights[0].resolves?.id === 'rx1' && winInsights[0].resolves?.status === 'resolved_improved',
  'loop_win carries the resolution to persist'
);
expect(
  winInsights.filter((i) => i.behaviorId === 'L').length === 1,
  'prescribed behavior is not double-counted (loop replaces fresh insights)'
);

// Loop follow-up: prescribed last week, behavior still at/under baseline.
const stallChecks: CheckIn[] = [ci('L', 0, 'yes')]; // 1 good day = baseline, no gain
const stallR = buildWeeklyReview([mk('L')], stallChecks, [], NOW, 0);
const stallInsights = buildCoachInsights(stallR, [rx()]);
const followup = stallInsights.find((i) => i.kind === 'loop_followup');
expect(!!followup, 'stalled behavior → loop_followup');
expect(followup?.resolves?.status === 'resolved_stalled', 'loop_followup resolves as stalled');
expect(followup?.guideId === 'guide-relapse-and-restart', 'loop_followup re-links the relapse guide');

// Too soon: a prescription made this same week doesn't close yet, and suppresses
// a fresh nudge for that behavior (we just prescribed — don't nag).
const sameWeek = buildCoachInsights(winR, [rx({ windowStart: liveStart })]);
expect(
  !sameWeek.some((i) => i.kind === 'loop_win' || i.kind === 'loop_followup'),
  'same-week prescription does not close the loop'
);
expect(sameWeek.every((i) => i.behaviorId !== 'L'), 'a just-prescribed behavior is left alone');

// Resolved prescriptions are inert — no loop fires for them.
const resolved = buildCoachInsights(winR, [rx({ status: 'resolved_improved' })]);
expect(!resolved.some((i) => i.kind === 'loop_win'), 'already-resolved prescription does not re-fire');

// Cap: never more than 3 insights.
expect(buildCoachInsights(bw).length <= 3, 'never exceeds 3 insights');

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('OK — coach tests passed.');
