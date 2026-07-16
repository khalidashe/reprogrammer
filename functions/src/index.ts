import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError, onRequest } from 'firebase-functions/v2/cloud-functions';
import { defineSecretVersion } from 'firebase-functions/v2/params';

// Initialize the Admin SDK once (uses the function's default credentials).
initializeApp();
const db = getFirestore();

/**
 * Secret: Anthropic API key. Set with:
 *   firebase functions:secrets:set ANTHROPIC_API_KEY
 * (No plaintext in code — Critical-Mistakes §7 / repo hygiene.)
 */
const anthropicApiKey = defineSecretVersion('ANTHROPIC_API_KEY');

const SYSTEM_PROMPT = `You are a professional assistant that refines behavior descriptions for a habit tracking app.
Return JSON with refined versions. Be direct, specific, and professional.
Avoid motivational phrases or cheesy language. Keep suggestions practical and clear.`;

/**
 * refineBehavior — Firebase Callable Cloud Function (FB-3).
 *
 * Verifies the caller's Firebase Auth UID and Pro entitlement (read from their
 * Firestore subscription doc) BEFORE calling Anthropic. Uses a Haiku-class
 * model — the old claude-opus-4-7 was massive overkill for a 2–5 word
 * refinement. Same JSON-only parse + fallback-to-input behavior as before.
 */
export const refineBehavior = onCall(
  {
    secrets: [anthropicApiKey],
    // Run in the same region as your project to keep auth/Firestore local.
    region: 'us-central1',
  },
  async (request) => {
    const authUid = request.auth?.uid;
    if (!authUid) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const subSnap = await db
      .collection('users')
      .doc(authUid)
      .collection('subscriptions')
      .doc('profile')
      .get();
    const sub = subSnap.data();
    const isPro =
      sub?.entitlement === 'pro' &&
      sub?.status !== 'expired' &&
      sub?.status !== 'cancelled' &&
      (sub?.expiresAt === undefined || sub.expiresAt > Date.now());
    if (!isPro) {
      throw new HttpsError('permission-denied', 'AI refinement is a Pro feature.');
    }

    const { currentTitle, currentMessage } = request.data ?? {};
    if (typeof currentTitle !== 'string' || typeof currentMessage !== 'string') {
      throw new HttpsError('invalid-argument', 'currentTitle and currentMessage are required.');
    }

    const key = anthropicApiKey.value();
    if (!key) {
      throw new HttpsError('failed-precondition', 'Server is missing ANTHROPIC_API_KEY.');
    }

    const userPrompt = `The user is creating a behavior to track with:
- Title: "${currentTitle}"
- Notification message: "${currentMessage}"

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        // Cheap, fast model — same quality for this micro-task, fraction of cost.
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new HttpsError('internal', `Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as { content?: Array<{ text?: string }> };
    const responseText = data.content?.[0]?.text?.trim();
    if (!responseText) {
      throw new HttpsError('internal', 'Empty response from AI.');
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new HttpsError('internal', `Invalid AI response format: ${responseText}`);
    }
    const refined = JSON.parse(jsonMatch[0]) as { title?: string; message?: string };
    return {
      title: refined.title || currentTitle,
      message: refined.message || currentMessage,
    };
  },
);

// --- RevenueCat webhook -> Firestore subscription doc (replaces Convex http.ts) ---

function statusFromEventType(eventType: string): { status: string; willRenew: boolean } | null {
  switch (eventType) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
    case 'TRIAL_CONVERTED':
      return { status: 'active', willRenew: true };
    case 'TRIAL_STARTED':
      return { status: 'trial', willRenew: true };
    case 'CANCELLATION':
      return { status: 'active', willRenew: false };
    case 'EXPIRATION':
    case 'SUBSCRIPTION_PAUSED':
      return { status: 'expired', willRenew: false };
    case 'BILLING_ISSUE':
      return { status: 'in_grace_period', willRenew: true };
    default:
      return null;
  }
}

function mapStore(s?: string): string {
  if (s === 'APP_STORE' || s === 'MAC_APP_STORE') return 'app_store';
  if (s === 'PLAY_STORE') return 'play_store';
  return 'stripe';
}

export const revenuecatWebhook = onRequest({ region: 'us-central1' }, async (req, res) => {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected || req.headers['authorization'] !== expected) {
    res.status(401).send('Unauthorized');
    return;
  }
  const event = req.body?.event;
  if (!event?.type) {
    res.status(400).send('Missing event type');
    return;
  }
  const mapped = statusFromEventType(event.type);
  if (!mapped) {
    res.status(200).send('Ignored');
    return;
  }
  const rawUserId = event.app_user_id ?? event.original_app_user_id;
  if (!rawUserId) {
    res.status(400).send('Missing app_user_id');
    return;
  }
  await db
    .collection('users')
    .doc(rawUserId)
    .collection('subscriptions')
    .doc('profile')
    .set(
      {
        entitlement: 'pro',
        status: mapped.status,
        store: mapStore(event.store),
        productId: event.product_id ?? 'unknown',
        expiresAt: event.expiration_at_ms ?? Date.now(),
        willRenew: mapped.willRenew,
        originalTransactionId: event.original_transaction_id ?? event.transaction_id ?? '',
        revenueCatCustomerId: rawUserId,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  res.status(200).send('OK');
});
