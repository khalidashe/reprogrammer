# Legal documents

Source-controlled drafts of Reprogrammer's legal and store-compliance documents.

| File | Covers | Linear | Status |
|---|---|---|---|
| [privacy-policy.md](./privacy-policy.md) | What we collect, where it lives, the sensitive tier, AI flow, deletion, rights | REP-24 (+ REP-49) | **Draft — needs review** |
| [terms-of-service.md](./terms-of-service.md) | Educational-not-advice disclaimer, acceptable use, subscriptions, liability | REP-25 | **Draft — needs review** |
| [store-data-safety-disclosures.md](./store-data-safety-disclosures.md) | Apple App Privacy + Google Play Data Safety answer reference | REP-26 (+ REP-49) | **Draft — needs review** |

## What these reflect

They are written to the **launch-target design** decided for REP-30 (Option A —
accounts + cloud sync ship in v1), including the **2026-06-22 reversal**: for
consenting Pro users, private writing (journals, check-in notes, bio/goals,
reflections/CBT entries) **does** sync, stored **server-readable and encrypted at
rest — not end-to-end encrypted**. The data tiers are derived from
[`services/sync-policy.ts`](../services/sync-policy.ts) — the `PRIVATE_FIELDS`
registry, the wholly-private `entries` entity, and the consent version
`PRIVACY_SYNC_CONSENT_VERSION` (`2026-06-22.1`). The private tier is enforced at
both ends (client + server) and revoking consent purges the remote copies
(REP-47); in-app account deletion erases all server data + the auth identity
(REP-48).

## ⚠ Before publishing / submitting

These are **drafts**, not legal advice. Two things must happen before they go
live:

1. **Human/legal review.** Have a qualified person review them — they describe
   sensitive mental-health-adjacent data handling, subscriptions, and liability,
   and reference a Saudi entity (Ashe Ventures Company) with EU-hosted data and a
   global user base.
2. **Build-accuracy check.** The disclosures assume sync + account wall +
   in-app deletion are in the shipped binary (REP-46/47/48). If you submit
   *before* those land, narrow the claims to the actual offline-first build. See
   the checklist at the bottom of
   [store-data-safety-disclosures.md](./store-data-safety-disclosures.md).

## Publish checklist

- [ ] Reviewed and finalised wording (and dates).
- [ ] Published Privacy Policy + Terms to public URLs (reprogrammer.app/privacy,
      /terms) and confirmed they are reachable.
- [ ] Linked both in-app (Settings/onboarding) and in App Store Connect / Play
      Console.
- [ ] Completed Apple App Privacy + Google Play Data Safety using the reference,
      after the build-accuracy check.
- [ ] Confirmed the privacy-sync consent screen (REP-47) cites the Privacy Policy
      and records `PRIVACY_SYNC_CONSENT_VERSION` (`2026-06-22.1`) on acceptance;
      bump that constant and the "Last updated" date together if the sensitive
      tier's scope changes.
