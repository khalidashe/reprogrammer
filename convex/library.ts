import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";
import { isPro } from "./subscriptions";

export const getEntitlement = query({
  args: { guideIds: v.array(v.string()) },
  handler: async (
    ctx,
    args,
  ): Promise<{ isPro: boolean; lockedGuideIds: string[] }> => {
    const userId = await auth.getUserId(ctx);
    const pro = await isPro(ctx, userId);
    return {
      isPro: pro,
      lockedGuideIds: pro ? [] : args.guideIds,
    };
  },
});
