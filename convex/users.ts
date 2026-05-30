import {
  query,
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";

export type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

export async function requireUserId(ctx: AnyCtx): Promise<Id<"users">> {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getCurrentUserId = query({
  args: {},
  handler: async (ctx): Promise<Id<"users"> | null> => {
    return await auth.getUserId(ctx);
  },
});
