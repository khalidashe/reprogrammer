import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";
import { isPro } from "./subscriptions";
import { requireUserId } from "./users";

export const FREE_TIER_STATE_CAP = 3;

const kindValidator = v.union(v.literal("adopt"), v.literal("eliminate"));
const practiceTypeValidator = v.union(
  v.literal("mental"),
  v.literal("physical"),
  v.literal("learning"),
  v.literal("dual"),
);
const domainValidator = v.union(
  v.literal("language_cognitive"),
  v.literal("physical"),
  v.literal("social"),
  v.literal("emotional"),
  v.literal("creative"),
  v.literal("professional"),
);
const windowValidator = v.object({ from: v.string(), to: v.string() });

export const listMine = query({
  args: {},
  handler: async (ctx): Promise<Doc<"behaviors">[]> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("behaviors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(500);
    return rows.filter((b) => b.deletedAt === undefined);
  },
});

async function countActiveBehaviors(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const sample = await ctx.db
    .query("behaviors")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(FREE_TIER_STATE_CAP + 1);
  return sample.filter((b) => b.deletedAt === undefined && !b.hidden).length;
}

export const upsert = mutation({
  args: {
    clientId: v.string(),
    kind: kindValidator,
    title: v.string(),
    pingMessage: v.string(),
    practiceType: v.optional(practiceTypeValidator),
    domain: v.optional(domainValidator),
    libraryGuideId: v.optional(v.string()),
    replacementStateId: v.optional(v.string()),
    behaviorsToEliminate: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    journal: v.optional(v.string()),
    activeDays: v.array(v.number()),
    window: windowValidator,
    intervalMinutes: v.number(),
    level: v.number(),
    lastLevelUpStreak: v.number(),
    pausedUntil: v.optional(v.number()),
    createdAt: v.number(),
    hidden: v.boolean(),
    bookmarked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("behaviors")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }

    if (!args.hidden) {
      const pro = await isPro(ctx, userId);
      if (!pro) {
        const active = await countActiveBehaviors(ctx, userId);
        if (active >= FREE_TIER_STATE_CAP) {
          throw new Error(
            `Free tier is limited to ${FREE_TIER_STATE_CAP} active states. Upgrade to Pro for unlimited.`,
          );
        }
      }
    }

    return await ctx.db.insert("behaviors", {
      ...args,
      userId,
      updatedAt: now,
    });
  },
});

export const softDelete = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("behaviors")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();
    if (!existing) return;
    const now = Date.now();
    await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
  },
});
