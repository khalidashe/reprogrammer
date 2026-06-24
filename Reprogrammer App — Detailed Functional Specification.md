# Reprogrammer App — Detailed Functional Specification

## Overview

**Reprogrammer** is a deliberate-practice mobile app (iOS/Android) built on one idea:

> **Don't read the book. Run it.**

Every great self-improvement book contains a *method*, but reading it changes nothing — knowing
isn't doing. Reprogrammer takes a book, distills its method into a **day-by-day deliberate-practice
program**, and hands the user one concrete exercise per day, practiced with **the exact training
instrument that method demands**.

- *Feeling Good* → a structured CBT thought record.
- *Fluent Forever* → a spaced-repetition deck the user builds themselves.
- *Deep Work* → a focus timer + an attention-drift tally.
- *The Artist's Way* → a journaling surface for morning pages.

The app is a **program runner with a toolbox of practice instruments**. The instrument is chosen
*per exercise*, with one designated as the program's primary instrument.

**Tagline:** Don't read the book. Run it.

> The complete product strategy (positioning, competitive analysis, monetization, risks, store copy)
> lives in `PIVOT_PLAN.md`. The phased build plan lives in `~/.claude/plans/steady-dancing-cosmos.md`.
> This document is the functional specification of the app itself.

---

## Core concepts

