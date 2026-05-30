import { ConvexReactClient } from 'convex/react';

const url = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!url) {
  console.warn(
    '[convex] EXPO_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` and copy the URL into .env.local.',
  );
}

export const convex = new ConvexReactClient(url ?? 'https://placeholder.convex.cloud', {
  unsavedChangesWarning: false,
});
