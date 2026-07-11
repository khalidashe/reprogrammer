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
 * shows a lock icon and routes to the paywall on tap. Picked to span domains
 * (cognitive, emotional, social, recovery) so free users get a meaningful
 * starter experience without exhausting the catalog.
 */
export const FREE_GUIDE_IDS: ReadonlySet<string> = new Set([
  'guide-deep-focus',
  'guide-confidence',
  'guide-small-talk',
  'guide-relapse-and-restart',
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
