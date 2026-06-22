import type { Behavior, CheckIn, AppProfile } from '@/types';

/**
 * Canonical sync policy (REP-30).
 *
 * Single source of truth for which records cross the device boundary and which
 * count as the consent-gated **private tier** — personal free-text (journals,
 * check-in notes, bios, reflections/CBT entries). The Phase 2 consent gate and
 * the privacy-policy / store data-safety disclosures (REP-24 / REP-26) both
 * derive from this list, so the rule lives in one auditable place instead of
 * being implicit in cloud-sync.ts.
 *
 * DECISION (2026-06-22 — supersedes the original "personal writing stays on the
 * phone" rule; see REP-30): for signed-in Pro users, everything syncs. The
 * private tier additionally requires the user to have accepted the privacy-sync
 * terms before it leaves the device. Free users sync nothing.
 *
 * The field lists are typed with `keyof` so a renamed/removed model field fails
 * compilation here rather than silently dropping out of the privacy contract.
 */

export type SyncEntity =
  | 'behaviors'
  | 'checkIns'
  | 'reminderAttempts'
  | 'appProfiles'
  | 'entries';

/** Free-text fields holding personal writing on otherwise-syncable rows. */
const BEHAVIOR_PRIVATE_FIELDS: readonly (keyof Behavior)[] = ['journal'];
const CHECKIN_PRIVATE_FIELDS: readonly (keyof CheckIn)[] = ['note'];
const APP_PROFILE_PRIVATE_FIELDS: readonly (keyof AppProfile)[] = ['userBio', 'goals'];

export const PRIVATE_FIELDS: Partial<Record<SyncEntity, readonly string[]>> = {
  behaviors: BEHAVIOR_PRIVATE_FIELDS,
  checkIns: CHECKIN_PRIVATE_FIELDS,
  appProfiles: APP_PROFILE_PRIVATE_FIELDS,
};

/**
 * Entities whose *every* row is personal writing — the whole record is
 * consent-gated, not just one field. `entries` carries reflection / CBT text.
 */
export const PRIVATE_ENTITIES: readonly SyncEntity[] = ['entries'];

/** True when an entire entity is private writing (the whole row is gated). */
export function isPrivateEntity(entity: SyncEntity): boolean {
  return PRIVATE_ENTITIES.includes(entity);
}

/** True when a specific field on an entity is personal free-text. */
export function isPrivateField(entity: SyncEntity, field: string): boolean {
  return (PRIVATE_FIELDS[entity] ?? []).includes(field);
}

/**
 * Whether pushing this entity (optionally a specific field) requires the user
 * to have accepted privacy-sync consent. A wholly-private entity always does;
 * for a mixed entity, only its private fields do.
 */
export function requiresPrivacyConsent(entity: SyncEntity, field?: string): boolean {
  if (isPrivateEntity(entity)) return true;
  if (field === undefined) return false;
  return isPrivateField(entity, field);
}
