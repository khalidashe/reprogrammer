import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { isPro } from "./subscriptions";

export const checkPro = internalQuery({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const userId = await auth.getUserId(ctx);
    return await isPro(ctx, userId);
  },
});

export const refineBehavior = action({
  args: {
    currentTitle: v.string(),
    currentMessage: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ title: string; message: string }> => {
    const pro: boolean = await ctx.runQuery(internal.ai.checkPro, {});
    if (!pro) {
      throw new Error("AI refinement is a Pro feature.");
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Server is missing ANTHROPIC_API_KEY.");
    }

    const systemPrompt = `You are a professional assistant that refines behavior descriptions for a habit tracking app.
Return JSON with refined versions. Be direct, specific, and professional.
Avoid motivational phrases or cheesy language. Keep suggestions practical and clear.`;

    const userPrompt = `The user is creating a behavior to track with:
- Title: "${args.currentTitle}"
- Notification message: "${args.currentMessage}"

Please refine these MINIMALLY:
1. Improve wording/clarity but keep similar length
2. Use more vivid or precise language, not full sentences
3. No motivational phrases or fluff
4. Title: 2-5 words. Message: 2-5 words or short phrase (under 40 chars)

Return ONLY valid JSON:
{
  "title": "refined title",
  "message": "short refined message"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    const responseText = data.content?.[0]?.text?.trim();
    if (!responseText) {
      throw new Error("Empty response from AI.");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Invalid AI response format: ${responseText}`);
    }
    const refined = JSON.parse(jsonMatch[0]) as {
      title?: string;
      message?: string;
    };
    return {
      title: refined.title || args.currentTitle,
      message: refined.message || args.currentMessage,
    };
  },
});
