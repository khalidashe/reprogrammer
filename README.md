# Reprogrammer

**Don't read the book. Run it.**

Reprogrammer turns the world's best self-improvement books into guided, **day-by-day
deliberate-practice programs** — and hands you one concrete exercise a day, practiced with **the
exact training instrument that method demands**. Not summaries. Not another habit tracker. Real
practice that proves you changed.

- *Feeling Good* → a structured CBT thought record
- *Fluent Forever* → a spaced-repetition deck you build yourself
- *Deep Work* → a focus timer + an attention-drift tally
- *The Artist's Way* → a journaling surface for morning pages

The app is a **program runner with a toolbox of practice instruments** (`checkbox`, `journal`,
`structured`, `tally`, `timer`, `rating`, `srs`), each chosen per exercise.

## Stack
- **App:** React Native + Expo (expo-router, TypeScript), Zustand + AsyncStorage for local state.
- **Backend:** [Convex](https://convex.dev) (auth, sync; per-userId + clientId + soft-delete +
  last-write-wins).
- **Payments:** RevenueCat (Pro entitlement).
- **Content:** curated programs ported from the Quiescence vault — not runtime AI generation.

## Docs
- `Reprogrammer App — Detailed Functional Specification.md` — what the app does, screen by screen.
- `PIVOT_PLAN.md` — product strategy: positioning, competitive analysis, monetization, risks.
- `services/content/PROGRAMS_AUTHORING.md` — how to author/port a book program (the instrument
  template).
- `CLAUDE.md` / `convex/_generated/ai/guidelines.md` — Convex working rules (read before touching
  Convex code).

## Develop
```bash
npm install
npx convex codegen      # needs Node 22 + .env.local; fresh worktrees have no _generated stubs
npm run test:convex     # Convex test runner
npx vitest              # unit tests
```
Run on the **iOS Simulator** (the verification surface for this project — no web preview):
`xcodebuild -sdk iphonesimulator` + `simctl install/launch`, Metro on `8081`. Never commit `ios/`.

## Status
Repositioning from a behavior tracker to book programs. The old adopt/eliminate model is
**soft-archived** (deprecated, reversible) — existing data is preserved. See `PIVOT_PLAN.md` and the
phased plan for details.
