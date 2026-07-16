/**
 * Firebase web/app config for Reprogrammer.
 *
 * Values come from Expo public env (`EXPO_PUBLIC_FIREBASE_*`) so they are safe
 * to embed in the client bundle (these are not secrets — Firebase security is
 * enforced by Firestore rules, not by hiding the config).
 *
 * NOTE: these values are placeholders. Before the cloud-sync path runs for
 * real, fill them in from the Firebase console (Project settings → Your apps →
 * SDK setup and configuration) in `.env.local` as EXPO_PUBLIC_FIREBASE_* — see
 * FB-1 / the backend-firebase-v1 tracking issue. Until then `getFirebaseApp()`
 * warns and the app keeps running fully offline (cloud sync stays disabled).
 */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** True once the required Firebase env vars are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}
