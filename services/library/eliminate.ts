import type { EliminateTemplate } from './types';

export const ELIMINATE_TEMPLATES: EliminateTemplate[] = [
  {
    id: 'eliminate-other-languages',
    title: 'Defaulting to Other Languages in Thought',
    pingMessage: 'Did you catch yourself thinking in another language? Switch to English.',
    domain: 'language_cognitive',
    replacementAdoptId: 'adopt-think-in-english',
    frequency: 'Daily / Situational / Automatic',
    triggers: [
      'Stress, fatigue, high cognitive load',
      'Familiar situations tied to another language',
      'Complex problems where the other language feels more precise',
    ],
    replacementNote:
      'Replaced by Think in English — narrate your day internally in English and redirect when you catch yourself defaulting elsewhere.',
  },
  {
    id: 'eliminate-reactive-responses',
    title: 'Reactive Responses',
    pingMessage: 'Did you react before processing? Breath, then respond.',
    domain: 'social',
    replacementAdoptId: 'adopt-deliberate-communication',
    frequency: 'Daily / Situational',
    triggers: [
      'Feeling criticized or dismissed',
      'Being caught off guard or made to look wrong',
      'High-stakes situations with emotional charge',
    ],
    replacementNote:
      'Replaced by Deliberate Communication — one slow inhale before responding. The window between stimulus and response is where the quality of every interaction is determined.',
    relatedGuideIds: ['guide-communication-process', 'guide-let-go-of-rage'],
  },
  {
    id: 'eliminate-snap-judgments',
    title: 'Snap Judgments',
    pingMessage: "Catch a snap judgment? Replace with 'I wonder why.'",
    domain: 'language_cognitive',
    replacementAdoptId: 'adopt-suspend-judgment',
    frequency: 'Daily / Situational',
    triggers: [
      'First meeting someone new',
      'Hearing a conflicting opinion',
      'Behavior that pattern-matches to a past negative experience',
    ],
    replacementNote:
      'Replaced by Suspend Judgment — catch the certainty, replace with curiosity, and ask one more question before forming an opinion.',
  },
  {
    id: 'eliminate-phone-pickup',
    title: 'Reflexive Phone Pickup',
    pingMessage: 'Did you grab your phone without a reason? Put it back.',
    domain: 'professional',
    replacementAdoptId: 'adopt-deliberate-communication',
    frequency: 'Daily — automatic background',
    triggers: [
      'Any lull or friction in the current task',
      'Notification sounds or visual alerts',
      'Boredom before difficulty has produced any output',
      'Phone within sight or reach',
    ],
    whyItsCostly:
      'A silent phone on the desk — face-down, notifications off — measurably reduces cognitive performance vs. phone in another room. Every check trains the brain to expect a switch every few minutes; the habit fires on its own afterward and cannot be switched off by willpower alone.',
    replacementNote:
      'The replacement is environment design, not discipline — phone out of the room during focus sessions. See Digital Discipline.',
    relatedGuideIds: ['guide-digital-discipline', 'guide-attention-fragmentation'],
  },
  {
    id: 'eliminate-interrupting',
    title: 'Interrupting Others',
    pingMessage: 'Did you cut someone off? Pause. Let them finish.',
    domain: 'social',
    replacementAdoptId: 'adopt-active-listening',
    frequency: 'Situational',
    triggers: [
      'Excitement about the topic',
      'Knowing what they’re about to say',
      'Disagreement creating urgency',
      'Discomfort with silence',
    ],
    replacementNote:
      'Replaced by Active Listening — body toward speaker, reflect before responding, and notice when your mind drafts a reply while they’re still talking.',
    relatedGuideIds: ['guide-communication-process'],
  },
  {
    id: 'eliminate-slouching',
    title: 'Slouching',
    pingMessage: 'Catch yourself slouching? Reset spine and shoulders.',
    domain: 'physical',
    replacementAdoptId: 'adopt-dominant-posture',
    frequency: 'Daily — habitual background',
    triggers: [
      'Extended sitting (desk, phone, eating)',
      'Fatigue',
      'Unfamiliar or high-status social environments',
      'Scrolling on a device',
    ],
    replacementNote:
      'Replaced by Dominant / Grounded Posture — the body and mind have a two-way relationship; posture is read before you speak and felt before you move.',
    relatedGuideIds: ['guide-dominant-posture'],
  },
  {
    id: 'eliminate-eye-avoidance',
    title: 'Eye Avoidance',
    pingMessage: 'Did you look away too quickly? Hold three seconds.',
    domain: 'social',
    replacementAdoptId: 'adopt-eye-contact',
    frequency: 'Situational',
    triggers: [
      'Disagreement or confrontation',
      'Speaking with someone perceived as higher status',
      'Receiving praise or attention',
      'Pauses while thinking',
    ],
    replacementNote:
      'Replaced by Eye Contact — three-second holds. Gaze avoidance is the primary non-verbal signal of speaker uncertainty.',
    relatedGuideIds: ['guide-eye-contact'],
  },
  {
    id: 'eliminate-ruminating',
    title: 'Ruminating on Past Mistakes',
    pingMessage: "Caught looping? Label it 'thinking' and refocus.",
    domain: 'emotional',
    replacementAdoptId: 'adopt-compassionate-curiosity',
    frequency: 'Daily / Situational',
    triggers: [
      'After a perceived social failure',
      'Unresolved conflict',
      'Irreversible decisions',
    ],
    replacementNote:
      'Journal to extract the lesson, then deliberate closure — write one sentence: "What I’ll do differently is ___." Then stop. See the Rumination Interrupt program for the full protocol.',
    relatedGuideIds: ['guide-rumination-interrupt'],
  },
  {
    id: 'eliminate-rage-spiral',
    title: 'Rage Spirals',
    pingMessage: 'Notice rising tension. Name it. Breathe out slowly.',
    domain: 'emotional',
    replacementAdoptId: 'adopt-let-go-of-rage',
    frequency: 'Situational',
    triggers: [
      'Stress or fatigue amplifying everything',
      'Residual arousal from earlier unrelated triggers',
      'Repeat triggers from the same person or situation',
    ],
    replacementNote:
      'Replaced by Let Go of Rage — the initial neurochemical wave clears in ~90 seconds; everything after that is a choice to keep feeding it.',
    relatedGuideIds: ['guide-let-go-of-rage'],
  },
  {
    id: 'eliminate-news-doomscroll',
    title: 'News Doomscrolling',
    pingMessage: 'Caught doomscrolling? Close it. Move your body.',
    domain: 'professional',
    replacementAdoptId: 'adopt-daily-meditation',
    frequency: 'Daily — automatic background',
    triggers: [
      'Any lull or friction in the current task',
      'Phone within reach',
      'Anxiety seeking a target',
      'Bedtime',
    ],
    whyItsCostly:
      'Variable rewards (the same mechanic as slot machines) keep the loop alive. The habit of scanning for novelty trains attention to fragment everywhere — not just on the feed.',
    replacementNote:
      'Replace input with output: a daily mindfulness session, or a walk without a destination. Restore directed attention rather than continuing to fragment it.',
    relatedGuideIds: ['guide-digital-discipline', 'guide-attention-fragmentation'],
  },
  {
    id: 'eliminate-overexplaining',
    title: 'Over-explaining Decisions',
    pingMessage: 'Caught defending a "no"? State the decision. Stop.',
    domain: 'social',
    replacementAdoptId: 'adopt-deliberate-communication',
    frequency: 'Situational',
    triggers: [
      'Saying no to someone with higher status or insistence',
      'Discomfort with the silence after a decision',
      'Anticipating disapproval',
    ],
    replacementNote:
      'Replaced by Deliberate Communication — state the decision, then let silence land. Filling silence is the single most common way speakers undercut their own credibility.',
    relatedGuideIds: ['guide-communication-process'],
  },
  {
    id: 'eliminate-nervous-laughter',
    title: 'Nervous Laughter',
    pingMessage: "Slow exhale. Eyes neutral. Don't laugh through it.",
    domain: 'social',
    replacementAdoptId: 'adopt-dont-laugh',
    frequency: 'Situational',
    triggers: [
      'Unexpected absurdity in a serious context',
      'Nervous energy misrouted as humor',
      'Pressure that creates involuntary laughter',
    ],
    replacementNote:
      'Replaced by Don’t Laugh — redirection, not suppression. Slow exhale, jaw loose, attention on the other person and what this moment means to them.',
    relatedGuideIds: ['guide-dont-laugh', 'guide-poker-face'],
  },
];
