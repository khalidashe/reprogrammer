/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as appProfiles from "../appProfiles.js";
import type * as auth from "../auth.js";
import type * as behaviors from "../behaviors.js";
import type * as checkIns from "../checkIns.js";
import type * as http from "../http.js";
import type * as library from "../library.js";
import type * as reminderAttempts from "../reminderAttempts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  appProfiles: typeof appProfiles;
  auth: typeof auth;
  behaviors: typeof behaviors;
  checkIns: typeof checkIns;
  http: typeof http;
  library: typeof library;
  reminderAttempts: typeof reminderAttempts;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
