// Firebase init replaces the old Convex client bootstrap (FB-1).
//
// The app was previously built on Convex (new ConvexReactClient(...)). That is
// gone. Cloud sync now uses the Firestore SDK via getFirestoreDb() in
// services/firebase.ts. Auth uses Firebase Auth via getFirebaseAuth().
//
// This module exists so legacy imports of '@/services/convex-client' keep
// resolving during the migration; it forwards to the Firebase app getter and is
// otherwise inert. Remove it once no file imports it.
import { getFirebaseApp } from '@/services/firebase';

export const firebase = getFirebaseApp();
