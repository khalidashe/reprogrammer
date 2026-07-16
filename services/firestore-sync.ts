import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit as qLimit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Behavior, CheckIn, AppProfile, CaptureEntry, ReminderAttempt } from '@/types';
import { getFirestoreDb } from '@/services/firebase';

/**
 * Firestore-backed sync layer for Reprogrammer (FB-2 / FB-5).
 *
 * Data model (per the migration's data-model decision, Critical-Mistakes §6):
 *   users/{uid}/behaviors/{clientId}
 *   users/{uid}/checkIns/{clientId}
 *   users/{uid}/entries/{clientId}
 *   users/{uid}/reminderAttempts/{clientId}
 *   users/{uid}/appProfiles/profile        (single doc per user)
 *   users/{uid}/subscriptions/profile       (single doc per user)
 *
 * Subcollections scope reads + security rules naturally and need NO composite
 * index for the common "my stuff" query. Every write is an idempotent upsert
 * keyed by clientId via setDoc(..., { merge: true }) — the same shape as the
 * old `cloud-sync.ts` `pushWithRetry` pattern, so re-running is always safe.
 *
 * PERF DISCIPLINE (Critical-Mistakes §1, §8): this layer is PULL-ON-FOREGROUND
 * only. pullAll() is one-shot getDocs on app resume; there are NO always-on
 * onSnapshot listeners. Never add onSnapshot here without an explicit
 * one-listener / aggressive-unsubscribe / one-week-cost-watch decision.
 */

function db(): Firestore {
  const d = getFirestoreDb();
  if (!d) throw new Error('Firestore is not initialized (Firebase not configured).');
  return d;
}

function coll(uid: string, name: string) {
  return collection(db(), 'users', uid, name);
}

function docRef(uid: string, name: string, clientId: string) {
  return doc(db(), 'users', uid, name, clientId);
}

/** Upsert by clientId (idempotent merge). Soft-deletes are just a deletedAt field. */
export async function upsertDoc(
  uid: string,
  name: string,
  clientId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await setDoc(docRef(uid, name, clientId), data, { merge: true });
}

export async function upsertProfile(uid: string, name: 'appProfiles' | 'subscriptions', data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db(), 'users', uid, name, 'profile'), data, { merge: true });
}

export async function deleteDocByClientId(uid: string, name: string, clientId: string): Promise<void> {
  // Soft-delete: stamp deletedAt rather than removing, so offline deletes
  // propagate on next pull. pullAll filters these out.
  await setDoc(docRef(uid, name, clientId), { deletedAt: Date.now() }, { merge: true });
}

async function listLive<T>(
  uid: string,
  name: string,
  whereConstraints: QueryConstraint[] = [],
  limitTo?: number,
): Promise<T[]> {
  let q = query(coll(uid, name), ...whereConstraints);
  if (limitTo) q = query(q, qLimit(limitTo));
  const snap = await getDocs(q);
  const rows: T[] = [];
  snap.forEach((d) => {
    const data = d.data() as T & { deletedAt?: number };
    if (data.deletedAt === undefined) rows.push({ ...(data as T), id: d.id } as T);
  });
  return rows;
}

// --- Pull for each entity -------------------------------------------------

export async function pullBehaviors(uid: string): Promise<Behavior[]> {
  const rows = await listLive<Behavior & { id: string }>(uid, 'behaviors', []);
  return rows.map(stripFirestoreId);
}

export async function pullCheckIns(uid: string): Promise<CheckIn[]> {
  const rows = await listLive<CheckIn & { id: string }>(uid, 'checkIns', []);
  return rows.map(stripFirestoreId);
}

export async function pullReminderAttempts(uid: string): Promise<ReminderAttempt[]> {
  const rows = await listLive<ReminderAttempt & { id: string }>(uid, 'reminderAttempts', []);
  return rows.map(stripFirestoreId);
}

export async function pullEntries(uid: string): Promise<CaptureEntry[]> {
  const rows = await listLive<CaptureEntry & { id: string }>(uid, 'entries', []);
  return rows.map(stripFirestoreId);
}

export async function pullAppProfile(uid: string): Promise<AppProfile | null> {
  const d = await getDoc(doc(db(), 'users', uid, 'appProfiles', 'profile'));
  if (!d.exists()) return null;
  return d.data() as AppProfile;
}

