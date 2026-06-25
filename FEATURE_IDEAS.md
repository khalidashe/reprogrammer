# Reprogrammer — Feature ideas to improve the app

> Self-paced `/loop` backlog. "This" = the book-programs app, especially the **Deep Work vertical
> slice** just shipped (Today → timer+tally → complete → next day). These are *enhancements* beyond
> the committed phase plan (`~/.claude/plans/steady-dancing-cosmos.md`) — net-new value and polish.
> Each loop pass refines/reprioritizes. See the Iteration log at the bottom.

## Where the app is right now (grounding)
- ✅ Today tab: enroll → day card → timer instrument → **completion-based** advance → done-for-today.
- ✅ Timer+tally instrument (reuses FocusSession). Deep Work fully ported (21 days).
- ⛳ Gaps the demo exposed: enroll is only from Today (no Programs browse/Start yet); no "why this
  exercise" context; no progress/streak visualization; reminders not wired; only 1 of 7 instruments
  built; no graduation; old tabs (Dashboard/Behaviors/Library) still present.

---

## P0 — make the daily loop feel complete (next up)
1. **Enroll-from-empty + outcome picker.** Today's empty state lists raw programs; build the
   "What do you want to change?" outcome cards (Focus deeply → Deep Work, etc.) → preview Day 1 →
   pick reminder time → enroll. *Why:* the aha moment; first impression. *Effort: S–M.*
2. **Daily reminder that deep-links to Today.** One digest notification at the chosen time →
   tapping opens Today. *Why:* without it, retention dies; it's the core habit loop. *Effort: M.*
3. **"Why this exercise" expander.** Each day card can expand to the method rationale (from the
   program's Thesis/Method). *Why:* turns a chore into deliberate practice; differentiates from a
   checklist. *Effort: S.*
4. **2-minute version toggle.** "Short on time?" shrinks today's exercise to a 2-min variant that
   still counts as practiced. *Why:* the single biggest Day-3-cliff retention lever. *Effort: S–M.*

## P1 — progress & motivation (the reason to come back)
5. **Adherence calendar / streak strip.** A gentle heatmap of practiced days + "N days practiced";
   forgiving (no red break). *Why:* visible momentum without shame. *Effort: M.*
6. **Skill-gain mini-charts.** Deep-minutes-up and drift-tally-down sparklines from the session data
   we already capture. *Why:* "proof you changed" — the unique differentiator vs trackers. *Effort: M.*
7. **Completion notes / one-line reflection.** Optional note when finishing a day. *Why:* deepens
   practice, feeds weekly review. *Effort: S.*
8. **Graduation + maintenance screen.** On Day 21, a "the method is yours" moment + keep-going
   options. *Why:* closes the arc; sets up the next program. *Effort: M.*

## P2 — instruments & breadth (more programs become runnable)
9. **SRS instrument** (card authoring + FSRS review queue + reviews-due reminder). *Unlocks Fluent
   Forever, Make It Stick, Ultralearning. Effort: L — the big one.*
10. **Structured/CBT instrument** with numeric fields (0–100 charge before/after). *Unlocks Feeling
    Good, NVC. Effort: M.*
11. **Journal + tally + rating + checkbox surfaces** wired to exercises. *Unlocks Atomic Habits,
    The Artist's Way, How to Win Friends. Effort: M total.*
12. **Programs tab** — browse the catalog, read Thesis/Method/day-by-day, **Start program** from
    detail. *Why:* discovery + the reader-as-product. *Effort: M (reuse library.tsx).*

## P3 — timer instrument polish (the surface users sit in daily)
13. **Target progress ring + gentle chime** at the target minute; subtle, not alarming. *Effort: S.*
14. **Live Activity / Dynamic Island** for the running focus session. *Why:* premium, keeps the
    session present without unlocking. *Effort: M–L (native).*
15. **Background-safe timer** (survive app backgrounding / lock). *Effort: M.*
16. **Drift-tally affordance**: bigger tap zone, haptic, quick undo. *Effort: S.*

## P4 — platform & trust
17. **Real one-tap Apple Sign-In onboarding** (replace the dev bypass path). *Effort: M.*
18. **Home Screen widget** showing today's exercise + a "start" deep link. *Effort: M–L.*
19. **Accessibility pass**: Dynamic Type, full VoiceOver labels on Today/instrument. *Effort: S–M.*
20. **Convex sync for enrollments/day-logs** (cross-device continuity). *Effort: M — Phase 1d.*

---

## Cross-cutting bets (worth a deeper look)
- **"One thing today" calm framing.** Lean into single-focus: when done, the screen should feel
  *finished*, not beg for more taps. (We already show a done-state — extend the calm.)
- **Forgiveness as a feature, not an absence.** A visible, kind "you missed yesterday — pick up
  where you left off" beats a silent reset. Make the recovery path a designed moment.
- **Pre-built example for hard instruments.** For SRS, ship a couple of starter cards per language so
  the empty deck isn't a wall (then the user authors their own).

---

## Iteration log
- **v1 (2026-06-25):** First backlog. Grounded in the shipped Deep Work slice; organized P0–P4 by
  "make the loop complete → motivation → instruments/breadth → timer polish → platform," each with a
  why + rough effort. Added three cross-cutting bets. Next passes: add impact×effort scoring to rank
  within tiers, fold in any ideas from re-reading PIVOT_PLAN §5/§7, and pull concrete UX details from
  what the simulator run revealed (e.g. the done-state could preview tomorrow's exercise).
