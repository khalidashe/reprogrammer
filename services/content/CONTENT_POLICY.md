# Content policy — neutral catalog + safety framing (REP-23)

This is the editorial filter for **everything** that enters the Reprogrammer
catalog: guides, book programs, adopt/eliminate templates. It is written once
and reused for every new behavior. The editor is the founder (solo); applying
this filter *is* the editorial job.

## The decision: a neutral catalog

Reprogrammer is **content-neutral**. The user picks any category to train —
focus, social skills, strategy/power, confidence, relationships, money, and so
on. The app takes no side on *what* the user wants to become.

## The safety rule (apply to every behavior)

> Teach the skill for **self-mastery or self-defense** — never to harm or
> manipulate a specific person. Every behavior is framed as **"build this in
> yourself"** or **"recognize this so it isn't used on you"**, never **"do this
> to someone."**

This single rule keeps the app safe across *all* categories at once (power,
persuasion, dating, negotiation…), keeps it App Store-friendly, and preserves
the strong "level up your life" appeal for everyone.

## The one-line test

Before any behavior ships, read its title, description, and body and ask:

> Is this framed as something I do **to myself** (or notice **in others to
> protect myself**), or as something I do **to another person**?

If any line reads as "do this *to* someone," reframe it. If you cannot reframe
it to self-mastery/self-defense, it does not enter the catalog.

## Framing examples

| Tempting (rejected) | Shipped framing |
|---|---|
| 48 Laws of Power → "manipulate your boss" | "Understand power so no one controls you" (defensive, self-aware) |
| The Art of War → "defeat your enemy" | Strategy, patience, self-discipline (self-mastery) |
| Persuasion/negotiation → "get people to say yes" | Empathy, clarity, and composure you build in yourself; read what's really being asked |
| Charisma → "make people like you" | Presence, warmth, and confidence as your own default signals |

## Authoring checklist (per behavior/program)

- [ ] **Self-framed.** Title + description + body read as "build/notice in
      yourself," not "act on a named target."
- [ ] **No specific-person targeting.** Nothing instructs the user to do
      something *to* an identified individual.
- [ ] **Honest, not covert.** Influence content (Carnegie, Voss, Cabane) is
      framed around genuine interest, empathy, and clarity — not deception.
- [ ] **Clinical-adjacent → disclaimer.** CBT/ACT/sleep/medical-adjacent
      material carries an inline "educational, not a substitute for therapy /
      see a clinician" note (see `programs.ts` for the pattern).
- [ ] **Source-true.** Built from the book's documented framework (the
      launch-catalog method), in the house **Thesis → Method → Run It** voice.

## In-app disclaimer

A light, global **"Educational, not professional advice."** line is surfaced in
the Library (the catalog home). This feeds the Terms of Service (REP-25). The
clinical-adjacent programs additionally carry their own inline disclaimers.

## Audit status

The full catalog (41 programs / 20 guides as of the REP-33 expansion) was
audited against this rule on 2026-06-17 and passes: no behavior frames a skill
as acting on a specific person. The persuasion/negotiation/charisma programs
(How to Win Friends, Never Split the Difference, The Charisma Myth, Nonviolent
Communication, Social Confidence) are framed around genuine interest, empathy,
and self-composure. Re-run the checklist above whenever content is added.
