/**
 * Free-tier limit on the number of active (non-hidden, non-deleted) states.
 *
 * Must stay in sync with `FREE_TIER_STATE_CAP` in convex/behaviors.ts — the
 * server is the authoritative check; the client uses this constant to gate
 * the UI before submit so we don't make the user fill out a whole form just
 * to be rejected.
 */
export const FREE_TIER_STATE_CAP = 3;

/**
 * Curated set of library guides available on the free tier. Everything else
 * shows a lock icon and routes to the paywall on tap.
 *
 * The whole **Foundation** category (how-change-works, start-small,
 * relapse-and-restart) is free on purpose — it's the gateway prologue we
 * recommend to every new user, so it can't sit behind the paywall (REP-11).
 * The rest of the free picks span domains (cognitive, social) so free users
 * get a meaningful starter experience without exhausting the catalog.
 */
export const FREE_GUIDE_IDS: ReadonlySet<string> = new Set([
  // The Foundation — gateway, always free
  'guide-context-design',
  'guide-action-over-consumption',
  'guide-social-environment',
  'guide-relapse-and-restart',
  // Cross-domain free picks
  'guide-deep-focus',
  'guide-confidence',
  'guide-small-talk',
]);

/**
 * Stable sort: free guides first, Pro guides after. Within each tier the
 * original order is preserved. Apply to any guide list to surface free
 * content ahead of paywalled content.
 */
export function sortGuidesFreeFirst<T extends { id: string }>(guides: T[]): T[] {
  return [...guides].sort((a, b) => {
    const aFree = FREE_GUIDE_IDS.has(a.id) ? 0 : 1;
    const bFree = FREE_GUIDE_IDS.has(b.id) ? 0 : 1;
    return aFree - bFree;
  });
}
