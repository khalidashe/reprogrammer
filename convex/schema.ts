import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const kindValidator = v.union(v.literal("adopt"), v.literal("eliminate"));

const practiceTypeValidator = v.union(
  v.literal("mental"),
  v.literal("physical"),
  v.literal("learning"),
  v.literal("mental_physical"),
  v.literal("mental_learning"),
  v.literal("physical_learning"),
);

const domainValidator = v.union(
  v.literal("language_cognitive"),
  v.literal("physical"),
  v.literal("social"),
  v.literal("emotional"),
  v.literal("creative"),
  v.literal("professional"),
);

const resultValidator = v.union(
  v.literal("yes"),
  v.literal("tried"),
  v.literal("no"),
);

const reminderPhaseValidator = v.union(
  v.literal("initial"),
  v.literal("snooze15"),
  v.literal("snooze30"),
);

const reminderStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("resolved"),
  v.literal("skipped"),
  v.literal("disabled"),
);

const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("trial"),
  v.literal("expired"),
  v.literal("in_grace_period"),
  v.literal("cancelled"),
);

const subscriptionStoreValidator = v.union(
  v.literal("app_store"),
  v.literal("play_store"),
  v.literal("stripe"),
);

export default defineSchema({
  ...authTables,

  subscriptions: defineTable({
    userId: v.id("users"),
    entitlement: v.literal("pro"),
    status: subscriptionStatusValidator,
    store: subscriptionStoreValidator,
    productId: v.string(),
    expiresAt: v.number(),
    willRenew: v.boolean(),
    originalTransactionId: v.string(),
    revenueCatCustomerId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_originalTransactionId", ["originalTransactionId"]),

  behaviors: defineTable({
    userId: v.id("users"),
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
    window: v.object({ from: v.string(), to: v.string() }),
    intervalMinutes: v.number(),
    level: v.number(),
    lastLevelUpStreak: v.number(),
    pausedUntil: v.optional(v.number()),
    pausedIndefinitely: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    hidden: v.boolean(),
    bookmarked: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_clientId", ["userId", "clientId"]),

  checkIns: defineTable({
    userId: v.id("users"),
    clientId: v.string(),
    behaviorClientId: v.string(),
    at: v.number(),
    result: resultValidator,
    note: v.optional(v.string()),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_clientId", ["userId", "clientId"])
    .index("by_userId_and_behavior", ["userId", "behaviorClientId"]),

  // Typed capture values (REP-5). A wholly-private entity: every row can carry
  // personal writing (reflection / CBT text in `fields`), so it only syncs once
  // the user has accepted privacy-sync consent — see services/sync-policy.ts.
  entries: defineTable({
    userId: v.id("users"),
    clientId: v.string(),
    behaviorClientId: v.string(),
    at: v.number(),
    value: v.number(),
    fields: v.optional(v.record(v.string(), v.string())),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_clientId", ["userId", "clientId"]),

  reminderAttempts: defineTable({
    userId: v.id("users"),
    clientId: v.string(),
    behaviorClientId: v.string(),
    scheduledFor: v.number(),
    phase: reminderPhaseValidator,
    status: reminderStatusValidator,
    noCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    notificationId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_clientId", ["userId", "clientId"]),

  appProfiles: defineTable({
    userId: v.id("users"),
    hasOnboarded: v.boolean(),
    userName: v.optional(v.string()),
    userBio: v.optional(v.string()),
    // Free-text goals (REP-41). Private-tier field — gated on consent.
    goals: v.optional(v.string()),
    lastLapseAt: v.optional(v.number()),
    lastLapseAcknowledged: v.optional(v.boolean()),
    quietHours: v.optional(v.object({ from: v.string(), to: v.string() })),
    notificationsDenied: v.optional(v.boolean()),
    remindersMutedUntil: v.optional(
      v.union(v.number(), v.literal("indefinite")),
    ),
    // Privacy-sync consent (REP-30 Phase 2). Presence gates the private tier:
    // entries + the free-text fields (journal / note / userBio / goals).
    privacySyncConsent: v.optional(
      v.object({ version: v.string(), acceptedAt: v.number() }),
    ),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
