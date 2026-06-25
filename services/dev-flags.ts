/**
 * Local development flags. Every flag here is **double-gated**: it is only ever
 * truthy when `__DEV__` is true (so it is dead code in any release build) AND an
 * explicit `EXPO_PUBLIC_*` env var opts in. Never rely on these in shipped logic.
 */

/**
 * Skip the onboarding + Convex sign-in wall (REP-30/REP-46) so a local build
 * lands straight in the app. For driving the iOS Simulator / screenshots without
 * a live sign-in. Enable by adding `EXPO_PUBLIC_DEV_SKIP_AUTH=1` to `.env.local`
 * (gitignored). Inert in production because `__DEV__` is false there.
 */
export const DEV_SKIP_AUTH =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === '1';
