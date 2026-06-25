/// <reference types="vite/client" />
/**
 * Server authorization + lifecycle tests (REP-30 Phase 3).
 *
 * Runs in the Convex env (needs `node_modules` + `convex-test` + `vitest`):
 *   npx vitest run convex/authz.test.ts
 *
 * Locks the per-user scoping (one user can never read or touch another's rows),
 * the private-tier consent gate on `entries`, and that `deleteAccount` purges
 * the caller's data. `@convex-dev/auth` encodes the identity subject as
 * `userId|sessionId`, so we simulate a signed-in user with that subject.
 */
import { convexTest } from "convex-test";
import { expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");

type T = ReturnType<typeof convexTest>;

function asUser(t: T, userId: Id<"users">) {
  return t.withIdentity({ subject: `${userId}|session_${userId}` });
}

function behaviorFields(clientId: string, userId: Id<"users">) {
  const now = Date.now();
  return {
    userId,
    clientId,
    kind: "adopt" as const,
    title: clientId,
    pingMessage: "",
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    window: { from: "09:00", to: "21:00" },
    intervalMinutes: 30,
    level: 1,
    lastLevelUpStreak: 0,
    createdAt: now,
    updatedAt: now,
    hidden: false,
    bookmarked: false,
  };
}

test("listMine is scoped to the calling user", async () => {
  const t = convexTest(schema, modules);
  const { userA, userB } = await t.run(async (ctx) => {
    const userA = await ctx.db.insert("users", {});
    const userB = await ctx.db.insert("users", {});
    await ctx.db.insert("behaviors", behaviorFields("a1", userA));
    await ctx.db.insert("behaviors", behaviorFields("b1", userB));
    return { userA, userB };
  });

  const aRows = await asUser(t, userA).query(api.behaviors.listMine, {});
  expect(aRows.map((r) => r.clientId)).toEqual(["a1"]);

  const bRows = await asUser(t, userB).query(api.behaviors.listMine, {});
  expect(bRows.map((r) => r.clientId)).toEqual(["b1"]);

  // Unauthenticated callers see nothing.
  const anon = await t.query(api.behaviors.listMine, {});
  expect(anon).toEqual([]);
});

test("one user cannot soft-delete another user's row", async () => {
  const t = convexTest(schema, modules);
  const { userA, userB } = await t.run(async (ctx) => {
    const userA = await ctx.db.insert("users", {});
    const userB = await ctx.db.insert("users", {});
    await ctx.db.insert("behaviors", behaviorFields("a1", userA));
    return { userA, userB };
  });

  // userB tries to delete userA's "a1" — the by_userId_and_clientId lookup is
  // scoped to userB, so it's a no-op and a1 survives.
  await asUser(t, userB).mutation(api.behaviors.softDelete, { clientId: "a1" });
  const aRows = await asUser(t, userA).query(api.behaviors.listMine, {});
  expect(aRows.map((r) => r.clientId)).toEqual(["a1"]);
});

test("entries.upsert is gated on privacy-sync consent", async () => {
  const t = convexTest(schema, modules);
  const userId = await t.run((ctx) => ctx.db.insert("users", {}));

  await expect(
    asUser(t, userId).mutation(api.entries.upsert, {
      clientId: "e1",
      behaviorClientId: "b1",
      at: Date.now(),
      value: 1,
    }),
  ).rejects.toThrow(/consent/i);

  await asUser(t, userId).mutation(api.appProfiles.recordPrivacyConsent, {
    version: "test",
  });
  const id = await asUser(t, userId).mutation(api.entries.upsert, {
    clientId: "e1",
    behaviorClientId: "b1",
    at: Date.now(),
    value: 1,
  });
  expect(id).toBeTruthy();
});

test("revokePrivacyConsent purges the user's private data", async () => {
  const t = convexTest(schema, modules);
  const userId = await t.run((ctx) => ctx.db.insert("users", {}));

  await asUser(t, userId).mutation(api.appProfiles.recordPrivacyConsent, {
    version: "test",
  });
  await asUser(t, userId).mutation(api.entries.upsert, {
    clientId: "e1",
    behaviorClientId: "b1",
    at: Date.now(),
    value: 1,
    fields: { text: "secret" },
  });

  await asUser(t, userId).mutation(api.appProfiles.revokePrivacyConsent, {});

  const entries = await asUser(t, userId).query(api.entries.listMine, {});
  expect(entries).toEqual([]);
});

test("deleteAccount erases the caller's rows and user record", async () => {
  const t = convexTest(schema, modules);
  const userId = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {});
    await ctx.db.insert("behaviors", behaviorFields("a1", userId));
    return userId;
  });

  // purgeUser is scheduled via runAfter(0) and self-reschedules in batches. Those
  // jobs fire on a setTimeout, so run the scheduling + flush under fake timers and
  // drain the whole chain — finishInProgressScheduledFunctions alone races the
  // macrotask and can assert before the purge has run.
  vi.useFakeTimers();
  try {
    await asUser(t, userId).mutation(api.account.deleteAccount, {});
    await t.finishAllScheduledFunctions(vi.runAllTimers);
  } finally {
    vi.useRealTimers();
  }

  const remaining = await t.run(async (ctx) => {
    const behaviors = await ctx.db.query("behaviors").collect();
    const user = await ctx.db.get(userId);
    return { behaviorCount: behaviors.length, user };
  });
  expect(remaining.behaviorCount).toBe(0);
  expect(remaining.user).toBeNull();
});