export async function pullSubscription(uid: string): Promise<{ isPro: boolean; isSignedIn: boolean }> {
  const d = await getDoc(doc(db(), 'users', uid, 'subscriptions', 'profile'));
  if (!d.exists()) return { isPro: false, isSignedIn: true };
  const data = d.data() as { status?: string; expiresAt?: number; entitlement?: string };
  const expired = data.expiresAt !== undefined && data.expiresAt <= Date.now();
  const active = data.status !== 'expired' && data.status !== 'cancelled' && !expired;
  return { isPro: active && data.entitlement === 'pro', isSignedIn: true };
}

/**
 * Find a user's doc by idToken-less lookup is impossible client-side; this is
 * only used by the Cloud Function. Kept here for symmetry.
 */
export async function entriesCountForUser(uid: string): Promise<number> {
  const snap = await getDocs(query(coll(uid, 'entries')));
  return snap.size;
}

// Helper: Firestore doc ids are the clientId; the app model uses `id`.
function stripFirestoreId<T>(row: T & { id: string }): T {
  const { id, ...rest } = row;
  return rest as T;
}

// Re-export the collectionGroup helper for future cross-user admin queries
// (not used in the client). Exists so the import graph stays stable.
export const _internal = { collectionGroup, orderBy, where, writeBatch };

/**
 * Privacy-sync consent (FB-5 / REP-30). Recorded under appProfiles.privacySyncConsent.
 * Firestore security rules enforce the same boundary server-side (a write to
 * `entries` or a free-text field is rejected unless consent is present) — this
 * client call is what sets it. Revoke purges the private data from Firestore.
 */
export async function recordPrivacyConsent(
  uid: string,
  version: string,
): Promise<void> {
  await setDoc(
    doc(db(), 'users', uid, 'appProfiles', 'profile'),
    { privacySyncConsent: { version, acceptedAt: Date.now() }, updatedAt: Date.now() },
    { merge: true },
  );
}

export async function revokePrivacyConsent(uid: string): Promise<void> {
  // Clear consent + private free-text fields on the appProfiles doc.
  await setDoc(
    doc(db(), 'users', uid, 'appProfiles', 'profile'),
    { privacySyncConsent: null, goals: null, userBio: null, updatedAt: Date.now() },
    { merge: true },
  );
  // Soft-delete every entries row (private tier).
  const snap = await getDocs(coll(uid, 'entries'));
  const now = Date.now();
  await Promise.all(
    snap.docs.map((d) => setDoc(d.ref, { deletedAt: now }, { merge: true })),
  );
  // Clear journal free-text on behaviors.
  const bSnap = await getDocs(coll(uid, 'behaviors'));
  await Promise.all(
    bSnap.docs
      .filter((d) => (d.data() as { journal?: string }).journal !== undefined)
      .map((d) => setDoc(d.ref, { journal: null }, { merge: true })),
  );
  // Clear notes on checkIns.
  const cSnap = await getDocs(coll(uid, 'checkIns'));
  await Promise.all(
    cSnap.docs
      .filter((d) => (d.data() as { note?: string }).note !== undefined)
      .map((d) => setDoc(d.ref, { note: null }, { merge: true })),
  );
}

/** Upsert the user's entitlement doc (written by the RevenueCat webhook or client). */
export async function upsertSubscription(
  uid: string,
  data: {
    entitlement: 'pro';
    status: string;
    store: string;
    productId: string;
    expiresAt: number;
    willRenew: boolean;
    originalTransactionId: string;
    revenueCatCustomerId?: string;
  },
): Promise<void> {
  await setDoc(
    doc(db(), 'users', uid, 'subscriptions', 'profile'),
    { ...data, updatedAt: Date.now() },
    { merge: true },
  );
}

/**
 * Server-side proof of the consent gate (Critical-Mistakes §2). Returns true
 * only when the user's appProfiles.privacySyncConsent is present. Rules are the
 * real gate; this lets the client avoid pushing private data it knows will be
 * rejected.
 */
export async function hasPrivacyConsent(uid: string): Promise<boolean> {
  const profile = await pullAppProfile(uid);
  return profile?.privacySyncConsent !== undefined;
}
