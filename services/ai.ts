import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

export interface RefinedBehavior {
  title: string;
  message: string;
}

/**
 * Returns a function that calls the server-side AI refine action.
 *
 * The action requires the caller to be a signed-in Pro user; the server
 * throws "AI refinement is a Pro feature." otherwise. Callers should gate
 * the UI on `useIsPro()` and route free users to the paywall before
 * invoking this.
 */
export function useRefineBehavior() {
  const refine = useAction(api.ai.refineBehavior);
  return async (
    currentTitle: string,
    currentMessage: string,
  ): Promise<RefinedBehavior> => {
    return await refine({ currentTitle, currentMessage });
  };
}
