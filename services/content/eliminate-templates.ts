import type { EliminateTemplate } from '../library-content';

export const ELIMINATE_TEMPLATES: EliminateTemplate[] = [
  {
    id: 'eliminate-other-languages',
    title: 'Defaulting to Other Languages in Thought',
    pingMessage:
      "What language is the inside of your head in right now?",
    domain: 'language_cognitive',
    replacementAdoptId: 'adopt-think-in-english',
    triggers: [
      'Stress, fatigue, high cognitive load',
      'Familiar situations tied to another language',
      'Complex problems where the other language feels more precise',
    ],
    body: `**Replacement:** [[Think in English]] — narrate internally in English; redirect when you catch the default.`,
  },
  {
    id: 'eliminate-reactive-responses',
    title: 'Reactive Responses',
    pingMessage: 'One slow breath before the next word.',
    domain: 'social',
    replacementAdoptId: 'adopt-deliberate-communication',
    triggers: [
      'Feeling criticized or dismissed',
      'Being caught off guard or made to look wrong',
      'High-stakes situations with emotional charge',
    ],
    body: `Reactive responses are the gap between stimulus and response collapsing to zero. The fix isn't to think harder — it's to widen the gap.

**Replacement:** [[Deliberate Communication]] · [[Let Go of Rage]]`,
  },
  {
    id: 'eliminate-snap-judgments',
    title: 'Snap Judgments',
    pingMessage: "Any quick certainty in your head? Try 'I wonder why' instead.",
    domain: 'language_cognitive',
    replacementAdoptId: 'adopt-suspend-judgment',
    triggers: [
      'First meeting someone new',
      'Hearing a conflicting opinion',
      'Behavior that pattern-matches to a past negative experience',
    ],
    body: `Snap judgments feel like certainty — that's the tell. The certainty itself is the signal that you've closed before understanding.

**Replacement:** [[Suspend Judgment]] · [[Understand Others' Point of View]]`,
  },
  {
    id: 'eliminate-phone-pickup',
    title: 'Reflexive Phone Pickup',
    pingMessage: 'What did you open the phone for? Still doing that?',
    domain: 'professional',
    replacementAdoptId: 'adopt-deliberate-communication',
    triggers: [
      'Any lull in the current task',
      'Boredom before difficulty has produced output',
      'Phone within sight or reach',
    ],
    body: `Reflexive phone pickup is the slot-machine reflex firing. The reach happens before the decision. Naming the urge ("there's the itch") and not acting on it is the rep.

**Replacement:** Environment first — phone out of the room. See [[Digital Discipline]] and [[Attention Fragmentation]].`,
  },
  {
    id: 'eliminate-interrupting',
    title: 'Interrupting Others',
    pingMessage: 'If someone is talking — are you listening, or rehearsing your reply?',
    domain: 'social',
    replacementAdoptId: 'adopt-active-listening',
    triggers: [
      'Excitement about the topic',
      'Knowing what they’re about to say',
      'Disagreement creating urgency',
      'Discomfort with silence',
    ],
    body: `The internal draft of your reply is what to interrupt — not the other person.

**Replacement:** [[Active Listening]] · [[Deliberate Communication]]`,
  },
  {
    id: 'eliminate-slouching',
    title: 'Slouching',
    pingMessage: "Quick body check — where's your spine right now?",
    domain: 'physical',
    replacementAdoptId: 'adopt-dominant-posture',
    triggers: [
      'Extended sitting (desk, phone, eating)',
      'Fatigue',
      'Unfamiliar or high-status social environments',
      'Scrolling on a device',
    ],
    body: `Collapsed posture is the most automatic background behavior — it runs without thought. Set a 90-minute check-in. Reset before any high-stakes room.

**Replacement:** [[Dominant / Grounded Posture]] · [[Dominant Posture]]`,
  },
  {
    id: 'eliminate-eye-avoidance',
    title: 'Eye Avoidance',
    pingMessage: 'Next pair of eyes — hold for three seconds before looking away.',
    domain: 'social',
    replacementAdoptId: 'adopt-eye-contact',
    triggers: [
      'Speaking to higher-status people',
      'Conflict or disagreement',
      'Moments of uncertainty mid-sentence',
    ],
    body: `Gaze avoidance is the primary non-verbal signal of speaker uncertainty. Returning to the audience in the exact moments you'd normally look away is the drill.

**Replacement:** [[Eye Contact]]`,
  },
  {
    id: 'eliminate-ruminating',
    title: 'Ruminating on Past Mistakes',
    pingMessage: "What's running through your head? If it's a replay, label it 'thinking.'",
    domain: 'emotional',
    replacementAdoptId: 'adopt-compassionate-curiosity',
    triggers: [
      'After a perceived social failure',
      'Unresolved conflict',
      'Irreversible decisions',
    ],
    body: `Rumination looks like thinking but produces no new outputs. If you've had this thought five times and the emotional charge hasn't changed, you're not reflecting.

**Replacement:** Extract the lesson in one written sentence ("What I'll do differently is ___"), then stop. See [[Rumination Interrupt]] · [[Compassionate Curiosity]].`,
  },
  {
    id: 'eliminate-rage-spiral',
    title: 'Rage Spirals',
    pingMessage: 'Notice rising tension. Name it. Breathe out slowly.',
    domain: 'emotional',
    replacementAdoptId: 'adopt-let-go-of-rage',
    triggers: [
      'Perceived disrespect or boundary violation',
      'Stacked stress from unrelated sources',
      'Replay of a recent trigger',
    ],
    body: `The initial neurochemical wave of anger clears in ~90 seconds. Everything after that is built by thought. The only goal in the first 90 seconds is to not act.

**Replacement:** [[Let Go of Rage]] · [[Fear & Panic]]`,
  },
  {
    id: 'eliminate-news-doomscroll',
    title: 'News Doomscrolling',
    pingMessage: "Feed open right now? Notice how it feels — close it if you're done.",
    domain: 'professional',
    replacementAdoptId: 'adopt-daily-meditation',
    triggers: [
      'Anxiety with no specific object',
      'Procrastinating a hard task',
      'Late-evening winding down',
    ],
    body: `The doomscroll feels like staying informed; it's actually the brain seeking a target for diffuse arousal. Each scroll confirms the threat without resolving anything.

**Replacement:** A 5-minute task with output. See [[Digital Discipline]] · [[Attention Fragmentation]].`,
  },
  {
    id: 'eliminate-overexplaining',
    title: 'Over-explaining Decisions',
    pingMessage: "Said a 'no' today? Notice if you're still justifying it.",
    domain: 'social',
    replacementAdoptId: 'adopt-deliberate-communication',
    triggers: [
      'Saying "no" to someone with higher status',
      'Anticipated disagreement',
      'Feeling the need to justify a boundary',
    ],
    body: `Over-explanation reads as uncertainty about the decision itself. State it. Stop. Let the silence land.

**Replacement:** [[Deliberate Communication]] · [[Communication Process]]`,
  },
  {
    id: 'eliminate-nervous-laughter',
    title: 'Nervous Laughter',
    pingMessage: "Slow exhale. Eyes neutral. Don't laugh through it.",
    domain: 'social',
    replacementAdoptId: 'adopt-dont-laugh',
    triggers: [
      'Unexpected absurdity in a serious context',
      'Nervous energy misrouted as humor',
      'Pressure that creates involuntary laughter',
    ],
    body: `Don't try not to laugh — that guarantees it. Redirect: focus on the person, on what this moment means to them. Real curiosity crowds out the impulse.

**Replacement:** [[Don't Laugh]]`,
  },
];
