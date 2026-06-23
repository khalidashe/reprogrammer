# Privacy Policy

**Last updated: 23 June 2026**

This Privacy Policy explains what Reprogrammer collects, where it is stored, when
it leaves your device, who we share it with, and the choices and rights you have.
Reprogrammer captures personal and sometimes emotionally sensitive information
(behavior notes, journals, reflections, and CBT-style thought records), so we
have tried to write this plainly rather than burying the important parts.

Reprogrammer ("the app", "we", "us") is operated by **Ashe Ventures Company**, a
single-person limited liability company registered in the Kingdom of Saudi
Arabia. Contact: **info@reprogrammer.app**.

---

## The short version

- **You need an account to use the app.** Creating one captures your email and a
  display name. This is the one thing every user shares with us.
- **The app works offline-first.** Your behaviors, check-ins, streaks, and your
  private writing live on your device by default.
- **Cloud sync is a paid (Pro) feature.** If you are on the free tier, your data
  stays on your device and is not synced to our servers (beyond your account
  basics).
- **For Pro users, your data syncs to our servers** so it is backed up and
  available across your devices. This includes your behaviors, check-ins,
  streaks, and settings.
- **Your private writing (journals, check-in notes, reflections, CBT entries)
  only syncs if you separately turn it on** and accept a clear consent screen.
  When you do, that writing is stored on our servers **readable by us and
  encrypted at rest — it is not end-to-end encrypted.** We explain what that
  means below.
- **Some features send data to a third-party AI provider (Anthropic).** We tell
  you which ones, and they are opt-in Pro features.
- **You can delete your account and all of its server-side data at any time.**

---

## Who this Policy applies to and children

Reprogrammer is intended for adults. It is **not directed to children under 16**,
and we do not knowingly collect data from children under 16. If you believe a
child has provided us personal data, contact **info@reprogrammer.app** and we
will delete it.

---

## What we collect and where it is stored

We group data by **where it lives**, because that is what matters most for your
privacy.

### 1. Account data (always collected, stored on our servers)

To create the account that every user needs, we store:

- **Email address** — used to sign you in, secure your account, and (with your
  consent) send the optional weekly digest / product email.
- **Display name** — what the app calls you.
- **Authentication identifiers** — if you sign in with Apple or Google, we
  receive and store the identifier those services return so we can recognise you
  on future sign-ins. (Sign in with Apple can relay a private/anonymised email;
  we store whatever the service provides.)

Authentication is handled with Convex Auth. We do not store your Apple or Google
password.

### 2. App content (on-device by default; synced to our servers for Pro users)

This is the data the app is built around. On the **free tier it stays on your
device**. On the **Pro tier it syncs to our servers** for backup and
cross-device use:

- **Behaviors** you create or adopt — title, the reminder ("ping") message,
  type, category, schedule (active days, time window, interval), level and
  streak counters, tags, and bookmarks.
- **Check-ins** — whether you did the behavior (yes / tried / no) and when.
- **Reminder/notification bookkeeping** — when prompts were scheduled and how you
  responded, so the scheduling engine works correctly.
- **Settings and preferences** — onboarding state, quiet hours, notification
  preferences, and similar choices.

### 3. Private writing — the sensitive tier (consent-gated)

Reprogrammer lets you write freely, and some of that writing is emotional or
health-adjacent. This tier covers:

- **Behavior journals** (free-text notes attached to a behavior),
- **Check-in notes** (what you wrote when logging a check-in),
- **Your bio and goals** (free-text profile fields),
- **Reflections and CBT-style thought records** (entries capturing feelings,
  situations, and thoughts).

**On the free tier, this writing never leaves your device.**

**On the Pro tier, this writing only leaves your device if you explicitly opt in**
via a dedicated consent screen that records the version you accepted and the
date. When enabled:

- It is stored on our servers, **readable by us**, and **encrypted at rest**.
- It is **not end-to-end encrypted.** Being honest about what that protects:
  at-rest encryption guards the stored data against theft of the underlying
  disks or database files. It does **not** protect against a breach of the
  running application, a malicious or compelled insider, or a lawful legal
  demand (e.g. a subpoena). For that reason our real protections for this tier
  are: it is opt-in, we minimise what we keep, you can delete it, and we
  disclose its handling honestly here.
- You can **turn it off at any time.** Doing so stops syncing your private
  writing and deletes the private-tier copies already on our servers (your
  on-device copy remains).

Because this tier can include feelings, mental-health reflections, and CBT
material, it may constitute **special-category / sensitive personal data** under
laws such as the EU/UK GDPR. We process it **only with your explicit consent**
and only to provide the features you have turned on.

### 4. Subscription data (collected when you subscribe)

Purchases are processed by **the Apple App Store, Google Play, or Stripe**, and
managed through **RevenueCat**, our subscription infrastructure provider. We do
**not** receive or store your full card number. We store the status of your
entitlement: plan, status (active / trial / expired / grace / cancelled), the
store used, product identifier, renewal/expiry, and the identifiers RevenueCat
and the stores use to tie a purchase to your account.

