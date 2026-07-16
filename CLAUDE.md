<!-- firebase-ai-start -->

This project uses [Firebase](https://firebase.google.com) as its backend:
Firebase Auth (Apple + Google) and Cloud Firestore for cross-device sync.

Data model (subcollections, scopes reads + rules — no composite indexes):
`users/{uid}/{behaviors,checkIns,entries,reminderAttempts,appProfiles,subscriptions}`.
The private tier (entries + free-text fields journal/note/userBio/goals) is
gated on `appProfiles.privacySyncConsent` — enforced in Firestore security
rules (server trust), not just the client.

The AI refinement runs as a Firebase Callable Cloud Function
(`functions/src/index.ts`, `refineBehavior`) — verifies Auth UID + Pro
entitlement before calling the Nous inference API (Hermes-4.3-36B).

**Why Firebase:** we migrated from Convex for Google-ecosystem consolidation —
one console/login, Crashlytics + FCM already in use. NOT a cost decision; the
free tiers are comparable and cost was roughly a wash. Do not re-litigate the
backend choice.

<!-- firebase-ai-end -->

---

## Reprogrammer = the business · Workspace HQ

Reprogrammer is Khalid's core business (indie habit / mental-health app). Broader business
context, goals, and playbooks live in the workspace HQ one level up at `/Users/vi/Developer`:

- HQ map: `../.claude/CLAUDE.md`
- Business overview & the behavior-state model: `../context/business.md`
- Priorities & design north star (Atoms): `../context/goals.md`
- Shipping roadmap (get it on iPhone via TestFlight): `../context/sops/shipping-to-iphone.md`

**Working rules (from `~/.claude/CLAUDE.md`):** mentor tone · plan before executing · use
chat history incl. archived. Khalid is shipping his first app — teach the steps.

**Current focus:** (1) ship an MVP to Khalid's iPhone → (2) grow the behavior-state library
(`convex/library.ts`) → (3) UI/UX polish toward the Atoms app.
