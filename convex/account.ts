import { v } from "convex/values";
import { mutation, internalMutation, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireUserId } from "./users";

/**
 * Account deletion (REP-30 Phase 3) — launch-blocking for the App Store and
 * GDPR. The user must be able to erase their account and ALL server data.
 *
 * Deletion runs in bounded batches via a self-scheduling internal mutation so a
 * heavy account can't blow a single transaction's read/write limit. App data is
 * purged first; once every owned table is empty the auth identity (accounts,
 * sessions, refresh tokens, verification codes) and the `users` row are removed.
 */

const BATCH = 200;

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx): Promise<void> => {
    const userId = await requireUserId(ctx);
    await ctx.scheduler.runAfter(0, internal.account.purgeUser, { userId });
  },
});

/** Delete up to BATCH of the user's own app rows. Returns true if a table was
 *  full (more rows likely remain), so the caller knows to schedule another pass. */
async function purgeAppDataBatch(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  let more = false;

  const behaviors = await ctx.db
    .query("behaviors")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(BATCH);
  for (const r of behaviors) await ctx.db.delete(r._id);
  more = more || behaviors.length === BATCH;

  const checkIns = await ctx.db
    .query("checkIns")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(BATCH);
  for (const r of checkIns) await ctx.db.delete(r._id);
  more = more || checkIns.length === BATCH;

  const reminderAttempts = await ctx.db
    .query("reminderAttempts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(BATCH);
  for (const r of reminderAttempts) await ctx.db.delete(r._id);
  more = more || reminderAttempts.length === BATCH;

  const entries = await ctx.db
    .query("entries")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(BATCH);
  for (const r of entries) await ctx.db.delete(r._id);
  more = more || entries.length === BATCH;

  const profiles = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(BATCH);
  for (const r of profiles) await ctx.db.delete(r._id);
  more = more || profiles.length === BATCH;

  const subscriptions = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(BATCH);
  for (const r of subscriptions) await ctx.db.delete(r._id);
  more = more || subscriptions.length === BATCH;

  return more;
}

/**
 * Remove the Convex Auth identity for a user. Index names follow the
 * `@convex-dev/auth` `authTables` schema — confirm them against the installed
 * version when first running `npx convex dev` (the generated dataModel isn't
 * present in the worktree where this was written).
 */
async function deleteAuthIdentity(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const accounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
    .collect();
  for (const account of accounts) {
    const codes = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", account._id))
      .collect();
    for (const code of codes) await ctx.db.delete(code._id);
    await ctx.db.delete(account._id);
  }

  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();
  for (const session of sessions) {
    const tokens = await ctx.db
      .query("authRefreshTokens")
      .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
      .collect();
    for (const token of tokens) await ctx.db.delete(token._id);
    await ctx.db.delete(session._id);
  }
}

export const purgeUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<void> => {
    const more = await purgeAppDataBatch(ctx, userId);
    if (more) {
      await ctx.scheduler.runAfter(0, internal.account.purgeUser, { userId });
      return;
    }
    // All owned app data gone — now erase the identity itself.
    await deleteAuthIdentity(ctx, userId);
    await ctx.db.delete(userId);
  },
});
