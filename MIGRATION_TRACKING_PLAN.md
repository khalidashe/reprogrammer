# Reprogrammer Backend Migration — Tracking Scaffolding Plan

**Goal of THIS step:** Build the *tracking + versioning* scaffolding for the Convex → Firebase migration — a dedicated Linear project + label, migration issues, and a GitHub branch/PR/tag strategy — BEFORE any migration code is written. Everything here is reversible and non-destructive.

**Decision status:** Migrate (decided). Code: NOT started.
**Prerequisites (already done):**
- Prereq 1 — Linear backlog reviewed (12 REP-v1 backlog issues read from your real Chrome).
- Prereq 2 — Critical-Mistakes plan exists: `Wiki/Self/Reprogrammer/App Growth/Firebase Migration - Critical Mistakes.md` (186 lines; covers Firestore read-billing, privacy boundary, Coach architecture, don't-rewrite-working-code, auth, data model, AI→Function, verification, DoD §10).

---

## Tools available (load in a FRESH chat)
MCPs load at Hermes startup, so run this plan in a new chat:
- `linear` MCP — 15 tools (createProject, createIssue, updateIssue, getProjects, getIssues, searchIssues, addIssueLabel, …). Reads the key from macOS Keychain via `/Users/vi/.hermes/scripts/linear-mcp-bridge.sh` (no plaintext secret in config).
- `chrome_devtools` MCP — your real Chrome (Linear UI, screenshots).
- `gh` CLI — authed as `khalidashe`, scopes `repo`/`workflow`/`read:org`. Repo: `khalidashe/reprogrammer` (branch `main`).
- Verify first: `hermes mcp list` shows `linear ✓ enabled`; `gh auth status` shows `khalidashe`.

---

## Naming conventions (the "separate versioning" you asked for)

| Layer | Convention |
|---|---|
| **Linear project** | `Firebase Migration (Convex → Firebase)` — under team **REP** (only team available) |
| **Linear label** | `firebase-migration` (lowercase, filterable) |
| **Linear issues** | `FB-1` … `FB-6` (prefix `FB` = Firebase), title format `[Firebase] FB-n: <short desc>` |
| **Prereq issue** | `REP-53` already exists (Convex `_generated` types not committed/gitignored → CI footgun). Do NOT duplicate — link it as a **blocker** on FB-2 |
| **GitHub branch** | `migrate/firebase/<short>` (e.g. `migrate/firebase/fb-2-cloud-sync`) |
| **GitHub PR title** | `[FB-2] cloud-sync → Firestore pull-on-foreground (#REP-53)` |
| **GitHub cutover tag** | `backend-firebase-v1` — applied to `main` only after ALL FB issues merged + verified (this is the backtracking point) |

---

## Execution steps

### Step 1 — Linear label
Create label `firebase-migration` on the REP team (if not already present).

### Step 2 — Linear project
Create project **`Firebase Migration (Convex → Firebase)`** under team REP, status **Active**, with its own milestone. This is the "separate file where we work."

### Step 3 — Migration issues (FB-1 … FB-6)
Create each as an issue in that project, apply the `firebase-migration` label, and set the description to include: scope, the source § from the Critical-Mistakes doc, the GitHub repo + branch it will use, and a link to the Linear issue once created (filled in as we go). Keep them in the project's "Todo" state.

- **FB-1 — Firebase init replaces `convex-client.ts`** (§10 DoD)
  - Swap `new ConvexReactClient(...)` → Firebase `initializeApp` + `getFirestore`; migrate `EXPO_PUBLIC_*` env (add `EXPO_PUBLIC_FIREBASE_*`, keep Cloudflare/Firebase Hosting untouched).
- **FB-2 — `cloud-sync.ts` → Firestore SDK (pull-on-foreground preserved)** (§1, §4, §8)
  - **BLOCKER: REP-53** must merge first. Keep `pullAll()` one-shot `getDocs` on resume + `pushWithRetry` idempotent upsert (`setDoc(..., {merge:true})`). Do NOT switch to always-on `onSnapshot` (would be a cost regression — see §1).
- **FB-3 — `ai.ts` Convex action → Callable Cloud Function** (§7)
  - `onCall` verifies Firebase Auth UID + Pro entitlement (RevenueCat/Firestore) before calling Anthropic. **Downgrade model** from `claude-opus-4-7` (used for a 2–5 word task) to Haiku-class. Gate on the same consent as FB-5.
- **FB-4 — `@convex-dev/auth` → Firebase Auth** (§5)
  - Firebase **UID** becomes `userId` on every doc (replaces Convex `v.id("users")`). `useIsPro.ts` reads entitlement from Firestore/RevenueCat; preserve `isLoading → treat as free` to avoid paywall flash. Preserve "signed-in ≠ Pro" distinction.
- **FB-5 — `convex/` schema → Firestore security rules + Functions** (§2, §6)
  - Subcollections `users/{uid}/{behaviors,checkIns,entries,reminderAttempts,appProfiles,subscriptions}` (recommended over root collections — scopes reads + rules, no composite index). **Rules MUST deny writes** to `entries` + free-text fields (`journal`, `checkIn.note`, `appProfiles.userBio`, `goals`) unless `appProfiles.privacySyncConsent` present (server trust, not just client gate — §2).
- **FB-6 — Docs + sync** (§10 DoD)
  - Update `CLAUDE.md` + `AGENTS.md` backend statement (replace the `<!-- convex-ai-start -->` block) and note **"why Firebase"** (Google-ecosystem consolidation, not cost). Confirm Linear + wiki backlog in sync.

### Step 4 — Confirm before code
Stop and report the created project/label/issues + their URLs. **Do not start migration code yet** — this step is scaffolding only.

### Step 5 — GitHub strategy (applied as code work begins, later sessions)
- Branch from `main`: `migrate/firebase/<short>` per issue (or fork from an `migrate/firebase/epic` integration branch merged last).
- PR per issue, title carries the Linear ref, body links the Linear issue URL.
- Merge via PR only (no direct `main` pushes).
- After all FB merged + verified on Spark with zero unexpected reads: tag `backend-firebase-v1` on `main` = the backtracking point.

### Step 6 — Cleanup (after merge + verification)
Archive (close, do NOT delete) the Linear project. Non-destructive.

---

## Cross-tracking rule (both directions)
- Every Linear issue description holds: GitHub repo + branch + PR link (filled as created).
- Every GitHub PR body holds: the `FB-n` identifier + Linear issue URL.
- Backtracking = `git tag backend-firebase-v1` + ability to reopen/archive the Linear project.

## Do-not-touch guardrails
- Cloudflare (DNS/edge) and Firebase Hosting for the site: **untouched**.
- `REP-53` is a prerequisite fix, not part of the Firebase feature set — merge it first, keep it separate.
- No destructive deletes anywhere in this step.

## Verification checklist (end of scaffolding)
- [ ] `linear` MCP connected (15 tools)
- [ ] Label `firebase-migration` exists on REP
- [ ] Project `Firebase Migration (Convex → Firebase)` exists, Active, under REP
- [ ] FB-1 … FB-6 created in project, labeled, in Todo
- [ ] REP-53 linked as blocker on FB-2
- [ ] Each FB description carries scope + GitHub repo ref
- [ ] User confirmed before any code
