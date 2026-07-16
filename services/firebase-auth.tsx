import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from '@/services/firebase';

interface FirebaseAuthState {
  /** Firebase UID, or null when signed out / Firebase not configured. */
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthState>({
  userId: null,
  isAuthenticated: false,
  isLoading: true,
});

/**
 * Provides Firebase Auth state to the app (FB-1 / FB-4).
 *
 * Mirrors the old `useConvexAuth` shape the launch gate in app/_layout.tsx
 * consumed: `{ isAuthenticated, isLoading, userId }`. While Firebase isn't
 * configured the app stays authenticated=false but isLoading resolves to false
 * so the rest of the app still boots (offline, with the sign-in wall).
 */
export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsub = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  return (
    <FirebaseAuthContext.Provider
      value={{ userId, isAuthenticated: userId !== null, isLoading }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

/** Firebase-shaped replacement for the old `useConvexAuth`. */
export function useFirebaseAuth(): FirebaseAuthState {
  return useContext(FirebaseAuthContext);
}
