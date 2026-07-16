import { deleteUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '@/services/firebase';

/**
 * Account deletion (FB-5 / REP-30 Phase 3) — App Store + GDPR requirement.
 * Erases the user's Firestore subcollection docs and their Firebase Auth
 * account. Runs best-effort in batches so a large account can't blow a single
 * transaction.
 */
const BATCH = 200;

async function deleteCollection(uid: string, name: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  const ref = collection(db, 'users', uid, name);
  for (;;) {
    const snap = await getDocs(ref);
    if (snap.empty) break;
    const ids = snap.docs.slice(0, BATCH).map((d) => d.id);
    await Promise.all(ids.map((id) => deleteDoc(doc(db, 'users', uid, name, id))));
    if (snap.size <= BATCH) break;
  }
}

export async function deleteAccountFirestore(): Promise<void> {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  if (!auth || !auth.currentUser || !db) {
    throw new Error('Not signed in.');
  }
  const uid = auth.currentUser.uid;

  // App data subcollections.
  for (const name of ['behaviors', 'checkIns', 'entries', 'reminderAttempts']) {
    await deleteCollection(uid, name);
  }
  // Singleton profile docs.
  await deleteDoc(doc(db, 'users', uid, 'appProfiles', 'profile'));
  await deleteDoc(doc(db, 'users', uid, 'subscriptions', 'profile'));

  // Finally the auth identity itself.
  await deleteUser(auth.currentUser);
}
