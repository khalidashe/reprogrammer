import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";
import { requireUserId } from "./users";

/**
 * Capture entries (REP-5) — a wholly-private entity under REP-30: every row can
 * hold personal writing (reflection / CBT text in `fields`). It only crosses the
 * device boundary once the user has accepted privacy-sync consent. The client
 * already gates this via services/sync-policy.ts; the server check here is
 * defense in depth so private writing can't leak up by accident.
 */

async function hasPrivacyConsent(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const profile = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  return profile?.privacySyncConsent !== undefined;
}

export const listMine = query({
  args: {},
  handler: async (ctx): Promise<Doc<"entries">[]> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    // Cap raised for long-term users (REP-48). Switch to cursor pagination if
    // anyone approaches it.
    const rows = await ctx.db
      .query("entries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(10000);
    return rows.filter((e) => e.deletedAt === undefined);
  },
});

export const upsert = mutation({
  args: {
    clientId: v.string(),
    behaviorClientId: v.string(),
    at: v.number(),
    value: v.number(),
    fields: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!(await hasPrivacyConsent(ctx, userId))) {
      throw new Error(
        "Private-tier sync requires privacy-sync consent (REP-30).",
      );
    }
    const existing = await ctx.db
      .query("entries")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        behaviorClientId: args.behaviorClientId,
        at: args.at,
        value: args.value,
        fields: args.fields,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("entries", {
      userId,
      clientId: args.clientId,
      behaviorClientId: args.behaviorClientId,
      at: args.at,
      value: args.value,
      fields: args.fields,
      updatedAt: now,
    });
  },
});

export const softDelete = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("entries")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();
    if (!existing) return;
    const now = Date.now();
    await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
  },
});
