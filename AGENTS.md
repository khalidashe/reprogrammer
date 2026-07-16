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
entitlement before calling Anthropic (Haiku-class model).

<!-- firebase-ai-end -->
