/**
 * Tests the intent-based cadence mapping (REP-37).
 * Run: npx tsx services/__tests__/cadence.test.ts
 */
import {
  CADENCES,
  DEFAULT_CADENCE,
  cadenceById,
  intervalForCadence,
  cadenceForInterval,
} from '../cadence';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

// Default is a real cadence
expect(CADENCES.some((c) => c.id === DEFAULT_CADENCE), 'DEFAULT_CADENCE is a real cadence');

// Each cadence round-trips: interval → nearest cadence → itself
for (const c of CADENCES) {
  expect(intervalForCadence(c.id) === c.intervalMinutes, `${c.id} interval matches`);
  expect(
    cadenceForInterval(c.intervalMinutes) === c.id,
    `${c.id} round-trips through cadenceForInterval`
  );
}

// Nearest-match behavior for off-grid intervals
expect(cadenceForInterval(6) === 'intense', '6 min → intense (nearest 5)');
expect(cadenceForInterval(60) === 'gentle', '60 min → gentle (nearest 30)');
expect(cadenceForInterval(14) === 'steady', '14 min → steady (nearest 15)');

// cadenceById falls back rather than returning undefined
expect(cadenceById(DEFAULT_CADENCE).id === DEFAULT_CADENCE, 'cadenceById resolves');

if (failures === 0) {
  console.log(`OK — cadence tests passed (${CADENCES.length} cadences).`);
  process.exit(0);
} else {
  console.error(`FAILED — ${failures} test(s).`);
  process.exit(1);
}
