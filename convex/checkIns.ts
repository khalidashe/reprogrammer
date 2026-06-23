import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { auth } from "./auth";
import { requireUserId } from "./users";

const resultValidator = v.union(
  v.literal("yes"),
  v.literal("tried"),
  v.literal("no"),
);

export const listMine = query({
  args: {},
  handler: async (ctx): Promise<Doc<"checkIns">[]> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    // Cap raised for long-term users (REP-48); ~years of daily check-ins.
    // Switch to cursor pagination if anyone approaches it.
    const rows = await ctx.db
      .query("checkIns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(10000);
    return rows.filter((c) => c.deletedAt === undefined);
  },
});

export const upsert = mutation({
  args: {
    clientId: v.string(),
    behaviorClientId: v.string(),
    at: v.number(),
    result: resultValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        behaviorClientId: args.behaviorClientId,
        at: args.at,
        result: args.result,
        note: args.note,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("checkIns", {
      userId,
      clientId: args.clientId,
      behaviorClientId: args.behaviorClientId,
      at: args.at,
      result: args.result,
      note: args.note,
      updatedAt: now,
    });
  },
});

export const softDelete = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("checkIns")
      .withIndex("by_userId_and_clientId", (q) =>
        q.eq("userId", userId).eq("clientId", args.clientId),
      )
      .unique();
    if (!existing) return;
    const now = Date.now();
    await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
  },
});
