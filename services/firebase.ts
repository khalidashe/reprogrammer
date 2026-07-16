import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '@/config/firebase-config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Lazily initialize Firebase. Safe to call repeatedly. If the env config is
 * missing we return nulls and the app keeps running fully offline — cloud sync
 * simply stays disabled (see services/cloud-sync.ts + hooks/useCloudSyncBootstrap.ts).
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  if (!isFirebaseConfigured()) {
    console.warn(
      '[firebase] EXPO_PUBLIC_FIREBASE_* not configured — cloud sync disabled, app runs offline.',
    );
    return null;
  }
  app = initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  const a = getFirebaseApp();
  if (!a) return null;
  auth = getAuth(a);
  return auth;
}

export function getFirestoreDb(): Firestore | null {
  if (firestore) return firestore;
  const a = getFirebaseApp();
  if (!a) return null;
  firestore = getFirestore(a);
  return firestore;
}
