# Reprogrammer — Pivot to Book Programs

> **Working artifact for the `/loop` refinement.** Goal: converge on *the ultimate prompt* —
> a complete, stark, unique articulation of the app before we build. Each loop iteration
> sharpens this file. See the **Iteration log** at the bottom for what changed and why.

---

## 0. The stark idea (lead with this)

**Don't read the book. Run it.**

Every great self-improvement book contains a *method* — but reading it changes nothing, because
knowing isn't doing. Reprogrammer takes a book, distills its method into a **day-by-day
deliberate-practice program**, and hands you one concrete exercise per day, practiced with **the
exact training instrument that method demands**.

- *Feeling Good* hands you a structured CBT thought record.
- *Fluent Forever* hands you a spaced-repetition deck you build yourself.
- *Deep Work* hands you a focus timer and a distraction tally.
- *The Artist's Way* hands you a journaling surface for morning pages.

> **One-liner (tight):** *Reprogrammer turns a book's method into a daily practice — one concrete
> exercise a day, with the exact tool that method demands.*
>
> **Tagline:** *Don't read the book. Run it.*
>
> **Internal analogy:** *Duolingo for the method of any book* — a daily streak of small, correct
> reps, where the practice surface changes to fit what you're training.

**Why this is unique / defensible.** Everyone else summarizes books (Blinkist, Shortform, Headway —
passive consumption) or tracks generic habits (every habit app). Nobody runs a **polymorphic
practice engine** that adapts the practice *modality* to the book's *method*. The instrument toolbox
is the moat; the curated, instrument-tagged program catalog is the inventory. (Competitive detail in
§1.5.)

**The name still fits.** You *reprogram* yourself by running the book's program. Keep "Reprogrammer."

---

## 1. Why we're changing (the honest version)

Reprogrammer today is a **behavior tracker**: create an "adopt"/"eliminate" behavior, the app fires
randomized pings in a window, you answer Yes/No, streaks/levels accrue. It's a generic habit app in
a crowded category with no wedge. The pivot gives it a wedge: **books as programs, methods as
practice, the right instrument per exercise.**

**Decisions locked with Khalid:**
1. **Curated catalog, ported from the vault** — not runtime AI generation. Build a **scalable,
   instrument-tagged template** because more books are coming. AI "generate from any book" is a
   later phase (see §4, the authoring engine).
2. **Each book gets the instrument its method demands.** The app becomes a *program runner with a
   toolbox of practice instruments*; instrument is chosen **per exercise**, one designated primary.
3. **Soft-archive** adopt/eliminate in all three places (app · GitHub · vault). Nothing deleted —
   moved aside, deprecated, reversible. **But** its tracking machinery is *absorbed*, not discarded
   (see §8).

**Reconcile the thesis (resolves an internal contradiction).** The earlier thesis said the app
"elicits the actionable program," which sounds like runtime AI; decision #1 says curated. Correct
framing: **the *authoring pipeline* (offline, founder + AI-assisted in content-studio) elicits the
program from the book; the *app* delivers and coaches it.** Elicitation is a build-time activity,
not a runtime one — for now.

---

## 1.5 Competitive landscape (where we win, where we're squeezed)

| Competitor | What it is | Where Reprogrammer wins | Where we're squeezed |
|---|---|---|---|
| **Blinkist** | 15-min book summaries (text/audio) | They tell you what the book *says*; we make you able to *do* it. Practice + measurable change. | Catalog size + brand. We can't win on breadth. |
| **Headway** | Gamified microlearning + "insight" cards, light challenges | Real method-specific instruments + a true daily program, not insight cards + generic nudges. | Marketing spend, gamification polish. |
| **Shortform** | Detailed book guides *with* exercises | Mobile-native daily *runner* with real instruments + measurement — their exercises are text worksheets in a reading product. | Closest overlap on "exercises from books"; deeper catalog + web reading experience. |
| **Fabulous** | Coached daily wellness "journeys"/routines | Our journeys are the *actual method of a named book*, with book-specific instruments — not generic wellness routines. | Mature coached-journey UX + onboarding funnel. |
| **Anki / SRS apps** | Spaced repetition only | We embed SRS as *one* instrument inside a coached program; they're a bare tool with no method. | Power-user depth for pure flashcards. |
| **Atoms (James Clear)** | Habit app for Atomic Habits' method (our design north-star) | We cover *many* books' methods, each with its own instrument; Atoms is one book, one mechanic. | Direct competitor for the Atomic Habits program specifically; strong brand. |
| **Duolingo** | Daily practice w/ the right instrument — for languages | Same *shape*, generalized to any book's method (the analogy, not a competitor). | The bar for daily-practice UX polish they set. |

