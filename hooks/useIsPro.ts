import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export interface ProEntitlement {
  isPro: boolean;
  isSignedIn: boolean;
  isLoading: boolean;
}

/**
 * Single source of truth for the Pro entitlement.
 *
 * - `isLoading` is true until Convex returns. Treat as "free" during loading
 *   so we never accidentally show a paywall flash to a Pro user — gates
 *   should compute `if (!isLoading && !isPro)` before blocking.
 * - `isSignedIn` flips to true once Convex Auth has a session, regardless of
 *   subscription state. Free users can be signed in.
 */
export function useIsPro(): ProEntitlement {
  const data = useQuery(api.subscriptions.getMyEntitlement);
  if (data === undefined) {
    return { isPro: false, isSignedIn: false, isLoading: true };
  }
  return { ...data, isLoading: false };
}
