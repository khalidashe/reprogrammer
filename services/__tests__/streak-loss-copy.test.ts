/**
 * Lightweight self-test for streak-loss copy. Run with:
 *   npx tsx services/__tests__/streak-loss-copy.test.ts
 *
 * Verifies:
 *  - pickStreakLossCopy is deterministic for a given seed
 *  - it always returns a candidate from the table (never out of range)
 *  - it survives non-finite, negative, fractional, and huge seeds
 *  - index 0 preserves the prior banner copy (no regression)
 *  - every candidate has non-empty, single-line title and body
 *  - candidates stay compassionate (no punishing words from the rough brief)
 */
import {
  STREAK_LOSS_COPY,
  pickStreakLossCopy,
  type StreakLossCopy,
} from '../streak-loss-copy';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const inTable = (c: StreakLossCopy) => STREAK_LOSS_COPY.includes(c);

// --- determinism ---

expect(
  pickStreakLossCopy(1234) === pickStreakLossCopy(1234),
  'same seed → same candidate'
);

// --- always in range ---

for (let seed = 0; seed < STREAK_LOSS_COPY.length * 3; seed++) {
  expect(inTable(pickStreakLossCopy(seed)), `seed ${seed} → in table`);
}

// Seeds that are multiples of the table length land on index 0.
expect(
  pickStreakLossCopy(0) === STREAK_LOSS_COPY[0],
  'seed 0 → index 0'
);
expect(
  pickStreakLossCopy(STREAK_LOSS_COPY.length) === STREAK_LOSS_COPY[0],
  'seed == length → wraps to index 0'
);
expect(
  pickStreakLossCopy(1) === STREAK_LOSS_COPY[1],
  'seed 1 → index 1'
);

// --- hostile inputs resolve cleanly ---

for (const seed of [
  -1,
  -999999,
  3.99,
  -3.99,
  Number.MAX_SAFE_INTEGER,
  Date.now(),
  NaN,
  Infinity,
  -Infinity,
]) {
  expect(inTable(pickStreakLossCopy(seed)), `weird seed ${seed} → in table`);
}

// Non-finite seeds fall back to the default candidate.
expect(pickStreakLossCopy(NaN) === STREAK_LOSS_COPY[0], 'NaN → default');
expect(pickStreakLossCopy(Infinity) === STREAK_LOSS_COPY[0], 'Infinity → default');

// Negative seeds mirror their positive twin (abs before modulo).
expect(
  pickStreakLossCopy(-1) === pickStreakLossCopy(1),
  'negative seed mirrors positive'
);

// --- no regression on the established default ---

expect(
  STREAK_LOSS_COPY[0].title === 'Yesterday was hard.',
  'index 0 preserves prior banner title'
);
expect(
  STREAK_LOSS_COPY[0].body ===
    'A short read on how to come back without making it bigger than it is.',
  'index 0 preserves prior banner body'
);

// --- content sanity ---

const PUNISHING = /uninstall|loser|pathetic|failure|give up|quit|worthless/i;
STREAK_LOSS_COPY.forEach((c, i) => {
  expect(c.title.trim().length > 0, `candidate ${i} has a title`);
  expect(c.body.trim().length > 0, `candidate ${i} has a body`);
  expect(!c.title.includes('\n'), `candidate ${i} title is single-line`);
  expect(!c.body.includes('\n'), `candidate ${i} body is single-line`);
  expect(!PUNISHING.test(c.title), `candidate ${i} title stays compassionate`);
  expect(!PUNISHING.test(c.body), `candidate ${i} body stays compassionate`);
});

// --- summary ---
if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('All streak-loss copy tests passed.');
