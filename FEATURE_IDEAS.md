# Reprogrammer — Feature ideas to improve the app

> Self-paced `/loop` backlog for the book-programs app. Complements `HANDOFF.md` (state + next
> steps), `PIVOT_PLAN.md` (strategy), and the executable plan. Scored by **Impact (1–5) × Effort
> (S/M/L)**; ranked best-value-first within each tier. See the Iteration log.

## Shipped this session (was on this list — now done)
- ✅ **"Why this?" context** on each day card (`9d853ea`).
- ✅ **2-minute minimum viable day** on every exercise (`db5b27d`).
- ✅ **Daily reminder digest** → deep-links to Today (`40d8205`).
- ✅ **journal / structured(CBT) / checkbox** instrument surfaces + **multi-program** (Atomic Habits,
  The Artist's Way, Feeling Good) (`2c1bc24`, `2c408f1`, `b411201`).
- ✅ **Done-state previews tomorrow** ("Tomorrow · <theme>") + day theme on the card (`9d853ea`).
- ◐ **Enroll-from-empty** works (basic list); the *outcome-framed* picker is still open (see N3).

---

## NOW — highest value, do next
- **N1. SRS instrument + Fluent Forever.** Card authoring (front/back/image) + FSRS review queue
  (`services/fsrs.ts`) + reviews-due reminder + `srsCards`/`srsReviews` tables. The last + most
  distinctive instrument; unlocks Fluent Forever, Make It Stick, Ultralearning. *[I=5, E=L]*
- **N2. Convex sync for enrollments/day-logs** (+ srs tables) — closes Phase 1; cross-device + the
  pivot's data isn't durable without it. Mirror `convex/behaviors.ts`; wire `cloud-sync.ts` +
  `sync-merge.ts`. *[I=4, E=M]*
- **N3. First-run aha onboarding (PIVOT_PLAN §5).** Outcome-framed picker ("What do you want to
  change?" → Focus deeply/Build a habit/Quiet your inner critic/…) → Day-1 preview → reminder time,
  one-tap Apple sign-in, ≤60s to a real exercise. Biggest first-impression lever; now meaningful with
  4 programs. *[I=5, E=M]*

## NEXT — strong value, after the above
- **X1. Skill-gain surfacing (PIVOT_PLAN §7).** Implement `SkillSignal` emit on instruments
  (`toProgress`/`skillSignal`): SRS retention ↑, deep-minutes ↑ & drift-tally ↓ (Deep Work),
  should-count ↓ & avg charge ↓ (Feeling Good). Render a sparkline + a plain-language sentence
  ("focus sessions 40% longer than week 1"). The differentiator a summary app can't match. *[I=4, E=M]*
- **X2. Adherence strip / calendar.** A gentle heatmap of `practicedDates` + "N days practiced"; never
  a red break. Visible momentum without shame. *[I=4, E=M]*
- **X3. Proper `tally` + `rating` surfaces.** Today they fall through to "Mark done"; build the +/–
  counter (reuse the timer's drift-tally UI) and a 0–100 slider. Also lets Feeling Good capture the
  before/after charge (needs numeric template fields — L2). *[I=3, E=M]*
- **X4. Programs tab + reader.** Browse the catalog, read Thesis/Method/day-by-day, **Start** from
  detail (enroll is currently only from Today's empty state). Reuse `library.tsx` + `components/
  library/*`. Discovery + reader-as-product. *[I=3, E=M]*
- **X5. Graduation / maintenance (PIVOT_PLAN §8a).** On the final day, a "the method is yours" moment
  + per-instrument maintenance (SRS keeps its queue; a habit just continues) + suggest a `pairsWith`
  program. Closes the arc / sets up the next enroll. *[I=3, E=M]*

## LATER — real but lower leverage / pre-ship
- **L1. Phase 4 archive** of adopt/eliminate (screens → `archive/`, `@deprecated` schema, reframe
  `onboarding.tsx`, re-point `coach.ts`/`weekly-review.ts`; vault moves too). Also the IA collapse so
  **Today is the home** (make `today` the index, retire the legacy Dashboard — `unstable_settings`
  won't do it). *[I=3, E=M]*
- **L2. Numeric fields in structured templates** (0–100 charge before/after) — `CaptureTemplateField`
  is text-only today (`PIVOT_PLAN.md` §10a.6). Needed for Feeling Good's core metric. *[I=3, E=S]*
- **L3. Real Apple Sign-In onboarding** to replace the `DEV_SKIP_AUTH` bypass before any TestFlight.
  Also unblocks the notification-permission prime (the bypass suppresses it). *[I=3, E=M]*
- **L4. Completion note / one-line reflection** when finishing a day (we already persist
  `ProgramDayLog.note`). *[I=2, E=S]*
- **L5. Accessibility pass** — Dynamic Type + full VoiceOver labels on Today/instruments. *[I=3, E=S]*
- **L6. Home-screen widget** — today's exercise + a "start" deep link. *[I=3, E=L]*

## Timer-instrument polish (the surface users sit in daily)
- **T1. Drift-tally affordance** — bigger tap zone, haptic, quick undo (`app/program-session.tsx`
  already has the tap + affirmation; add undo + larger target). *[I=2, E=S]*
- **T2. Target progress ring + gentle chime** at the target minute (the screen already computes
  `targetReached` but only changes the timer color — add a ring + a soft, non-alarming chime). *[I=2, E=S]*
- **T3. Background-safe timer** (survive backgrounding/lock; recompute elapsed from `startedAt`). *[I=3, E=M]*
- **T4. Live Activity / Dynamic Island** for the running session — premium, present without
  unlocking. *[I=2, E=L native]*

---

## Cross-cutting bets
- **"One thing today" calm.** When the day is done the screen should feel *finished*, not beg for
  more taps. The done-state already previews tomorrow — keep resisting the urge to add streak-bait.
- **Forgiveness as a designed moment.** Make "you missed yesterday — pick up where you left off"
  visible and kind (we have completion-based progression + `practicedDates`; surface the recovery,
  never a reset-to-zero).
- **No empty-deck walls.** For SRS, ship a few starter cards per language so the first review isn't a
  blank deck (then the user authors their own — faithful to Fluent Forever's method).
- **Demo-ability is a feature of the build, not the app.** Keep instrument surfaces reachable by
  deep-link + keep `DEV_SKIP_AUTH` so any day/instrument can be screenshotted without waiting calendar
  days (this session's friction — see `HANDOFF.md`).

---

## Iteration log
- **v1 (2026-06-25):** First backlog, P0–P4 by theme, why + rough effort, three cross-cutting bets.
- **v2 (2026-06-25):** Reconciled with what actually shipped this session (moved Why-this, 2-minute,
  reminder, journal/structured/checkbox + multi-program, done-preview into a **Shipped** section);
  re-tiered the remainder into **Now / Next / Later** with **Impact×Effort** scores and ranked
  best-value-first; folded in **PIVOT_PLAN §5** (first-run aha onboarding, graduation/maintenance,
  forgiveness) and **§7** (SkillSignal skill-gain surfacing); added concrete UX details surfaced by
  the build (drift-tally undo, target ring+chime, background-safe timer, the Today-as-home IA-collapse
  caveat, numeric CBT fields, the empty-SRS-deck and deep-link/demo bets). **Converged** — the backlog
  now reflects reality and is scored/ranked; further passes would be cosmetic, and the real remaining
  work is *building* (tracked here + in HANDOFF.md), not re-listing. Loop stopped.
