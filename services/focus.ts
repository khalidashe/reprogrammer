/**
 * Pull Mode metric helpers (REP-7).
 *
 * The metric is deliberately a *rate trend*, not a raw count — Newport's rule is
 * "don't judge the count." Catching a drift is the win (a meta-awareness rep),
 * so the streak is driven by *running a session*, never by how high the count is.
 */
import { FocusSession } from '../types';

export const THIRTY_MIN_MS = 30 * 60 * 1000;

/** Elapsed time for a session — its full length once ended, or live so far. */
export function sessionDurationMs(s: FocusSession, now: number = Date.now()): number {
  return Math.max(0, (s.endedAt ?? now) - s.startedAt);
}

/**
 * Drifts caught per 30 minutes — the comparable cross-session rate. Returns 0
 * for a session too short to be meaningful (avoids a divide-by-near-zero spike).
 */
export function driftsPer30Min(s: FocusSession, now: number = Date.now()): number {
  const dur = sessionDurationMs(s, now);
  if (dur < 60 * 1000) return 0;
  return s.catches / (dur / THIRTY_MIN_MS);
}

/** Completed sessions for a behavior, most recent first. */
export function completedSessions(sessions: FocusSession[]): FocusSession[] {
  return sessions
    .filter((s) => s.endedAt != null)
    .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0));
}
