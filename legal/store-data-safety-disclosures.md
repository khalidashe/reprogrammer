# App Store & Google Play — Data-Safety Disclosures (reference)

**Last updated: 23 June 2026**

This is the **source-of-truth reference** for completing the two store privacy
questionnaires:

- **Apple — App Privacy** ("nutrition label"), filled in App Store Connect.
- **Google Play — Data safety** form, filled in the Play Console.

It is **not** a published document. Inaccurate disclosures are a common cause of
app rejection or removal, so the answers below must match the
[Privacy Policy](./privacy-policy.md) and the **actual shipped build**. Re-check
this before each submission (see "Build-accuracy check" at the end).

Throughout: **"collected"** = data transmitted off the device to us or a service
provider. Data that stays only on the device is **not** "collected" under either
store's definition — which matters because Reprogrammer is offline-first and the
free tier keeps most data local.

---

## 1. Data inventory → store categories

| What we have | Apple category | Google Play category | Collected? | Linked to identity? | Used for tracking? |
|---|---|---|---|---|---|
| Email address | Contact Info → Email Address | Personal info → Email address | Yes (account is required) | Yes | No |
| Display name | Contact Info → Name | Personal info → Name | Yes | Yes | No |
| Apple/Google sign-in ID | Identifiers → User ID | Personal info → User IDs | Yes | Yes | No |
| Behaviors, schedules, streaks, check-ins | User Content → Other User Content | App activity → Other user-generated content; App info & performance | Yes, **Pro sync only** | Yes | No |
| Journals, check-in notes, bio, goals, reflections / CBT entries (private tier) | User Content → Other User Content (sensitive) | Personal info → Other info; **App activity / Health-adjacent free text** | Yes, **Pro + explicit consent only** | Yes | No |
| Subscription / purchase status | Purchases → Purchase History | Financial info → Purchase history | Yes | Yes | No |
| Crash/diagnostic data (if any SDK reports it) | Diagnostics → Crash/Performance | App info & performance → Crash logs / Diagnostics | **Verify in build** | TBD | No |

**Tracking:** We do **not** use data for tracking as Apple defines it (no linking
to third-party data for ads, no ad SDKs, no data brokering). Answer **"No"** to
all tracking questions on both stores.

**Data sale / sharing for ads:** **No** on both stores.

### Authoritative field classification (source of truth)

The split above — which fields sync, which count as the consent-gated **private
tier**, and the consent version users accept — is defined in code at
[`services/sync-policy.ts`](../services/sync-policy.ts): the `PRIVATE_FIELDS`
registry (`behaviors.journal`, `checkIns.note`, `appProfiles.userBio` +
`appProfiles.goals`), the wholly-private `entries` entity, and
`PRIVACY_SYNC_CONSENT_VERSION` (currently `2026-06-22.1`, recorded with the
acceptance timestamp). Keep this table in step with that file — it is the single
source the app, the [Privacy Policy](./privacy-policy.md), and these answers all
derive from, so a renamed/added field can't silently fall out of the contract.

The private tier is enforced **at both ends** (REP-47): the client never pushes a
private field or `entries` row without consent, and the server rejects `entries`
writes that have no recorded consent. **Revoking consent purges the remote
private copies** (the on-device copy stays). **In-app account deletion** (REP-48)
erases every server row plus the authentication identity.

---

## 2. Apple — App Privacy answers (App Store Connect)

For each data type below: collected = **Yes**, linked to the user = **Yes**,
used for tracking = **No**. Purposes shown per type.

- **Contact Info — Email Address:** App Functionality; (optional) Product
  Personalization / Communications if the user opts into the digest email.
- **Contact Info — Name:** App Functionality.
- **Identifiers — User ID:** App Functionality (authentication).
- **User Content — Other User Content:** App Functionality. Covers behaviors,
  check-ins, and — for consenting Pro users — the private writing tier. This is
  where the sensitive free-text is disclosed.
- **Purchases — Purchase History:** App Functionality (manage subscription /
  entitlement).
- **Diagnostics — Crash Data / Performance Data:** App Functionality — **only if
  a crash/diagnostics SDK is present in the build.** If none, do not declare.

Apple has no separate "sensitive data" tier in the label, but the **Privacy
Policy must clearly describe** the emotional/health-adjacent writing and the
third-party AI flow. Apple also requires a reachable **Privacy Policy URL** in
App Store Connect.

