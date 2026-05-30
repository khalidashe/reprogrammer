import { v } from "convex/values";
import {
  internalMutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";

export async function isPro(
  ctx: QueryCtx,
  userId: Id<"users"> | null,
): Promise<boolean> {
  if (!userId) return false;
  const sub = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!sub) return false;
  if (sub.status === "expired" || sub.status === "cancelled") return false;
  return sub.expiresAt > Date.now();
}

export const getMySubscription = query({
  args: {},
  handler: async (ctx): Promise<Doc<"subscriptions"> | null> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getMyEntitlement = query({
  args: {},
  handler: async (ctx): Promise<{ isPro: boolean; isSignedIn: boolean }> => {
    const userId = await auth.getUserId(ctx);
    return {
      isSignedIn: userId !== null,
      isPro: await isPro(ctx, userId),
    };
  },
});

export const upsertFromWebhook = internalMutation({
  args: {
    userId: v.id("users"),
    entitlement: v.literal("pro"),
    status: v.union(
      v.literal("active"),
      v.literal("trial"),
      v.literal("expired"),
      v.literal("in_grace_period"),
      v.literal("cancelled"),
    ),
    store: v.union(
      v.literal("app_store"),
      v.literal("play_store"),
      v.literal("stripe"),
    ),
    productId: v.string(),
    expiresAt: v.number(),
    willRenew: v.boolean(),
    originalTransactionId: v.string(),
    revenueCatCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        entitlement: args.entitlement,
        status: args.status,
        store: args.store,
        productId: args.productId,
        expiresAt: args.expiresAt,
        willRenew: args.willRenew,
        originalTransactionId: args.originalTransactionId,
        revenueCatCustomerId: args.revenueCatCustomerId,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      entitlement: args.entitlement,
      status: args.status,
      store: args.store,
      productId: args.productId,
      expiresAt: args.expiresAt,
      willRenew: args.willRenew,
      originalTransactionId: args.originalTransactionId,
      revenueCatCustomerId: args.revenueCatCustomerId,
      updatedAt: now,
    });
  },
});
