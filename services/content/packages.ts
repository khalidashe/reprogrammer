import type { LibraryPackage } from '../library-content';

export const LIBRARY_PACKAGES: LibraryPackage[] = [
  {
    id: 'pkg-public-speaking',
    title: 'Public Speaking',
    description:
      'A curated bundle for building stage presence: confidence, eye contact, body language, dominant posture, poker face, fear & panic, communication process.',
    guideIds: [
      'guide-confidence',
      'guide-eye-contact',
      'guide-body-language',
      'guide-dominant-posture',
      'guide-poker-face',
      'guide-fear-and-panic',
      'guide-communication-process',
    ],
    sequence: [
      'Dominant Posture',
      'Confidence',
      'Eye Contact',
      'Body Language',
      'Poker Face',
      'Deliberate Communication',
      'Calm Under Pressure',
      'Topic Mastery',
    ],
    body: `Public speaking is not a single skill — it is a stack of trainable states that operate simultaneously. Each component can be isolated, practiced, and encoded into the basal ganglia before being brought together. Build them separately; they compound.

This package groups all states relevant to effective public speaking into a single reference hub. Each component links to its full Library guide.

---

## The Stack

| State | Type | Guide |
|---|---|---|
| Confidence | 🧠 Mental + 💪 Physical | [[Confidence]] |
| Eye Contact | 💪 Physical | [[Eye Contact]] |
| Body Language | 💪 Physical | [[Body Language]] |
| Dominant / Grounded Posture | 💪 Physical | [[Dominant Posture]] |
| Poker Face — Emotional Neutrality | 💪 Physical + 🧠 Mental | [[Poker Face]] |
| Calm Under Pressure | 🧠 Mental | [[Fear & Panic]] |
| Deliberate Communication | 💪 Physical + 🧠 Mental | [[Communication Process]] |
| Topic Mastery — Clear Understanding | 📚 Learning | [[Topic Mastery]] |

---

## Why These Seven

**Confidence** is the foundation — without it, every other skill collapses under pressure. It is trained, not inherited. Bandura's research established that confidence is built through graduated exposure and small wins, not affirmation or preparation alone.

**Eye contact** signals credibility and presence. Studies show credibility judgments on speaker qualification and honesty are heavily weighted by eye contact alone. Without it, audiences mentally disconnect regardless of content quality.

**Body language** carries more signal than words when the two conflict. Non-verbal congruence — alignment between what you say and how your body says it — is what the audience reads first and remembers longest.

**Dominant posture** is the physical anchor for everything above. A collapsed posture undermines eye contact, reduces perceived confidence, and creates feedback into the speaker's own internal state. Posture first, then everything else layers on top.

**Poker face / emotional neutrality** controls what the audience reads into your expressions during pauses, difficult questions, or unexpected responses. Composure communicates competence and control.

**Calm under pressure** is the stress-response side of composure. It can be trained through graduated exposure to stress before high-stakes situations, systematic desensitization, and breath regulation.

**Deliberate communication** — thinking before speaking, controlling pace, structuring before delivering — prevents the most common public speaking failures: filler words, tangential responses, rushed delivery.

**Topic mastery** is the only component that cannot be trained in isolation from content. No amount of delivery skill compensates for uncertainty about the subject. The audience detects it before the speaker admits it.

---

## Suggested Training Sequence

1. **Dominant Posture** — set the physical foundation first. Mirror drill daily.
2. **Confidence** — guided mastery progression through graduated public speaking exposure.
3. **Eye Contact** — drill in low-stakes conversations before applying in presentations.
4. **Body Language** — learn the congruence principle; identify and eliminate your inconsistency tells.
5. **Poker Face** — mirror drill; target your specific leak tells.
6. **Deliberate Communication** — apply the one-breath rule in every conversation.
7. **Calm Under Pressure** — systematic exposure to increasingly high-stakes situations.
8. **Topic Mastery** — parallel to all of the above; ongoing.`,
  },
];