### Apple notes that often trip submissions
- **Sign in with Apple:** because we offer Google sign-in (a third-party login),
  Apple Guideline 4.8 requires we **also offer Sign in with Apple** (we do) or an
  equivalent privacy-preserving login. Keep it in the build.
- **Account deletion:** Apple requires in-app account deletion when an app
  supports account creation (Guideline 5.1.1(v)). This is **REP-48** — it must be
  shipped before submission, and the deletion path documented here and in the
  Privacy Policy.
- **Third-party AI / "snapshot to LLM":** disclose under User Content purposes and
  describe in the Privacy Policy. Ensure the AI features are presented as Pro and
  consented.

---

## 3. Google Play — Data safety answers (Play Console)

Declare the following as **collected** and **processed** (and, for the synced
tiers, **transferred to our servers**); for each, **encrypted in transit = Yes**,
**user can request deletion = Yes** (in-app + email):

- **Personal info → Email address, Name, User IDs** — App functionality; Account
  management. (Email also Communications if the user opts into the digest.)
- **App activity → Other user-generated content** — App functionality. Behaviors,
  check-ins, and the consented private-tier writing.
- **Financial info → Purchase history** — App functionality.
- **App info & performance → Crash logs / Diagnostics** — **only if present in the
  build.**

Play-specific questions:
- **Is all collected data encrypted in transit?** **Yes** (TLS).
- **Do you provide a way to request data deletion?** **Yes** — in-app account
  deletion (REP-48) plus info@reprogrammer.app.
- **Is any data collected required, or can users choose?** The **account/email is
  required**; **sync and the private-tier are optional** (Pro + consent). Reflect
  this in the "optional vs required" toggles per data type.
- **Sensitive data:** the private-tier writing can include mental-health /
  emotional content; describe it accurately and keep it consent-gated.

---

## 4. Third parties to disclose consistently

These appear in the Privacy Policy and must be reflected in how the store
questionnaires are answered (data leaving the device / shared with service
providers):

- **Convex** — backend & hosting (EU/Ireland): all synced account + app data.
- **RevenueCat** — subscription management: purchase/entitlement identifiers.
- **Apple / Google / Stripe** — payment processing.
- **Anthropic** — AI text generation for opt-in Pro features (behavior
  refinement sends only the short title + ping message; Coach AI sends a snapshot
  only on explicit, consented request).

---

## 5. Build-accuracy check — DO THIS BEFORE EACH SUBMISSION

The disclosures above describe the **launch-target design**, in which v1 ships
with cloud sync. The current codebase is still offline-first and several pieces
are **not yet implemented**. Before submitting, confirm the binary actually
matches each declared data flow, and adjust the answers if a feature is not in
the shipped build:

- [ ] **Account wall + email capture** shipped (REP-46 — PR #26). If the
      account/email is not actually collected yet, do not declare it as collected.
- [ ] **Cloud sync** of behaviors/check-ins shipped (REP-47 — PR #27). If nothing
      syncs, then nothing in tier 2/3 is "collected" — declare accordingly.
- [ ] **Private-tier sync + consent gate** shipped (REP-47 — PR #27). Only declare
      the sensitive free-text as collected if it can actually leave the device,
      i.e. the consent screen is reachable and `entries`/private fields push.
- [ ] **In-app account deletion** shipped (REP-48 — PR #28) — required by Apple
      before you can truthfully answer the deletion questions and pass review.

> Code for REP-46/47/48 is implemented in the PRs noted above. These boxes track
> the **shipped binary**, so leave them unchecked until the merged build is
> verified on a device (see each PR's verification steps).
- [ ] **AI features present** — confirm which AI calls exist in the build (today:
      Pro behavior-refinement to Anthropic; the server-side Coach-reads-your-data
      flow is part of REP-6's later phases). Disclose only what ships.
- [ ] **Crash/diagnostics SDK** — check whether the build includes one (Expo /
      Sentry / etc.); declare Diagnostics only if it does.
- [ ] A reachable **Privacy Policy URL** and **Terms URL** are live and linked in
      both stores and in-app.

> **Bottom line:** if you submit a build *before* REP-46/47/48 land, the truthful
> disclosure is the narrower offline-first one (account/email only, little or no
> "collected" app content, no private-tier transfer). Don't over-declare a flow
> that isn't in the binary, and don't under-declare one that is.
