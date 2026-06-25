# Reprogrammer — Pivot build handoff (2026-06-25)

Cold-start notes for the next session. Pairs with the strategy (`PIVOT_PLAN.md`), the approved
executable plan (`~/.claude/plans/steady-dancing-cosmos.md`), and the backlog (`FEATURE_IDEAS.md`).

## Where things are
- **Branch:** `claude/cool-chandrasekhar-d21aee` · **PR:** [#33](https://github.com/khalidashe/reprogrammer/pull/33) (OPEN, not merged) · 15 commits.
- **Separate fix:** `deleteAccount` flaky-test fix on branch `claude/fix-deleteaccount-test-flush` → [PR #34](https://github.com/khalidashe/reprogrammer/pull/34) (off `main`, independent of #33).
- Everything is **additive**: the legacy behavior tracker is untouched and still present. Nothing archived yet.
- All work is committed. Untracked (by design): `ios/` (never commit — CNG), `convex/_generated/` (repo convention), `.env.local` (gitignored secret).

## What works (4 instruments, 4 programs — all demoed on the iOS sim)
The daily loop is real end-to-end: enroll → **Today** day card (theme · "Why this?" · 2-minute option) → instrument surface → **completion-based** advance (`currentDay` only moves on completion; missed days never lose content) → "done for today" with a forgiving `practicedDates` streak.

| Program | Primary instrument | Surface |
|---|---|---|
| Deep Work | `timer` (+ drift tally) | `app/program-session.tsx` |
| Atomic Habits | `checkbox` | inline "Mark done" in Today |
| The Artist's Way | `journal` | `app/program-journal.tsx` |
| Feeling Good | `structured` (CBT) | `app/program-structured.tsx` |

## Key files (the pivot)
- **Types / contract:** `types/index.ts` — `InstrumentKind`, `Exercise`, `ProgramDay` (supports `day: [start,end]` ranges), `StandingExercise`, `ProgramContent`, `ProgramEnrollment`, `ProgramDayLog`, `SkillSignal`, SRS types.
- **Engine (pure, tested):** `services/program-engine.ts` — `enrollablePrograms`, `resolveDay`, `exercisesForDay`, `standingExercisesForDay`, `completeCurrentDay` (idempotent per calendar day), `dayProgressLabel`. Test: `services/__tests__/program-engine.test.ts`.
- **Content:** `services/library-content.ts` (`LibraryProgram.program?: ProgramContent`) + `services/content/programs.ts` (the 4 ported programs carry a `program: {...}`; ~37 others are read-only until ported).
- **Store (local-only):** `store/useStore.ts` — `programEnrollments` / `programDayLogs` CRUD + selectors. **Not yet synced to Convex.**
- **Today screen:** `app/(tabs)/today.tsx` — empty-state picker, day card, `runExercise`/`actionLabel` dispatch, enroll, 2-minute option.
- **Notifications:** `services/notifications.ts` → `scheduleDailyDigest()` (daily reminder, `data.deepLink:'today'`); routed in `app/_layout.tsx`.
- **Dev bypass:** `services/dev-flags.ts` → `DEV_SKIP_AUTH` (double-gated: `__DEV__` + `EXPO_PUBLIC_DEV_SKIP_AUTH=1` in `.env.local`). Skips onboarding/sign-in so local builds land in the tabs.

## How to run & demo (this is the proven path)
- **Canonical sim:** iPhone 15 Pro · iOS 17.2 · UDID `982D6F8B-47DB-408F-976D-85B9A96982BA` (has a debug build that loads JS from Metro). See memory `tooling-ios-simulator`.
- **No rebuild needed for JS changes.** Run Metro in **watch mode** (NOT `CI=1` — CI mode disables file watching and serves stale bundles, which bit us repeatedly):
  ```
  npx expo start -c --port 8081      # -c clears cache; run from the worktree
  xcrun simctl boot 982D6F8B-47DB-408F-976D-85B9A96982BA ; open -a Simulator
  xcrun simctl launch 982D6F8B-47DB-408F-976D-85B9A96982BA com.reprogrammer.app
  xcrun simctl io 982D6F8B-47DB-408F-976D-85B9A96982BA screenshot /tmp/x.png
  ```
- **Taps:** patched idb at `~/Library/Python/3.14/bin/idb` → `idb ui tap --udid <udid> X Y`, `idb ui describe-all` (find element frames; tap the frame **center**), `idb ui text` (NB: no em-dash `—`, it errors). The **Today tab** is at ~`(49, 793)`; relaunch lands on the legacy Dashboard, so tap Today.
- A fresh build is also available (`pod install` is done in `ios/`): `xcodebuild -workspace ios/Reprogrammer.xcworkspace -scheme Reprogrammer -sdk iphonesimulator -destination 'id=982D6F8B-…' -derivedDataPath ios/build build` then `simctl install`.

## Gotchas learned this session
1. **Metro CI mode = stale bundles.** Use watch mode (`npx expo start`, no `CI=1`); restart with `-c` if a change doesn't show.
2. **`IconSymbol` only accepts names in its `MAPPING`** (`components/ui/icon-symbol.tsx`) and renders MaterialIcons on **all** platforms. Add a mapping entry for any new icon, or it renders blank.
3. **Today-as-default-tab** can't be done with `unstable_settings.initialRouteName` — expo-router's `index.tsx` convention wins. It's the real IA collapse (Phase 4: archive the legacy Dashboard `index`, make `today` the index).
4. **Completion is one-per-calendar-day** (by design), so you can't advance multiple days in one sim session. To demo a *later* day (e.g. a structured/SRS day), edit `currentDay` in the sim's AsyncStorage manifest while the app is terminated: `…/Data/Application/<id>/Library/Application Support/com.reprogrammer.app/RCTAsyncLocalStorage_V1/manifest.json` (key `rpg.programEnrollments.v1`).
5. **The dev bypass skips onboarding's notification-permission prompt**, so the daily digest won't *display* on the sim (iOS suppresses it). The scheduling + deep-link are code-verified; real users grant permission in onboarding.
6. Instrument captures (journal/structured text) currently save to `ProgramDayLog.note` (serialized). Proper typed capture via `entries` needs the `behaviorId` → `sourceType/sourceId` re-keying (deferred; see `types/index.ts` `CaptureSource` + `PIVOT_PLAN.md` §10a.7).

## What's next (priority order)
1. **`srs` instrument + Fluent Forever** — the last, heaviest instrument: card-authoring UI (front/back/image) + FSRS review queue (`services/fsrs.ts` exists) + reviews-due reminder + `srsCards`/`srsReviews` tables. The marquee remaining piece.
2. **Proper `tally` / `rating` surfaces** (they currently fall through to "Mark done").
3. **Convex sync** for `programEnrollments`/`programDayLogs` (+ srs tables) — closes Phase 1. Mirror `convex/behaviors.ts`; wire `services/cloud-sync.ts` + `sync-merge.ts`. Add tables to `convex/schema.ts`.
4. **Programs tab** — browse/read the catalog + Start from detail (enroll is currently only from Today's empty state). Reuse `app/(tabs)/library.tsx` + `components/library/*`.
5. **Phase 4 — archive** adopt/eliminate (app screens → `archive/`, `@deprecated` schema, reframe `onboarding.tsx`, re-point `coach.ts`/`weekly-review.ts`); **vault** moves too.
6. **Phase 5 — graduation/maintenance** (per-instrument, `PIVOT_PLAN.md` §8a), **skill-gain** rendering (`SkillSignal` sparkline), replace behavior-model tests, store copy.
7. **Numeric fields** in structured templates (0–100 CBT charge) — `PIVOT_PLAN.md` §10a.6.

## Verify
- `npm test` (tsx service suite — 18 pass incl. `program-engine`) · `npm run test:convex` (vitest; needs `.env.local` + `npx convex codegen`, Node 22). Note: `npx tsc --noEmit` has **pre-existing** test-fixture errors (missing `updatedAt`) unrelated to this work — clean them when reworking tests in Phase 5.

## Loose ends to be aware of
- A self-paced "feature-planning" `/loop` (`ScheduleWakeup`) was armed earlier and never re-armed after we switched to building; it dies with the session. Don't be surprised by a stray wakeup.
- A background **Metro** (watch mode) may still be running on `:8081` from this session.
- The sim's Feeling Good enrollment was hacked to `currentDay: 4` for a demo — reset app data (`simctl uninstall`/`install` from `/tmp/Reprogrammer.app`) for a clean state.
