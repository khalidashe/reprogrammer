import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { auth } from "./auth";
import { requireUserId } from "./users";

export const getMine = query({
  args: {},
  handler: async (ctx): Promise<Doc<"appProfiles"> | null> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    hasOnboarded: v.boolean(),
    userName: v.optional(v.string()),
    userBio: v.optional(v.string()),
    lastLapseAt: v.optional(v.number()),
    lastLapseAcknowledged: v.optional(v.boolean()),
    quietHours: v.optional(v.object({ from: v.string(), to: v.string() })),
    notificationsDenied: v.optional(v.boolean()),
    remindersMutedUntil: v.optional(
      v.union(v.number(), v.literal("indefinite")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("appProfiles", {
      ...args,
      userId,
      updatedAt: now,
    });
  },
});
