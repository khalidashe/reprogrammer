import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '@/services/firebase';

export interface RefinedBehavior {
  title: string;
  message: string;
}

/**
 * Calls the Firebase Callable Cloud Function `refineBehavior` (FB-3).
 *
 * The function verifies the caller's Firebase Auth UID + Pro entitlement
 * (read from their Firestore subscription doc) before calling Anthropic, so a
 * free / signed-out user gets a clean error. The model is Haiku-class (set in
 * the function) — far cheaper than the old claude-opus-4-7 for a 2–5 word
 * refinement. Callers should still gate the UI on `useIsPro()` and route free
 * users to the paywall before invoking this.
 */
export function useRefineBehavior() {
  return async (
    currentTitle: string,
    currentMessage: string,
  ): Promise<RefinedBehavior> => {
    const app = getFirebaseApp();
    if (!app) throw new Error('Firebase is not configured.');
    const functions = getFunctions(app);
    const refine = httpsCallable<{ currentTitle: string; currentMessage: string }, RefinedBehavior>(
      functions,
      'refineBehavior',
    );
    const result = await refine({ currentTitle, currentMessage });
    return result.data;
  };
}
