/**
 * Tests Pull Mode helpers (REP-7).
 * Run: npx tsx services/__tests__/focus.test.ts
 *
 * Covers:
 *  - hasActiveFocusSession: live within cap mutes; ended or stale (> cap) does not
 *  - driftsPer30Min: cross-session rate; short-session guard; live uses `now`
 *  - sessionDurationMs / completedSessions
 */
import { hasActiveFocusSession, MAX_FOCUS_SESSION_MS } from '../scheduler-core';
import { driftsPer30Min, sessionDurationMs, completedSessions } from '../focus';
import type { FocusSession } from '../../types';

let failures = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('FAIL:', msg);
  }
}

const now = new Date(2026, 5, 16, 12, 0, 0).getTime();
const MIN = 60 * 1000;

function session(p: Partial<FocusSession>): FocusSession {
  return { id: 'x', behaviorId: 'b', startedAt: now, catches: 0, ...p };
}

// --- hasActiveFocusSession ---
expect(hasActiveFocusSession([], now) === false, 'no sessions → not active');
expect(
  hasActiveFocusSession([session({ startedAt: now - 10 * MIN })], now) === true,
  'live session within cap → active'
);
expect(
  hasActiveFocusSession([session({ startedAt: now - 60 * MIN, endedAt: now - 30 * MIN })], now) === false,
  'ended session → not active'
);
expect(
  hasActiveFocusSession([session({ startedAt: now - (MAX_FOCUS_SESSION_MS + MIN) })], now) === false,
  'stale live session past the cap → not active (self-heal)'
);

// --- sessionDurationMs ---
expect(
  sessionDurationMs(session({ startedAt: now - 60 * MIN, endedAt: now - 30 * MIN })) === 30 * MIN,
  'ended duration uses endedAt - startedAt'
);
expect(
  sessionDurationMs(session({ startedAt: now - 20 * MIN }), now) === 20 * MIN,
  'live duration uses now - startedAt'
);

// --- driftsPer30Min ---
expect(
  driftsPer30Min(session({ startedAt: now - 60 * MIN, endedAt: now, catches: 4 })) === 2,
  '4 catches over 60 min → 2.0 per 30 min'
);
expect(
  driftsPer30Min(session({ startedAt: now - 30 * 1000, endedAt: now, catches: 5 })) === 0,
  'session under a minute → 0 (avoids divide-by-near-zero spike)'
);
expect(
  driftsPer30Min(session({ startedAt: now - 30 * MIN, catches: 3 }), now) === 3,
  'live session uses now: 3 catches over 30 min → 3.0'
);

// --- completedSessions ---
const list: FocusSession[] = [
  session({ id: 'live' }),
  session({ id: 'a', endedAt: now - 100 }),
  session({ id: 'b', endedAt: now - 50 }),
];
const done = completedSessions(list);
expect(done.length === 2, 'completedSessions excludes the live one');
expect(done[0].id === 'b' && done[1].id === 'a', 'completedSessions sorts most-recent first');

if (failures === 0) {
  console.log('OK — Pull Mode (focus) helper tests passed.');
  process.exit(0);
} else {
  console.error(`FAILED — ${failures} test(s).`);
  process.exit(1);
}
