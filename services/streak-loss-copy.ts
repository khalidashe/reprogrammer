/**
 * Streak-loss copy (REP-15).
 *
 * The words shown when a user breaks momentum on a behavior. Today these are
 * surfaced by the dashboard "relapse" banner (app/(tabs)/index.tsx); the same
 * candidates are written to double as a future streak-loss notification
 * (title + body), so each line stays short enough for a lock-screen banner.
 *
 * Brand-voice note: the REP-15 brief floated a blunt "if you won't practice you
 * might as well uninstall" tone. That energy belongs on the *paywall* — a
 * confident value pitch — not on a slip. Reprogrammer deliberately de-shames
 * lapses (see guide-relapse-and-restart, "without making it bigger than it
 * is"), so these candidates are honest but compassionate, never punishing.
 *
 * Pure and dependency-free so it unit-tests with plain `tsx` like its service
 * peers (streak.ts, levels.ts, checkin-policy.ts).
 */

export interface StreakLossCopy {
  /** Short enough for a banner heading or a notification title. */
  title: string;
  /** One calm line: banner subtitle or notification body. */
  body: string;
}

/**
 * A/B candidates. Index 0 is the established default — it preserves the prior
 * banner copy verbatim, so seeding to it is never a regression. The rest are
 * alternates to rotate now and measure once analytics land.
 */
export const STREAK_LOSS_COPY: readonly StreakLossCopy[] = [
  {
    title: 'Yesterday was hard.',
    body: 'A short read on how to come back without making it bigger than it is.',
  },
  {
    title: 'A miss is just a miss.',
    body: "One off day doesn't undo the work. Pick the thread back up today.",
  },
  {
    title: "The streak broke. The skill didn't.",
    body: "Resets happen. Here's how to restart without the spiral.",
  },
  {
    title: 'Back to it, no drama.',
    body: "You don't have to earn your way back — just do the next small rep.",
  },
];

/**
 * Deterministically pick a candidate from a numeric seed (e.g. the lapse
 * timestamp), so the copy is stable for a given lapse but varies across lapses.
 * Safe for any input — non-finite, negative, fractional, and huge values all
 * resolve to a valid entry.
 */
export function pickStreakLossCopy(seed: number): StreakLossCopy {
  const n = STREAK_LOSS_COPY.length;
  const i = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) % n : 0;
  return STREAK_LOSS_COPY[i];
}
