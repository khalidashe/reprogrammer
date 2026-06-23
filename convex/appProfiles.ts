import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";
import { requireUserId } from "./users";

async function profileForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"appProfiles"> | null> {
  return await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

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
  // NOTE: `privacySyncConsent` is intentionally NOT an arg here — it is owned by
  // recordPrivacyConsent / revokePrivacyConsent. Routing it through this generic
  // upsert (which patches `{ ...args }`) would let a client push that omits it
  // silently clear the consent flag.
  args: {
    hasOnboarded: v.boolean(),
    userName: v.optional(v.string()),
    userBio: v.optional(v.string()),
    goals: v.optional(v.string()),
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
    const existing = await profileForUser(ctx, userId);
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

export const recordPrivacyConsent = mutation({
  args: { version: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await profileForUser(ctx, userId);
    const now = Date.now();
    const consent = { version: args.version, acceptedAt: now };
    if (existing) {
      await ctx.db.patch(existing._id, {
        privacySyncConsent: consent,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("appProfiles", {
      userId,
      hasOnboarded: true,
      privacySyncConsent: consent,
      updatedAt: now,
    });
  },
});

// Caps match the per-entity listMine reads. A single user's private data fits
// comfortably; Phase 3 (REP-48) revisits pagination for heavy/long-term users.
const PURGE_BEHAVIOR_CAP = 500;
const PURGE_ROW_CAP = 5000;

export const revokePrivacyConsent = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await profileForUser(ctx, userId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        privacySyncConsent: undefined,
        goals: undefined,
        userBio: undefined,
        updatedAt: now,
      });
    }

    // Purge already-synced private data so opting out actually removes it.
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(PURGE_ROW_CAP);
    for (const e of entries) {
      if (e.deletedAt === undefined) {
        await ctx.db.patch(e._id, { deletedAt: now, updatedAt: now });
      }
    }

    const behaviors = await ctx.db
      .query("behaviors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(PURGE_BEHAVIOR_CAP);
    for (const b of behaviors) {
      if (b.journal !== undefined) {
        await ctx.db.patch(b._id, { journal: undefined, updatedAt: now });
      }
    }

    const checkIns = await ctx.db
      .query("checkIns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(PURGE_ROW_CAP);
    for (const c of checkIns) {
      if (c.note !== undefined) {
        await ctx.db.patch(c._id, { note: undefined, updatedAt: now });
      }
    }
  },
});