### 5. What we do **not** collect

- We do **not** include third-party advertising or ad SDKs, and we do not sell
  your personal data.
- We do **not** run third-party analytics that profile you across other apps.
- We do **not** collect your contacts, photos, precise location, or browsing
  history.

---

## When data is sent to a third-party AI provider (Anthropic)

Some optional, Pro-only features use an external large-language-model provider,
**Anthropic** (the maker of Claude), to generate text. When you use one of these
features, the relevant input is sent to Anthropic's API over an encrypted
connection, processed to produce a result, and returned to you.

- **Behavior refinement.** When you ask the app to refine a behavior you are
  creating, we send **only the short behavior title and reminder message** you
  typed. We do not send your journals, check-in notes, or reflections for this
  feature.
- **The Coach (AI insight), where it uses the AI provider.** The Coach's basic
  insights are generated **on your device** and involve no network call. Where a
  Coach feature uses the AI provider to give deeper, personalised insight, it
  **only sends a snapshot of the relevant data on your explicit request and with
  your consent**, and tells you before it does so. If you have not enabled
  private-tier features, your private writing is not included.

We send the minimum needed for the feature to work. Anthropic processes this
data as our service provider to return the result; it is not used to show you
ads. Anthropic's handling of API data is governed by its own terms; per
Anthropic's published policy, API inputs and outputs are not used to train its
models by default.

---

## Where your data is hosted

Our backend and database are operated on **Convex**, with data hosted in the
**European Union (Ireland)**. Subscription processing involves **RevenueCat**,
**Apple**, **Google**, and/or **Stripe**. AI features involve **Anthropic**.
Because you may use the app from outside these regions, your data may be
transferred to and processed in countries other than your own, including
transfers relying on standard contractual clauses or equivalent safeguards where
required.

### Sub-processors we rely on

| Provider   | Purpose                                   | Data involved                                  |
|------------|-------------------------------------------|------------------------------------------------|
| Convex     | Backend, database, hosting (EU/Ireland)   | Account + all synced app content               |
| RevenueCat | Subscription management                   | Purchase/entitlement identifiers and status    |
| Apple / Google / Stripe | Payment processing            | Payment + transaction data (we don't see cards)|
| Anthropic  | AI text generation (opt-in features)      | Only the inputs described above                |

---

## How we use your data

We use your data only to operate and improve the app you are using:

- To provide the core experience — create and run behaviors, schedule reminders,
  record check-ins, compute streaks and your weekly review.
- To sync and back up your data across your devices (Pro).
- To generate insights and refinements you ask for (the opt-in AI features).
- To manage your subscription and entitlements.
- To send the account and (optional) product/digest emails you have agreed to.
- To keep the service secure, debug problems, and meet legal obligations.

We do **not** use your personal writing to advertise to you, and we do not sell
it.

---

## Retention

- **Account and synced app data** are kept for as long as your account exists.
- **Private-tier writing** is kept only while you have the feature enabled; turn
  it off and the server copies are deleted.
- **When you delete your account**, we delete your account and associated
  server-side data (see below). Backups and logs that may briefly contain data
  are rotated out on a routine cycle.
- We may retain limited records where the law requires it (for example,
  transaction records for tax/accounting).

---

## Deleting your data and your account

You can **delete your account and its server-side data from within the app**
(Settings → Account). Deletion removes your behaviors, check-ins, reminder
records, profile, private-tier writing, and subscription records held on our
servers, along with your authentication identity. Data already on your own device
is removed when you delete the app or its data.

You can also email **info@reprogrammer.app** to request deletion.

---

## Your rights

Depending on where you live (for example under the EU/UK GDPR or similar laws),
you may have the right to access, correct, delete, export, or restrict processing
of your personal data, to object to certain processing, and to withdraw consent
at any time (without affecting processing already carried out). Many of these you
can exercise directly in the app; for the rest, contact **info@reprogrammer.app**
and we will respond within the time the applicable law requires. You also have
the right to complain to your local data-protection authority.

**Legal bases (EU/UK GDPR).** We process your data to **perform our contract**
with you (running the app and your account), based on your **consent** (the
private-tier sync, optional AI features, and marketing email), to pursue our
**legitimate interests** (security, debugging, preventing abuse), and to meet
**legal obligations**.

---

## Security

We use encrypted connections (TLS) for data in transit and encryption at rest
for stored data, access controls so each account can only reach its own data, and
data minimisation. No system is perfectly secure; as explained above, at-rest
encryption does not defend against every kind of attack, which is why the most
sensitive tier is opt-in and deletable.

---

## Changes to this Policy

We may update this Policy as the app evolves. If we make a material change —
especially one that affects what we collect or how the sensitive tier is handled
— we will update the "Last updated" date and, where appropriate, notify you in
the app. Continued use after an update means you accept the revised Policy.

---

## Contact

Questions, requests, or concerns: **info@reprogrammer.app**
Ashe Ventures Company, Kingdom of Saudi Arabia.
