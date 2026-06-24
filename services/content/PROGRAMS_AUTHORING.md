# Authoring a Book Program (code side)

Programs are curated content **ported from the Quiescence vault**
(`~/Documents/Quiescence/Wiki/Self/Reprogrammer/Programs/`) — not generated at runtime. The vault
page is the source of truth; this file is how a finished vault page becomes a typed `Program` in
`programs.ts`. The vault's own rules live in `Programs/Book Program Template.md`; keep the two in
sync.

## The shape

A program extends `LibraryProgram` (`services/library-content.ts`) additively — existing fields
(`id`, `title`, `description`, `category`, `book`, `guideIds`, `body`) stay; the structured fields
below are what make it *runnable*:

```ts
{
  // …existing LibraryProgram fields…
  primaryInstrument: Instrument['kind'],   // the one instrument that defines the program
  durationDays: number,                    // total scripted days
  dailyMinutes: number,                    // typical time per day
  setting: 'solo' | 'partner' | 'group',
  pairsWith?: string[],                    // ids of programs this complements
  days: ProgramDay[],
  standingExercises?: StandingExercise[],
}

// ProgramDay  — `day` accepts a single day or an inclusive range ("Day 10–12")
{ day: number | [number, number], week: number, theme: string, exercises: Exercise[] }

// Exercise
{ prompt: string, minutes: number, instrument: Instrument['kind'], instrumentConfig?: object }

// StandingExercise — a recurring daily practice that switches on at `activatesOnDay`
{ activatesOnDay: number, prompt: string, instrument: Instrument['kind'], instrumentConfig?: object }
```

## Instruments

| `instrument` | Use for | `instrumentConfig` |
|---|---|---|
| `checkbox`   | a rep to mark done (+ optional identity line) | `{ identityLine?: string }` |
| `journal`    | free-text writing (morning pages, reflection) | `{ minWords?: number }` |
| `structured` | a typed form (CBT, OFNR, three good things)    | `{ templateId: CaptureTemplateId }` |
| `tally`      | a counter (drift, "shoulds", interactions)     | `{ label: string, direction: 'up'|'down' }` |
| `timer`      | a focus session (+ optional in-session tally)  | `{ targetMinutes: number, withTally?: boolean }` |
| `rating`     | one number on a scale                          | `{ min: number, max: number, label: string }` |
| `srs`        | author + review spaced-repetition cards         | `{ deckId: string }` |

## Porting steps

1. Map the vault frontmatter → metadata (`source`→`book`, `duration`→`durationDays`,
   `daily_minutes`→`dailyMinutes`, `setting`, `primary_instrument`→`primaryInstrument`).
2. Copy Thesis → `thesis`, the numbered Method → `method[]`.
3. Turn each `**Day N**` / `**Day N–M**` into a `ProgramDay`, each `Exercise:` into an `Exercise`
   using its `Instrument:` line for `instrument` + `instrumentConfig`.
4. Turn each `From Day N` block into a `StandingExercise`.
5. Keep it **self-contained** — no behavior references.

## Rules

- **Concrete exercises only.** "Practice eye contact" fails; "hold eye contact one second past
  comfort, three times today, note what changes" passes.
- **Right instrument, not easy instrument.** Choose what the method demands.
- **Our words.** Paraphrase the author's method; never paste substantial verbatim text; attribute the
  book + author. See `PIVOT_PLAN.md` §15 (content/IP).
- **Every program needs a Day-1 exercise the user can do today** — the editorial filter.
