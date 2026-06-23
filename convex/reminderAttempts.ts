import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { auth } from "./auth";
import { requireUserId } from "./users";

const phaseValidator = v.union(
  v.literal("initial"),
  v.literal("snooze15"),
  v.literal("snooze30"),
);

const statusValidator = v.union(
  v.literal("scheduled"),
  v.literal("resolved"),
  v.literal("skipped"),
  v.literal("disabled"),
);

export const listMine = query({
  args: {},
  handler: async (ctx): Promise<Doc<"reminderAttempts">[]> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    // Cap raised for long-term users (REP-48). Switch to cursor pagination if
    // anyone approaches it.
    return await ctx.db
      .query("reminderAttempts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(10000);
  },
});

export const upsert = mutation({
  args: {
    clientId: v.string(),
    behaviorClientId: v.string(),
    scheduledFor: v.number(),
    phase: phaseValidator,
    status: statusValidator,
    noCount: v.number(),
    createdAt: v.number(),
    notificationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("reminderAttempts")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        behaviorClientId: args.behaviorClientId,
        scheduledFor: args.scheduledFor,
        phase: args.phase,
        status: args.status,
        noCount: args.noCount,
        notificationId: args.notificationId,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("reminderAttempts", {
      userId,
      clientId: args.clientId,
      behaviorClientId: args.behaviorClientId,
      scheduledFor: args.scheduledFor,
      phase: args.phase,
      status: args.status,
      noCount: args.noCount,
      createdAt: args.createdAt,
      updatedAt: now,
      notificationId: args.notificationId,
    });
  },
});
