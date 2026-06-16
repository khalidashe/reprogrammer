/**
 * Tests the pause/mute predicates that gate scheduling.
 * Run: npx tsx services/__tests__/pause-mute.test.ts
 *
 * Covers:
 *  - isBehaviorPaused: indefinite (REP-34) takes precedence; timed window honored
 *  - isReminderMuteActive: indefinite + timed global mute (REP-35)
 */
import { isBehaviorPaused, isReminderMuteActive } from '../scheduler-core';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const now = new Date(2026, 5, 16, 12, 0, 0).getTime();
const future = now + 60 * 60 * 1000;
const past = now - 60 * 60 * 1000;

// --- isBehaviorPaused ---
expect(isBehaviorPaused({}, now) === false, 'no pause fields → not paused');
expect(
  isBehaviorPaused({ pausedUntil: future }, now) === true,
  'timed pause in the future → paused'
);
expect(
  isBehaviorPaused({ pausedUntil: past }, now) === false,
  'timed pause in the past → not paused'
);
expect(
  isBehaviorPaused({ pausedIndefinitely: true }, now) === true,
  'indefinite pause → paused'
);
expect(
  isBehaviorPaused({ pausedIndefinitely: true, pausedUntil: past }, now) === true,
  'indefinite takes precedence over an expired timestamp'
);
expect(
  isBehaviorPaused({ pausedIndefinitely: false, pausedUntil: undefined }, now) === false,
  'explicit not-indefinite + no timestamp → not paused'
);

// --- isReminderMuteActive ---
expect(isReminderMuteActive({}, now) === false, 'no mute field → not muted');
expect(
  isReminderMuteActive({ remindersMutedUntil: 'indefinite' }, now) === true,
  'indefinite mute → muted'
);
expect(
  isReminderMuteActive({ remindersMutedUntil: future }, now) === true,
  'timed mute in the future → muted'
);
expect(
  isReminderMuteActive({ remindersMutedUntil: past }, now) === false,
  'timed mute in the past → not muted'
);

if (failures === 0) {
  console.log('OK — pause/mute predicate tests passed.');
  process.exit(0);
} else {
  console.error(`FAILED — ${failures} test(s).`);
  process.exit(1);
}
