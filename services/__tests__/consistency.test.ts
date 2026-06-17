/**
 * Lightweight self-test for the consistency helper. Run with:
 *   tsx services/__tests__/consistency.test.ts
 *
 * Verifies:
 *  - length and oldest→today ordering
 *  - best-of-day precedence (yes > tried > no)
 *  - empty day → 'none'
 *  - cross-behavior isolation
 *  - days outside the window are ignored
 */
import { startOfDay, subDays } from 'date-fns';
import { lastNDaysStatus } from '../consistency';
import { CheckIn } from '../../types';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const B = 'b1';
const NOW = startOfDay(Date.now()).getTime() + 12 * 60 * 60 * 1000; // today noon
const day = (n: number, hour = 12) =>
  startOfDay(subDays(NOW, n)).getTime() + hour * 60 * 60 * 1000;
const ci = (
  daysAgo: number,
  result: 'yes' | 'tried' | 'no',
  opts: { hour?: number; behaviorId?: string } = {}
): CheckIn => ({
  id: `${opts.behaviorId ?? B}-${daysAgo}-${opts.hour ?? 12}-${result}`,
  behaviorId: opts.behaviorId ?? B,
  at: day(daysAgo, opts.hour),
  result,
});

// length + ordering: last element is today
const empty = lastNDaysStatus([], B, 7, NOW);
expect(empty.length === 7, 'returns exactly n entries');
expect(empty.every((s) => s === 'none'), 'no check-ins → all none');

const r = lastNDaysStatus([ci(0, 'yes')], B, 7, NOW);
expect(r[6] === 'yes', 'today is the LAST element (oldest→today)');
expect(r.slice(0, 6).every((s) => s === 'none'), 'earlier days stay none');

// best-of-day: yes beats tried beats no within the same day
expect(
  lastNDaysStatus([ci(0, 'no', { hour: 9 }), ci(0, 'yes', { hour: 14 })], B, 1, NOW)[0] === 'yes',
  'yes wins over no on the same day'
);
expect(
  lastNDaysStatus([ci(0, 'no', { hour: 9 }), ci(0, 'tried', { hour: 14 })], B, 1, NOW)[0] === 'tried',
  'tried wins over no on the same day'
);
expect(
  lastNDaysStatus([ci(0, 'no')], B, 1, NOW)[0] === 'no',
  'only a no → no'
);

// mixed week, oldest→today
const week = lastNDaysStatus(
  [ci(6, 'yes'), ci(5, 'tried'), ci(4, 'no'), ci(2, 'yes'), ci(0, 'yes')],
  B,
  7,
  NOW
);
expect(
  JSON.stringify(week) ===
    JSON.stringify(['yes', 'tried', 'no', 'none', 'yes', 'none', 'yes']),
  'mixed week maps correctly in order'
);

// cross-behavior isolation
expect(
  lastNDaysStatus([ci(0, 'yes', { behaviorId: 'other' })], B, 3, NOW).every((s) => s === 'none'),
  'other behaviors do not contribute'
);

// outside the window is ignored
expect(
  lastNDaysStatus([ci(10, 'yes')], B, 7, NOW).every((s) => s === 'none'),
  'a check-in older than n days is ignored'
);

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('All consistency tests passed.');
