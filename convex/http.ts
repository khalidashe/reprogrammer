import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);

type RevenueCatEvent = {
  event: {
    type: string;
    app_user_id?: string;
    original_app_user_id?: string;
    product_id?: string;
    expiration_at_ms?: number;
    purchased_at_ms?: number;
    entitlement_ids?: string[];
    period_type?: string;
    store?: string;
    original_transaction_id?: string;
    transaction_id?: string;
    aliases?: string[];
  };
};

function statusFromEventType(eventType: string): {
  status: "active" | "trial" | "expired" | "cancelled" | "in_grace_period";
  willRenew: boolean;
} | null {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
      return { status: "active", willRenew: true };
    case "TRIAL_STARTED":
      return { status: "trial", willRenew: true };
    case "TRIAL_CONVERTED":
      return { status: "active", willRenew: true };
    case "CANCELLATION":
      return { status: "active", willRenew: false };
    case "EXPIRATION":
    case "SUBSCRIPTION_PAUSED":
      return { status: "expired", willRenew: false };
    case "BILLING_ISSUE":
      return { status: "in_grace_period", willRenew: true };
    default:
      return null;
  }
}

function mapStore(s?: string): "app_store" | "play_store" | "stripe" {
  if (s === "APP_STORE" || s === "MAC_APP_STORE") return "app_store";
  if (s === "PLAY_STORE") return "play_store";
  return "stripe";
}

http.route({
  path: "/webhooks/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
    if (!expected) {
      return new Response("Server misconfigured", { status: 500 });
    }
    const provided = req.headers.get("authorization");
    if (provided !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: RevenueCatEvent;
    try {
      body = (await req.json()) as RevenueCatEvent;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const event = body.event;
    if (!event?.type) {
      return new Response("Missing event type", { status: 400 });
    }

    const mapped = statusFromEventType(event.type);
    if (!mapped) {
      return new Response("Ignored event type", { status: 200 });
    }

    const rawUserId = event.app_user_id ?? event.original_app_user_id;
    if (!rawUserId) {
      return new Response("Missing app_user_id", { status: 400 });
    }

    let userId: Id<"users">;
    try {
      userId = rawUserId as Id<"users">;
    } catch {
      return new Response("Invalid app_user_id", { status: 400 });
    }

    await ctx.runMutation(internal.subscriptions.upsertFromWebhook, {
      userId,
      entitlement: "pro",
      status: mapped.status,
      store: mapStore(event.store),
      productId: event.product_id ?? "unknown",
      expiresAt: event.expiration_at_ms ?? Date.now(),
      willRenew: mapped.willRenew,
      originalTransactionId: event.original_transaction_id ?? event.transaction_id ?? "",
      revenueCatCustomerId: rawUserId,
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
