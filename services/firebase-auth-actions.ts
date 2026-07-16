import { GoogleAuthProvider, OAuthProvider, signInWithCredential, signOut as fbSignOut } from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirebaseAuth } from '@/services/firebase';

// Configure Google Sign-In once at module load. The webClientId is the
// Firebase "Web client" OAuth credential (required by GoogleSignin even on
// native). Fill in via EXPO_PUBLIC_FIREBASE_GOOGLE_WEBCLIENT_ID in .env.local.
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID;
if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token.');
  }
  const provider = new OAuthProvider('apple.com');
  const authCredential = provider.credential({
    idToken: credential.identityToken,
  });
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not configured.');
  await signInWithCredential(auth, authCredential);
}

export async function signInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not configured.');
  // GoogleSignin must be configured (webClientId) before calling.
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Google sign-in is not configured (missing web client id).');
  }
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) {
    throw new Error('Google did not return an id token.');
  }
  const provider = new GoogleAuthProvider();
  const authCredential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, authCredential);
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await fbSignOut(auth);
  // Best-effort Google sign-out so a re-login picks the right account.
  try {
    if (GOOGLE_WEB_CLIENT_ID) await GoogleSignin.signOut();
  } catch {
    // ignore
  }
}