**Threat model.** An incumbent (Blinkist/Headway) could bolt on "practice." Our moat is the
**instrument engine + curated instrument-tagged catalog + measurable skill-gain**, plus an indie,
calm, *forgiving* mental-health positioning (Atoms aesthetic, no streak-shame) that grindy
gamified incumbents structurally won't copy. We compete on **depth-of-practice-per-book and proof of
change**, never on catalog breadth.

---

## 2. Grounding facts (verified against repo + vault this session)

These correct wrong assumptions in the original plan:

- ✅ **Day-by-day programs ALREADY EXIST in the vault**, for *all* programs (day counts 12–26;
  Deep Work 19, Feeling Good 21, Fluent Forever 23, The Artist's Way 26, etc.). Exercises are
  concrete (Deep Work Day 5: "Run the ritual, 45 minutes. Compare today's drift tally to Day 2").
  So Phase 1 is **transcription + instrument-tagging**, *not* authoring. Big de-risk.
- ✅ The only structural gap in the source content is each day is tagged `Behavior:`, not
  `Instrument:`. Phase 0 template upgrade = replace `Behavior:` → `Instrument:` (+ optional config).
- ✅ `services/content/programs.ts` already carries the 17 programs with `book`, `category`,
  `thesis`, `method`, rich markdown `body` — but every `body` ends "train them on your **dashboard**"
  (old model). That coupling string is the cleanup tell.
- ✅ **Verified in code:** `services/capture-templates.ts` `cbt` template = `situation · thought ·
  distortion · response` (compatible with Feeling Good's triple-column). The `metric` CaptureType
  stores numbers (`CaptureEntry.value: number`) → the standalone `rating` instrument works as-is.
  **BUT** `CaptureTemplateField` is text-only (`key,label,placeholder?,multiline?`) and
  `CaptureEntry.fields` is `Record<string,string>` — so a 0–100 charge *inside* a structured record
  is **not** supported yet (see §10a.6). And all captures are keyed by `behaviorId` — they must be
  re-keyed to enrollment/exercise (see §10a.7).
- ✅ Current tabs: `index`, `library`, `states`. (Pivot collapses these — see §6.)
- ⚠️ **SRS reality check (effort-critical):** Fluent Forever's method *requires the user to author
  their own cards* (Day 3: "Create your first 10 Anki cards"; Day 8: image cards, no translations).
  So the `srs` instrument is a **card-authoring tool + FSRS review queue**, not a pre-made deck.
  Heaviest build → stays *out* of the vertical slice. Upside: reused by Make It Stick, Ultralearning,
  Learn Anything Faster — broad payoff.
- ⚠️ Fresh worktrees need Convex `_generated` stubs to bundle and Node 22 for codegen (per memory).
  REP-30 added a **mandatory account wall** — tension with aha-first onboarding (see §5).

---

## 3. The core primitive: the Instrument contract (this is the architecture, not a detail)

The unique idea only becomes a *platform* if "instrument" is a first-class, uniform contract — not
seven bespoke screens. Define one interface every instrument implements:

```ts
interface Instrument<Config, Capture> {
  kind: 'checkbox' | 'journal' | 'structured' | 'tally' | 'timer' | 'rating' | 'srs';
  render(ctx: ExerciseContext<Config>): ReactNode;     // the practice surface
  isComplete(capture: Capture): boolean;               // what counts as "done today"
  toProgress(capture: Capture): ProgressDelta;         // advances the program
  skillSignal?(capture: Capture): SkillSignal | null;  // optional growth signal (§7)
  reminders?(enrollment, config): ScheduledReminder[]; // e.g. SRS adds a "reviews due" ping
}
```

Adding a future instrument (a *recording* instrument for Public Speaking; a *photo* instrument) is
then a contained, additive change. **This is the headline engineering decision, not a buried union.**
Every existing piece maps to one instrument:

| Instrument   | Built from (reuse)                                  | First book that needs it |
|--------------|----------------------------------------------------|--------------------------|
| `checkbox`   | absorbed behavior-rep tracking (§8)                | Atomic Habits / Tiny Habits |
| `journal`    | `entries` + `reflection` CaptureSpec               | The Artist's Way         |
| `structured` | `CAPTURE_TEMPLATES` (cbt/ofnr/three_good_things)   | Feeling Good, NVC        |
| `tally`      | `entries` + `counter` CaptureSpec                  | Deep Work, How to Win Friends |
| `timer`      | `FocusSession` (Pull Mode, `services/focus.ts`)    | Deep Work                |
| `rating`     | `entries` + `metric` CaptureSpec                   | Feeling Good (0–100 charge) |
| `srs`        | `services/fsrs.ts` + `levels.ts` (revive) **+ new card-authoring UI** | Fluent Forever, Make It Stick, Ultralearning |

**The only genuinely new build is `srs` (card authoring + review queue).** Everything else is wiring
existing surfaces to the contract.

---

## 4. The strategic engine: the authoring pipeline (the real moat over time)

"More books are coming" is the scaling axis. The defensible asset is the **book → program**
conversion capability, which lives in **content-studio**, not the app:

```
book / method notes
  → extract the method as an ordered sequence (the book's own framework)
  → generate day-by-day exercises (specific, concrete, "no follow-up question needed")
  → assign an instrument + config per exercise (and any standing exercises, §10a)
  → human review (founder) against the vault writing rules
  → emit the typed Program object → ships in app catalog
```

Phase-now: **manual, vault-first** (17 programs already exist). Phase-later: AI-assisted in
content-studio, human as editor. Naming the engine clarifies *why* the rigid template and the
`Instrument` contract matter — they're the interface between a content pipeline and a runtime. This
is where the content-studio repo finally earns its keep.

---

## 5. The experience: aha moments and the emotional arc

A stark product needs designed moments, not just mechanics:

- **First-run aha — concrete screen spec (target ≤60s to a real Day-1 exercise):**
  1. **Hook** — full-bleed dark (Atoms aesthetic). "Don't read the book. Run it." Sub: "Pick a
     method. Practice 10 minutes a day. Become someone who's done it." CTA: *Choose your first book*.
  2. **Account** — one-tap **Sign in with Apple** (satisfies REP-30's mandatory wall in ~5s without
     breaking the aha; see tension note below).
  3. **Pick by outcome** (not by book title — outcome framing converts better): cards →
     *Focus deeply* (Deep Work) · *Build a keystone habit* (Atomic Habits) · *Quiet your inner
     critic* (Feeling Good) · *Learn a language* (Fluent Forever) · *Reconnect with creativity*
     (The Artist's Way). Each card shows book · duration · daily minutes · primary-instrument icon.
  4. **Program preview** — Thesis (2–3 sentences) + **"Here's your Day 1"** showing the *actual*
     first exercise + its instrument. This is the proof it's not a summary or a tracker.
  5. **Reminder time** — pick one daily time (notification-permission primer here) → land on
     **Today**, Day-1 card ready; optionally auto-open the instrument to force the aha.
  - **Tension (decide):** REP-30 made the account a *mandatory wall*. Putting one-tap Apple sign-in
    at step 2 preserves that decision while keeping the aha within ~60s. Alternative = allow a
    local-only "try Day 1" before the wall, which reopens a settled decision. **Recommend: keep the
    wall, make it one tap.**
- **Daily loop.** Today surfaces *one* card per active program (+ "reviews due" for SRS). Tap →
  instrument opens → do it → mark done → day advances. Calm, singular.
- **Progression is completion-based; the streak is calendar-based.** The next card is always your
  next *unfinished* exercise — miss a day and you lose nothing, you just resume (no skipped content,
  no "you're behind"). Adherence counts *calendar days practiced*, so daily rhythm keeps teeth
  without shame. Resolves the forgiveness principle concretely.
- **Minimum viable day.** Short on time? Every exercise offers a 2-minute version (Atomic Habits'
  Two-Minute Rule, applied to the app itself) — the tiny version still counts as practiced. The
  single highest-leverage retention lever against the Day-3 cliff (§15).
- **Completion / graduation.** Finishing Day N graduates the program into **maintenance mode** ("the
  method is yours now" — SRS keeps surfacing due reviews; Deep Work keeps the timer, drops the daily
  script), then suggests the next *paired* book (the vault already encodes "pairs well with").
- **Forgiveness, not punishment.** A missed day does **not** reset progress to zero. Adherence shows
  as "days practiced," recoverable; the relapse-and-restart guide (already in the catalog) is one tap
  away. Deliberate counter-position to streak-shame habit apps; fits the mental-health framing.

---

## 5a. The Today screen (concrete)

The home, and the surface the daily reminder deep-links into.

- **Header:** date + a quiet progress line per active program ("Deep Work · Day 7/19 · 6 days
  practiced").
- **Day card (primary):** program chip · day theme · the exercise prompt (verbatim from content) ·
  estimated minutes · an instrument affordance inline (timer → big *Start*; tally → a `+` stepper;
  structured → *Open thought record*; checkbox → a check; journal → *Write*). Tap opens the
  instrument as a focused full-screen session, not inline clutter.
- **Standing-exercise card(s):** shown *below* the day card once activated (§10a.1) — e.g. "Daily
  review · 12 cards due" (SRS) or "Daily triple column". Visually lighter, labelled *ongoing
  practice* to distinguish from the day's new work.
- **Multi-program (Pro, ≤3):** stacked groups, each program = header + its day card + standing
  cards, ordered by reminder time. The single-program case (the norm) stays clean.
- **Completion:** instruments self-report done where they can (timer hits target; tally/structured
  saved); checkbox/journal get an explicit *Mark done*. Completing writes a `programDayLog` + any
  captures, optimistic UI, a light haptic, and a *calm* check animation (no confetti spam — Atoms).
- **All-done state:** when everything today is checked → "Done for today" + a small preview of
  tomorrow. Reinforces *one thing, finish, rest*.
- **Empty state (no enrollment):** warm — "You're not running a program yet" + *Browse programs* and
  a one-tap *Start Deep Work*. Rare after onboarding.
- **Missed yesterday:** today still shows your next unfinished exercise (completion-based, §5); a
  gentle one-liner ("picking up where you left off"), never a red streak-break.

---

## 6. Focus philosophy & information architecture

**One thing at a time.** Deliberate practice means depth, not a dashboard of parallel programs. Make
focus a feature: **one active "primary" program** is the default; concurrency is a deliberate, capped
choice (a Pro lever, §9). This *reinforces the product* (Deep Work, Atomic Habits both preach focus)
instead of fighting it.

**IA — 3 tabs:**
- **Today** — the daily loop / home. Exercise card(s) + "reviews due" if SRS.
- **Programs** — browse the catalog (repurposed `library.tsx`); each program *is* its own reader
  (Thesis → Method → day-by-day). Detail gains **Start program** → reminder time → enrollment.
  Reading-only Library folds in (every program is a readable guide).
- **You** — settings, stats, graduated programs, Pro.

*(Open: keep a separate reading "Library" tab distinct from enrollable "Programs"? Default = folded.)*

**SRS deck/card *management* lives in the program (Programs tab), not Today** — Today is for *doing*
(reviewing); the program is for *building* the deck. **Verdict on 3 tabs: they survive v1.** Today
stays uncluttered via group-by-program + collapse-completed + the reminder *digest* (§10);
instruments open as full-screen sessions. Add a dedicated *Review/Practice* tab only later if usage
shows SRS-heavy users want faster access — don't pre-build it.

---

## 7. North-star metric: skill gain, not adherence

Streaks measure *showing up*. Deliberate practice should measure *getting better*. Each instrument
emits an optional **`SkillSignal`** — a uniform *container*, not a single normalized score (faking a
cross-domain number would be dishonest):

```ts
type SkillSignal = { metricKey: string; label: string; value: number;
                     unit: string; direction: 'up' | 'down'; at: number };
```

- `srs` → retention % / mature-card count (`direction: 'up'`).
- `timer`+`tally` (Deep Work) → deep-minutes ↑, drift-tally ↓.
- `rating` (Feeling Good) → average emotional "charge" ↓.
- `tally` (How to Win Friends) → interactions initiated ↑.
- `journal` (The Artist's Way) → *no* skill signal (deliberately — some practice isn't scored).

The app stores a time series of `SkillSignal`s per enrollment and renders a sparkline + plain-
language summary ("Your focus sessions are 40% longer than week 1"). **The unified thing is the
shape and rendering, not one number.** Adherence ("days practiced") stays as the gentle base metric;
skill-gain is the headline where data exists. This is the deepest differentiator — a summary app
structurally *cannot* show you that you changed.

---

## 8. The behavior model isn't dead — it's absorbed

Adopt/eliminate behavior *tracking* (rep counting, never-miss-twice, relapse handling) is **exactly
the `checkbox`/habit instrument** Atomic Habits and Tiny Habits need. So:

- **Absorb** the behavior-rep engine into the `checkbox` instrument (its best ideas live on inside a
  program).
- **Archive** the *standalone* adopt/eliminate UX (Behaviors tab, create/manage screens, the
  randomized jitter ping scheduler, the 4-template onboarding) — soft, reversible, `@deprecated`.

Less wasteful, gives existing users continuity, and tells a cleaner story than "we threw out the old
app." The randomized variable-interval ping engine *is* retired (replaced by the daily digest, §10).

---

## 8a. Graduation & maintenance (per instrument)

On `currentDay > durationDays` the enrollment becomes `graduated`. The app asks *"Keep practicing?"*
and, if yes, moves it to a lightweight **maintenance track**: scripted days stop, the tool stays,
relevant standing exercises/reminders persist, SkillSignals keep recording. What "maintenance" means
is instrument-specific:

| Instrument | Maintenance behaviour |
|---|---|
| `srs` | **Keep the review queue forever** + daily reviews-due reminder. (The whole point of SRS — strongest maintenance case.) |
| `checkbox` (habit) | The habit simply *continues* as a tracked habit — graduation literally = "it's a habit now" (the absorbed behavior model, §8). |
| `timer` (Deep Work) | Keep the timer + an optional daily-ritual reminder; drop the scripted exercises. |
| `tally` | Optional ongoing count (opt-in), else stop. |
| `structured` (CBT/OFNR) | Form stays available on demand ("open a thought record anytime"); gentle weekly nudge, no forced daily. |
| `rating` | Stop unless embedded in a structured record that continues. |
| `journal` (morning pages) | Offer to continue as an open-ended daily journal (no scaffolding), opt-in. |

Free = **1** maintenance track; Pro = multiple (ties to §9).

---

## 9. Monetization (numeric)

| Capability | Free | Pro (RevenueCat) |
|---|---|---|
| Browse + read entire catalog | ✅ (content = marketing) | ✅ |
| Active programs at once | **1** | **up to 3** (focus-honoring cap, not "unlimited") |
| Instruments within a program | all | all |
| Custom SRS decks (cards usable outside a program) | ✗ (program cards only) | ✅ unlimited |
| Skill-gain dashboard + history | active program, **30 days** | **cross-program, unlimited** |
| Maintenance/graduated tracks | 1 | multiple |
| Early access to new books | — | ✅ |

**Why concurrency is the lever (and why it's capped at 3, not unlimited):** the focus philosophy
(§6) says one-at-a-time is *healthy*; Pro's 3 is framed as "stack a complementary method once you've
graduated one," not "run ten at once." Free is genuinely useful (one full program, all instruments).
*Price: use the existing RevenueCat Pro price — do not invent one here.*
*(Alternative lever if Khalid prefers: gate the enrollable catalog instead of concurrency. Noted, not recommended — concurrency keeps the free tier honest while protecting the inventory moat via analytics + custom SRS.)*

---

## 10. The new domain model

**Content (static, shipped in app):**
- `Program` — `{ id, title, book{author,year}, category, thesis, method[], primaryInstrument,
  durationDays, dailyMinutes, setting, tracking[], pairsWith[], days: ProgramDay[],
  standingExercises?: StandingExercise[] }`
- `ProgramDay` — `{ day: number | [start, end], week, theme, exercises: Exercise[] }`  ← supports
  day ranges ("Day 10–12")
- `Exercise` — `{ prompt, minutes, instrument: Instrument, instrumentConfig? }`
- `StandingExercise` — `{ activatesOnDay, prompt, instrument, instrumentConfig }`  ← recurring daily
  practice layered under the day's unique exercise (e.g. "daily SRS review from Day 6", "daily triple
  column from Day 8")
- `Instrument` (union) — `checkbox | journal | structured(templateId) | tally | timer | rating | srs`
- `SkillSignal` — see §7.

**User data (local + Convex sync; existing per-userId + clientId + soft-delete + LWW pattern):**
- `programEnrollments` — `{ programId, startedAt, currentDay, reminderTime, status
  (active|paused|completed|graduated), completedDays[], isPrimary }`
- `programDayLogs` — `{ enrollmentId, day, completedAt, note? }`
- Instrument captures reuse `entries`; **SRS** adds `srsCards` + `srsReviews` (front/back/media,
  FSRS stability/difficulty/due — math in `fsrs.ts`).

**Engine shift:** randomized variable-interval pings → **one daily practice *digest* by default**
("Your practice today: 3 exercises across 2 programs") at the user's time, with per-program separate
reminders as an opt-in. SRS reviews-due folds into the digest unless the user splits it out. Respect
quiet hours; cap total pings. Jitter/anchor/level scheduler archived. (Avoids the notification-fatigue
failure mode, §15.)

---

## 10a. Domain-model refinements forced by the real content (v2 — high value)

Caught by reading the actual vault programs; the original plan would have hit these as surprises:

1. **Standing/recurring exercises.** Many programs install a *daily* practice partway through that
   then runs every remaining day *in addition to* the day's new exercise — Fluent Forever "SRS review
   from now on, first thing" (Day 6+), Feeling Good "daily triple column" (Day 8+). Modeled as
   `Program.standingExercises[]` with `activatesOnDay`. **Today must render day-exercise(s) +
   active standing exercise(s).**
2. **Day ranges.** Content uses "Day 10–12", "Day 15–18", "Day 25–26" — same exercise repeated across
   a span. `ProgramDay.day` accepts `number | [start, end]`. Enrollment advance treats the range as
   N days of the same card.
3. **SRS = authoring, not delivery.** Cards are *user-created* as exercises (faithful to the method).
   The instrument needs a card-creation surface (front/back, optional image), deck management, and
   the FSRS review queue. This is the single biggest build and the reason SRS is excluded from the
   vertical slice.
4. **Structured templates need numeric fields.** Feeling Good's CBT is *triple-column* with a 0–100
   emotional-charge rating *before and after* — i.e. `rating` is often a **field inside** a structured
   capture, not always a standalone instrument. `instrumentConfig`/templates must support numeric
   fields, and `structured` should be able to emit a `SkillSignal` from a numeric field.
5. **Verify the existing `cbt` capture template** matches the triple-column shape before reusing it;
   may need a Feeling-Good-specific variant. *(Done v3: shape compatible; numeric fields missing — 6.)*
6. **Numeric fields in structured templates — confirmed missing in code.** `CaptureTemplateField` is
   `{ key, label, placeholder?, multiline? }` (text only) and `CaptureEntry.fields` is
   `Record<string,string>`. Feeling Good rates charge 0–100 *before and after* the rewrite, *inside*
   one record. Fix: add `type?: 'text' | 'number'` (+ `min/max/step`) to `CaptureTemplateField`,
   widen `fields` to `Record<string, string | number>`, and let `structured` emit a `SkillSignal`
   from a numeric field. (The standalone `metric`/`rating` path already handles plain numbers.)
7. **Captures are `behaviorId`-keyed today.** `CheckIn` and `CaptureEntry` reference `behaviorId`, so
   reusing `entries` is *not* free — re-key to the program world (add `sourceType:
   'enrollment' | 'exercise'` + `sourceId`, or explicit `enrollmentId`/`exerciseId`). Plan this
   migration in Phase 1 alongside the new tables.
8. **Completion-based progression + calendar streak** (§5) needs both on the enrollment: `currentDay`
   advances on completion (never by wall-clock), while `practicedDates[]` (or derived from
   `programDayLogs`) drives the calendar adherence streak.

---

## 11. De-risked delivery: vertical slice FIRST, then breadth

The original plan built 7 instruments + ported 5 programs before anything shipped — too long to first
signal for a solo founder. Insert a **vertical slice** to prove the *feel* first:

- **Slice (do first):** ship **Deep Work** end-to-end — enroll → Today → `timer`+`tally` → mark done
  → Day 2 → daily reminder → graduation. One book, fully felt, on Khalid's iPhone. Validate the loop
  is calm and motivating *before* investing in breadth. **This is the go/no-go gate for the pivot.**
  (Deep Work, not Fluent Forever, because SRS is the heaviest instrument — §10a.3.)
- **Then breadth:** the other 4 instrument-coverage programs, then the 12-book backlog (mechanical).

---

## 12. Phased plan (each phase = its own PR off `main`)

> **Rough effort (solo, AI-assisted, focused days). Risk concentrates in Phase 1 + Phase 3.**

### Phase 0 — Vision & template (docs only) · ~0.5–1 day
- Rewrite `Reprogrammer App — Detailed Functional Specification.md` + `README.md` to the book-program
  model + instrument toolbox; reframe `app.json`/store copy ("Don't read it. Run it.").
- Upgrade vault `Book Program Template.md`: per-day **`Behavior:` → `Instrument:`** (+ config), add
  `standingExercises` and day-range syntax, document the porting checklist.
- Write `services/content/PROGRAMS_AUTHORING.md` mirroring it for the code side.

### Phase 1 — Types + Instrument contract + Convex + the vertical slice (Deep Work) · ~3–5 days **(riskiest)**
- New types in `types/index.ts` (§10, §10a) incl. the **`Instrument` contract**, `StandingExercise`,
  `SkillSignal`, day ranges.
- Convex: `programEnrollments`, `programDayLogs` (+ `srsCards`/`srsReviews`) tables + mutations/
  queries mirroring `convex/behaviors.ts`. Behaviors tables stay (deprecated).
- **Transcribe Deep Work** into structured `days` with `timer`+`tally`.
- Ship the **vertical slice** to Simulator/iPhone. **Stop and feel it. Validate before breadth.**

### Phase 2 — Enrollment + daily loop (generalize the slice) · ~2–3 days
- New IA **Today / Programs / You** (§6); reading Library folds into Programs.
- **Programs** = repurposed `library.tsx`; detail gains **Start program** → reminder → enrollment.
  **Today** = day card(s) + active standing exercise(s) → instrument → mark done → advance.
- Re-point `notifications.ts` + `scheduler-core.ts` to **one daily reminder per enrollment** (archive
  jitter/anchor). Adherence ("days practiced") replaces ping streak.

### Phase 3 — Instrument toolbox + 4 more programs · ~4–6 days **(content + build heavy)**
- Implement each instrument against the contract (mostly wiring). **The one real new build is `srs`**
  (card authoring + FSRS review queue + reviews-due reminder).
- Port: **Atomic Habits** (`checkbox`), **Fluent Forever** (`srs`), **Feeling Good** (`structured`
  +numeric `rating`+`tally`), **The Artist's Way** (`journal`).

### Phase 4 — Archive (absorb, don't discard) adopt/eliminate · app · GitHub · vault · ~1–2 days
- **Absorb** behavior-rep tracking into the `checkbox` instrument (§8).
- **App/GitHub:** remove Behaviors tab (`states.tsx`), `create.tsx`, `manage-behaviors.tsx`,
  `behavior/[id].tsx` from nav; move them + `content/{adopt,eliminate}-templates.ts` to `archive/`;
  mark `kind`/behavior schema fields `@deprecated` (don't drop). Reframe `onboarding.tsx`: 4 behavior
  templates → "which book do you want to live?" program pick (§5).
- **Vault:** move `Behaviors/` + adopt/eliminate pages to `Archive/`; rewrite each program's
  `related:` / "Behaviors trained" / "Connection" to be self-contained + instrument-based.
- Re-point `coach.ts` + `weekly-review.ts` at program progress + skill-gain.

### Phase 5 — Skill-gain, graduation, tests, polish, store copy · ~3–4 days
- Build **graduation/maintenance** (§5) and **skill-gain signals** (§7) on Today/You.
- Replace behavior-model tests; add tests for enrollment advance, day-range/standing-exercise logic,
  instrument capture, SRS scheduling.
- Final Atoms polish on Today/Programs/instrument screens; store copy + screenshots.
- Backlog: port remaining 12 vault programs (mechanical).

**Total rough: ~14–21 focused days (~3–4 weeks solo).** Risk lives in Phase 1 (new architecture +
first ship) and Phase 3 (SRS card authoring). The Phase 1 vertical slice is the cheapest possible
test of "is this the right product?"

---

## 13. Verification (per phase)
- `npm run test:convex` + vitest green after each phase.
- **Web preview** (Node 22 launch.json trick; seed localStorage past onboarding; needs Convex
  `_generated` stubs): browse → enroll → Today shows Day 1 (+ standing exercise once it activates) →
  open instrument → mark done → advance date → Day 2. SRS: create cards → review queue surfaces due.
- **iOS Simulator** (`xcodebuild -sdk iphonesimulator` + `simctl`, Metro 8081): daily reminder fires
  and deep-links into Today; SRS reviews-due reminder fires.
- Confirm **archived behavior data still loads** (no crash for existing users) via `archive/`.

---

## 14. Open questions for Khalid
1. **Vertical-slice gate:** OK to ship Deep Work *alone* to your iPhone first and judge the feel
   before porting the catalog? (Recommended — cheapest test of the thesis.)
2. **Onboarding wall:** keep REP-30's mandatory account but make it one-tap Apple sign-in *before*
   the Day-1 aha (recommended), or allow a local-only Day-1 trial (reopens REP-30)?
3. **Concurrency / Pro:** free = 1 active program, Pro = up to 3 + custom SRS + cross-program
   analytics? Or gate the catalog instead (not recommended)?
4. **North-star:** lead with **skill-gain** signals now, or adherence-only for v1 and skill-gain as a
   fast-follow?
5. **Standing exercises in the UI:** when a standing exercise is active *and* there's a day-specific
   exercise, show both on Today as two cards (recommended) or merge?
6. **IA:** fold reading-Library into Programs (default), or keep a separate Library tab?
7. **First-batch programs:** the 5 instrument-coverage picks — keep, or swap any?
8. **Linear:** mirror as a REP epic + per-phase issues if the MCP is reachable; else note and proceed.
9. **Progression model:** confirm **completion-based days + calendar streak** (recommended, §5), vs
   strict calendar progression (miss a day = skip that exercise)?
10. **Reminders:** default to a **single daily digest** (recommended, §10) vs one ping per program?
11. **Minimum viable day:** ship the **2-minute version** of every exercise as a first-class
    retention feature (recommended, §5/§15)?

---

## 15. Risks & failure modes

- **Content / IP of teaching a book's method.** *Methods, systems, facts and ideas are not
  copyrightable — only their specific expression is* (idea/expression dichotomy, 17 U.S.C. §102(b)).
  Safe-by-design if we (a) write every exercise in **our own words** (the vault already paraphrases),
  (b) never reproduce substantial verbatim passages, (c) **attribute** book + author (we do — it's a
  feature), and (d) avoid trademark confusion ("based on the method in *X* by *Y*", never
  "official"/endorsed). Residual risk: an author/publisher may object regardless. Mitigations:
  transformative practice framing, takedown-responsiveness, and a one-time **IP-lawyer review before
  scaling the catalog commercially** (not legal advice). Upside path: official author partnerships.
- **Notification fatigue.** N programs × (daily + reviews-due) pings → annoyance → uninstall.
  Mitigation = the **digest** model (§10), quiet hours, a hard cap.
- **The Day-3 cliff.** Most self-improvement users quit by day 3. Mitigations: front-loaded Day-1 aha
  (§5); **completion-based progression** so a missed day never shows "behind"; the **2-minute minimum
  viable day**; early skill-gain visualization (proof it's working); deliberately lighter, higher-
  reward Day 2–3 content. Treat retention as a *design* problem, not a notification problem.
- **Scope (solo founder, 6 phases).** Mitigated by the vertical-slice gate (§11) — no breadth until
  the slice proves the feel.
- **SRS build complexity.** The heaviest instrument; time-box it, keep it out of the slice.
- **Existing-user migration.** Soft-archive preserves behavior data (§8); verify no crash on load.

---

## 16. Store copy / ASO

- **Name / subtitle:** *Reprogrammer* · subtitle "Turn books into daily practice."
- **Promo opener:** "**Don't read the book. Run it.** Reprogrammer turns the world's best books into
  guided, day-by-day practice — with the exact tool each method needs."
- **Differentiator line:** "Not summaries. Not another habit tracker. Real practice that proves you
  changed."
- **Keywords:** deliberate practice, habit, focus, CBT, spaced repetition, journaling, learning,
  productivity, self-improvement, book — plus the *titles we actually include* (referential use;
  expect Apple to scrutinise brand keywords, so frame as "based on").
- **Screenshots:** Today card → instrument variety (CBT record · SRS review · focus timer) →
  skill-gain sparkline → program browse. Lead with the *doing*, not a feature list.

---

## Iteration log
- **v1 (2026-06-24):** First sharpening pass — stark idea/positioning ("Don't read the book. Run
  it."), grounded against repo+vault and corrected the "day-by-day is the core gap" premise (it
  exists), elevated the **Instrument contract** to headline architecture, named the **authoring
  pipeline** as the moat (resolving elicit-vs-curate), added the **experience arc**
  (aha/graduation/forgiveness), **focus philosophy**, **skill-gain north-star**, **absorb-not-discard**
  archive, **monetization**, and a **vertical-slice-first** delivery.
- **v2 (2026-06-24):** Pressure-tested + concretized. (a) Added the **competitive landscape** table
  (Blinkist/Headway/Shortform/Fabulous/Anki/Atoms/Duolingo) with where-we-win / where-we're-squeezed
  + threat model. (b) **Tighter one-liner** + tagline + "Duolingo for book methods" analogy. (c)
  **Concrete 5-screen onboarding spec** + flagged & resolved the REP-30 mandatory-wall vs aha tension
  (one-tap Apple sign-in). (d) **Numeric free/Pro** table (free=1 program, Pro=3 + custom SRS +
  cross-program analytics) with focus-philosophy reconciliation. (e) **`SkillSignal`** unified
  *container* (not a normalized score) added to the Instrument contract + §7. (f) **Per-phase effort
  estimates** (~14–21 days) + risk concentration. (g) **Grounded SRS = card-authoring** (not pre-made
  decks) → kept out of the vertical slice, reused across learning programs. (h) **New domain-model
  refinements (§10a)** forced by real content: **standing/recurring exercises**, **day ranges**,
  **numeric fields in structured templates** — the highest-value catch of the pass.
- **v3 (2026-06-24):** Code-grounded + UX-concrete pass. (a) **Verified in code** the `cbt` template
  shape, that structured templates **lack numeric fields** (§10a.6), and that captures are
  `behaviorId`-keyed (§10a.7). (b) Concrete **Today screen** spec (§5a) + decided **completion-based
  progression with a calendar streak** and a **2-minute minimum viable day** (§5). (c)
  **Graduation/maintenance per instrument** table (§8a). (d) **Risks & failure modes** (§15) incl. the
  IP/idea-expression analysis, notification-fatigue → **digest reminders** (§10), and Day-3-cliff
  retention design. (e) **Store copy / ASO** (§16). (f) Confirmed **3 tabs survive** with SRS deck
  *management* in Programs and *review* on Today (§6).
- **v4 (next):** Pressure-test pricing against the indie market (anchor to existing RevenueCat
  config — read it, don't guess). Define **SkillSignal → UI** precisely (sparkline + the plain-
  language sentence generator). Spec the **SRS card-authoring** surface (fields, image picker,
  deck-per-program vs free decks). Draft the **Phase-0 spec/README rewrite** outline so it's ready to
  execute. Full **internal-contradiction sweep** and a **convergence check** — if no meaningful,
  non-cosmetic improvement remains, stop the loop and notify.
- **Loop concluded (2026-06-24).** The plan was approved and implementation started (Phase 0 docs +
  Phase 1a domain types committed). The strategy doc has converged for build purposes; the remaining
  v4 refinement items now move from *strategy iteration* to *implementation work* and are tracked in
  the executable plan (`~/.claude/plans/steady-dancing-cosmos.md`): pricing → read the real
  RevenueCat config during Phase 2 gating; SkillSignal→UI → Phase 5; SRS card-authoring spec →
  Phase 3. The `/loop` is stopped here — further changes land as code, not as more doc passes.