- **Program** — a book's method as a finite, day-by-day course (e.g. "Deep Work — 21 days").
  Carries a Thesis (what the book claims), a Method (the author's framework as an ordered sequence),
  and the day-by-day exercises. Curated and shipped in the app (ported from the Quiescence vault).
- **Instrument** — the practice surface an exercise is performed with: `checkbox`, `journal`,
  `structured` (a typed form, e.g. CBT/OFNR), `tally`, `timer`, `rating`, or `srs` (spaced
  repetition). All instruments implement one uniform contract.
- **Enrollment** — a user's active run of a program: which day they're on, their daily reminder
  time, status (active / paused / completed / graduated), and progress.
- **Standing exercise** — a recurring daily practice a program installs partway through (e.g. "daily
  SRS review from Day 6", "daily triple column from Day 8") that runs *in addition to* the day's new
  exercise until the program ends.

---

## User flows

### 1. First launch (onboarding) — target ≤60s to a real Day-1 exercise
1. **Hook screen.** "Don't read the book. Run it." → *Choose your first book*.
2. **Account.** One-tap **Sign in with Apple** (a mandatory account wall, per REP-30, satisfied fast).
3. **Pick by outcome** (not by book title): *Focus deeply* (Deep Work) · *Build a keystone habit*
   (Atomic Habits) · *Quiet your inner critic* (Feeling Good) · *Learn a language* (Fluent Forever) ·
   *Reconnect with creativity* (The Artist's Way). Each card shows book · duration · daily minutes ·
   primary-instrument icon.
4. **Program preview.** Thesis (2–3 sentences) + **"Here's your Day 1"** showing the actual first
   exercise and its instrument.
5. **Reminder time.** Pick one daily time (notification-permission primer) → land on **Today** with
   Day 1 ready. Sets `hasOnboarded = true`.

### 2. Today (home)
The daily loop, and the surface the daily reminder deep-links into.
- **Header:** date + a quiet progress line per active program ("Deep Work · Day 7/19 · 6 days
  practiced").
- **Day card (primary):** program chip · day theme · the exercise prompt · estimated minutes · an
  inline instrument affordance (timer → *Start*; tally → `+` stepper; structured → *Open record*;
  checkbox → a check; journal → *Write*). Tap opens the instrument as a focused full-screen session.
- **Standing-exercise card(s):** shown below the day card once activated; visually lighter, labelled
  *ongoing practice* (e.g. "Daily review · 12 cards due").
- **Multi-program (Pro, ≤3):** stacked groups, one per program, ordered by reminder time.
- **Completion:** instruments self-report done where they can (timer hits target; tally/structured
  saved); checkbox/journal get an explicit *Mark done*. Completing writes a day log, advances the
  day, records the practiced date, with a light haptic and a calm check animation.
- **All-done / empty / missed-yesterday** states as in `PIVOT_PLAN.md` §5a.

### 3. Programs (browse + read)
- Browse the catalog by category (The Foundation leads). Each program *is* its own reader:
  Thesis → Method → the day-by-day.
- Program detail gains a **Start program** action → daily reminder-time picker → creates an
  enrollment. Free tier = one active program; additional concurrent programs are Pro.
- SRS deck/card **management** lives here (in the program), not on Today.

### 4. Instruments (the practice surfaces)
Each exercise opens its instrument:
- **checkbox** — mark a rep done (+ optional identity line). *(Absorbs the old behavior-rep model.)*
- **journal** — free-text entry (e.g. morning pages).
- **structured** — a typed form (CBT triple-column, NVC OFNR, three good things); fields may be text
  or numeric (e.g. rate emotional charge 0–100 before/after).
- **tally** — a counter (deep-work drift, "shoulds", interactions initiated).
- **timer** — a focus session with an optional in-session tally (drift catches).
- **rating** — a single numeric value on a scale.
- **srs** — author cards (front/back + optional image), then review a due queue scheduled by FSRS.

### 5. Progression, graduation & forgiveness
- **Completion-based progression, calendar-based streak.** The next card is always the next
  *unfinished* exercise — a missed day loses no content. Adherence counts *calendar days practiced*,
  so the daily rhythm has teeth without shame.
- **Minimum viable day.** Every exercise offers a 2-minute version; doing it still counts as
  practiced.
- **Graduation.** When the last day is completed the program becomes `graduated` and may move to a
  lightweight maintenance track (per-instrument behaviour — e.g. SRS keeps its review queue forever;
  a habit just continues). See `PIVOT_PLAN.md` §8a.

### 6. You (settings + stats)
Account, notification time + quiet hours, Pro status, graduated programs, and skill-gain stats.

---

## Information architecture
Three tabs: **Today** / **Programs** / **You**. (During the migration, the legacy Behaviors tab
remains reachable until it is archived in Phase 4.)

---

## Data model

**Content (static, shipped in the app — extends `LibraryProgram` in `services/library-content.ts`):**
- `Program` `{ id, title, book{author,year}, category, thesis, method[], primaryInstrument,
  durationDays, dailyMinutes, setting (solo|partner|group), tracking[], pairsWith[],
  days: ProgramDay[], standingExercises?: StandingExercise[] }`
- `ProgramDay` `{ day: number | [start,end], week, theme, exercises: Exercise[] }` (supports day
  ranges like "Day 10–12")
- `Exercise` `{ prompt, minutes, instrument: Instrument, instrumentConfig? }`
- `StandingExercise` `{ activatesOnDay, prompt, instrument, instrumentConfig }`

**User data (local Zustand + AsyncStorage, synced to Convex with the per-userId + clientId +
soft-delete + last-write-wins pattern):**
- `programEnrollments` `{ programId, startedAt, currentDay, reminderTime, status, completedDays[],
  practicedDates[], isPrimary }`
- `programDayLogs` `{ enrollmentId, day, completedAt, note? }`
- Instrument captures reuse the existing `entries` + `FocusSession`, re-keyed off `behaviorId` to a
  generic `sourceType` + `sourceId`. **SRS** adds `srsCards` + `srsReviews` (front/back/media, FSRS
  stability/difficulty/due).

## Instrument contract
Every instrument implements one interface so the app is a platform, not seven bespoke screens:
```ts
interface Instrument<Config, Capture> {
  kind: 'checkbox' | 'journal' | 'structured' | 'tally' | 'timer' | 'rating' | 'srs';
  render(ctx): ReactNode;                       // the practice surface
  isComplete(capture): boolean;                 // what counts as done today
  toProgress(capture): ProgressDelta;           // advances the program
  skillSignal?(capture): SkillSignal | null;    // optional growth signal
  reminders?(enrollment, config): ScheduledReminder[]; // e.g. SRS reviews-due
}
```

## Notifications
One **daily practice digest** per user by default ("Your practice today: 3 exercises across 2
programs") at the user's chosen time, plus an SRS reviews-due reminder. Per-program separate
reminders are an opt-in. Quiet hours respected; total pings capped. The legacy randomized
variable-interval ping engine (jitter/anchor/level) is retired.

## Monetization
Free = browse/read the whole catalog + run **one** active program with all instruments. Pro
(RevenueCat) = up to **3** concurrent programs, unlimited custom SRS decks, cross-program skill-gain
analytics, multiple maintenance tracks, early access to new books. See `PIVOT_PLAN.md` §9.

---

## Deprecated model (soft-archived, not removed)

The original product was a **behavior tracker**: users created "adopt"/"eliminate" behaviors, the app
fired randomized pings within a daily window, the user answered Yes/No, and streaks/levels accrued
(tagline *NOTICE · REPEAT · REPROGRAM*). That model is being **soft-archived** — its screens move
under an `archive/` area and its schema fields are marked `@deprecated` rather than dropped, so
existing users' data is preserved and the change is reversible. Its best mechanic (rep tracking) is
*absorbed* into the `checkbox` instrument.
