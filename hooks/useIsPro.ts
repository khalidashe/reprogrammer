import { useState, useEffect } from 'react';
import { getFirebaseAuth } from '@/services/firebase';
import { pullSubscription } from '@/services/firestore-sync';

export interface ProEntitlement {
  isPro: boolean;
  isSignedIn: boolean;
  isLoading: boolean;
}

/**
 * Single source of truth for the Pro entitlement (FB-4).
 *
 * - `isLoading` is true until we've read the user's subscription doc. Treat as
 *   "free" during loading so we never accidentally show a paywall flash to a
 *   Pro user — gates should compute `if (!isLoading && !isPro)` before blocking.
 * - `isSignedIn` is true when a Firebase user is present, regardless of
 *   subscription state. Free users can be signed in.
 */
export function useIsPro(): ProEntitlement {
  const [state, setState] = useState<ProEntitlement>({
    isPro: false,
    isSignedIn: false,
    isLoading: true,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Firebase not configured — behave as signed-out; resolve loading so the
      // app still boots (offline, sign-in wall).
      setState({ isPro: false, isSignedIn: false, isLoading: false });
      return;
    }

    let cancelled = false;

    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (!cancelled) setState({ isPro: false, isSignedIn: false, isLoading: false });
        return;
      }
      // Signed in — read the subscription doc.
      try {
        const sub = await pullSubscription(user.uid);
        if (!cancelled) {
          setState({
            isPro: sub.isPro,
            isSignedIn: true,
            isLoading: false,
          });
        }
      } catch {
        // Conservative: don't flash a paywall if the read fails.
        if (!cancelled) setState({ isPro: false, isSignedIn: true, isLoading: false });
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return state;
}
