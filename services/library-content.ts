import { Domain, PracticeType } from '../types';

export interface LibraryGuide {
  id: string;
  title: string;
  domain: Domain;
  practiceType: PracticeType;
  estimatedMinutes: number;
  summary: string;
}

export interface LibraryPackage {
  id: string;
  title: string;
  description: string;
  guideIds: string[];
}

export interface AdoptTemplate {
  id: string;
  title: string;
  pingMessage: string;
  domain: Domain;
  practiceType: PracticeType;
  intervalMinutes: number;
  window: { from: string; to: string };
  libraryGuideId?: string;
  featured?: boolean;
}

export interface EliminateTemplate {
  id: string;
  title: string;
  pingMessage: string;
  domain: Domain;
  replacementAdoptId: string;
}

export const LIBRARY_GUIDES: LibraryGuide[] = [
  {
    id: 'guide-attention-fragmentation',
    title: 'Attention Fragmentation',
    domain: 'professional',
    practiceType: 'mental',
    estimatedMinutes: 7,
    summary: 'Why the brain learns to flinch between tasks, and how to retrain a single locus of attention.',
  },
  {
    id: 'guide-body-language',
    title: 'Body Language',
    domain: 'physical',
    practiceType: 'physical',
    estimatedMinutes: 8,
    summary: 'The non-verbal signal channel runs faster than speech. Practice owning the channel before words.',
  },
  {
    id: 'guide-communication-process',
    title: 'Communication Process',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 9,
    summary: 'Listen → understand → respond. Drop a step and the loop breaks.',
  },
  {
    id: 'guide-confidence',
    title: 'Confidence',
    domain: 'emotional',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Confidence follows action, not the other way around. Action → encode → identity.',
  },
  {
    id: 'guide-deep-focus',
    title: 'Deep Focus',
    domain: 'professional',
    practiceType: 'mental',
    estimatedMinutes: 8,
    summary: 'The 90-minute ultradian arc — what to do with it, what to never interrupt it for.',
  },
  {
    id: 'guide-digital-discipline',
    title: 'Digital Discipline',
    domain: 'professional',
    practiceType: 'dual',
    estimatedMinutes: 7,
    summary: 'Remove the slot machine. Most "self-control" failures are environment-design failures.',
  },
  {
    id: 'guide-dominant-posture',
    title: 'Dominant Posture',
    domain: 'physical',
    practiceType: 'physical',
    estimatedMinutes: 5,
    summary: 'Feet planted. Spine tall. Chin level. Your body teaches your brain what state it is in.',
  },
  {
    id: 'guide-dont-laugh',
    title: 'Don’t Laugh',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Composure in serious moments is trainable. The mechanism is breath, not willpower.',
  },
  {
    id: 'guide-empathy-on-command',
    title: 'Empathy on Command',
    domain: 'emotional',
    practiceType: 'mental',
    estimatedMinutes: 7,
    summary: 'Before responding, replay the situation from their viewpoint. Two-second pause changes the answer.',
  },
  {
    id: 'guide-eye-contact',
    title: 'Eye Contact',
    domain: 'social',
    practiceType: 'physical',
    estimatedMinutes: 5,
    summary: 'Three-second holds. Look between the eyes if locking on feels intense. Repeat 50 times today.',
  },
  {
    id: 'guide-fear-and-panic',
    title: 'Fear & Panic',
    domain: 'emotional',
    practiceType: 'dual',
    estimatedMinutes: 9,
    summary: 'Why the freeze response fires before thought, and how to interrupt it with the breath.',
  },
  {
    id: 'guide-let-go-of-rage',
    title: 'Let Go of Rage',
    domain: 'emotional',
    practiceType: 'dual',
    estimatedMinutes: 8,
    summary: 'Name the body sensation, then the emotion, then the trigger. The naming is the regulator.',
  },
  {
    id: 'guide-poker-face',
    title: 'Poker Face',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Emotional neutrality on command is a muscle. Train it before you need it.',
  },
  {
    id: 'guide-public-speaking',
    title: 'Public Speaking',
    domain: 'professional',
    practiceType: 'dual',
    estimatedMinutes: 10,
    summary: 'You are not afraid of speaking — you are afraid of social rejection. Decouple the two.',
  },
  {
    id: 'guide-rumination-interrupt',
    title: 'Rumination Interrupt',
    domain: 'emotional',
    practiceType: 'mental',
    estimatedMinutes: 7,
    summary: 'Catch the loop, label it ("thinking"), and break the chain with a 30-second somatic anchor.',
  },
  {
    id: 'guide-small-talk',
    title: 'Small Talk',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Small talk is not the goal — it is the bridge. Three sentences and an open question.',
  },
];

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
  },
];

export const ADOPT_TEMPLATES: AdoptTemplate[] = [
  {
    id: 'adopt-dominant-posture',
    title: 'Dominant / Grounded Posture',
    pingMessage: 'Feet shoulder-width. Spine tall. Chin level. Check now.',
    domain: 'physical',
    practiceType: 'physical',
    intervalMinutes: 15,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-dominant-posture',
    featured: true,
  },
  {
    id: 'adopt-poker-face',
    title: 'Poker Face',
    pingMessage: 'Hold neutral. What does your face look like right now?',
    domain: 'social',
    practiceType: 'dual',
    intervalMinutes: 20,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-poker-face',
    featured: true,
  },
  {
    id: 'adopt-eye-contact',
    title: 'Eye Contact',
    pingMessage: 'Three-second hold. Eyes meet eyes.',
    domain: 'social',
    practiceType: 'physical',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-eye-contact',
    featured: true,
  },
  {
    id: 'adopt-deliberate-communication',
    title: 'Deliberate Communication',
    pingMessage: 'One slow inhale before responding. Are you about to react?',
    domain: 'social',
    practiceType: 'dual',
    intervalMinutes: 20,
    window: { from: '09:00', to: '21:00' },
    featured: true,
  },
  {
    id: 'adopt-think-in-english',
    title: 'Think in English',
    pingMessage: 'What are you thinking right now? Say it in English.',
    domain: 'language_cognitive',
    practiceType: 'mental',
    intervalMinutes: 15,
    window: { from: '09:00', to: '21:00' },
  },
  {
    id: 'adopt-understand-pov',
    title: "Understand Others' Point of View",
    pingMessage: 'Replay the last conversation from their side.',
    domain: 'social',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
  },
  {
    id: 'adopt-empathy',
    title: 'Sympathy & Empathy',
    pingMessage: 'Before responding — what is this person actually feeling?',
    domain: 'emotional',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-empathy-on-command',
  },
  {
    id: 'adopt-let-go-of-rage',
    title: 'Let Go of Rage',
    pingMessage: 'Notice your body. Is there tension? Name it.',
    domain: 'emotional',
    practiceType: 'dual',
    intervalMinutes: 20,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-let-go-of-rage',
  },
  {
    id: 'adopt-suspend-judgment',
    title: 'Suspend Judgment',
    pingMessage: "Catch a judgment forming. Replace with: 'I wonder why.'",
    domain: 'language_cognitive',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
  },
  {
    id: 'adopt-active-listening',
    title: 'Active Listening',
    pingMessage: 'Body toward speaker. Phone away. Reflect before responding.',
    domain: 'social',
    practiceType: 'dual',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-communication-process',
  },
  {
    id: 'adopt-dont-laugh',
    title: "Don't Laugh",
    pingMessage: 'Slow exhale. Eyes on a neutral point. Steady.',
    domain: 'social',
    practiceType: 'dual',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-dont-laugh',
  },
  {
    id: 'adopt-daily-meditation',
    title: 'Daily Mindfulness Meditation',
    pingMessage: '20 minutes. Breath at the nostrils. Nothing else.',
    domain: 'emotional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '07:00', to: '22:00' },
  },
  {
    id: 'adopt-three-good-things',
    title: 'Three Good Things',
    pingMessage: 'Three good things from today. Feel each one.',
    domain: 'emotional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '20:00', to: '23:00' },
  },
  {
    id: 'adopt-compassionate-curiosity',
    title: 'Compassionate Curiosity',
    pingMessage: "Notice without judging. Ask why, not what's wrong with you.",
    domain: 'emotional',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
  },
  {
    id: 'adopt-behavioral-psych',
    title: 'Behavioral Psychology Foundations',
    pingMessage: 'Read one page. Then apply it to one behavior today.',
    domain: 'language_cognitive',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '08:00', to: '21:00' },
  },
  {
    id: 'adopt-body-language-study',
    title: 'Body Language & Social Dynamics',
    pingMessage: 'One source. Then to the mirror immediately after.',
    domain: 'social',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-body-language',
  },
  {
    id: 'adopt-emotional-intelligence',
    title: 'Emotional Intelligence & Regulation',
    pingMessage: 'Apply one NVC framework to one real conversation this week.',
    domain: 'emotional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '09:00', to: '21:00' },
  },
  {
    id: 'adopt-topic-mastery',
    title: 'Topic Mastery',
    pingMessage: 'Can you explain this without notes? Where does it break?',
    domain: 'professional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '09:00', to: '21:00' },
  },
];

export const ELIMINATE_TEMPLATES: EliminateTemplate[] = [
  {
    id: 'eliminate-other-languages',
    title: 'Defaulting to Other Languages in Thought',
    pingMessage: 'Did you catch yourself thinking in another language? Switch to English.',
    domain: 'language_cognitive',
    replacementAdoptId: 'adopt-think-in-english',
  },
  {
    id: 'eliminate-reactive-responses',
    title: 'Reactive Responses',
    pingMessage: 'Did you react before processing? Breath, then respond.',
    domain: 'social',
    replacementAdoptId: 'adopt-deliberate-communication',
  },
  {
    id: 'eliminate-snap-judgments',
    title: 'Snap Judgments',
    pingMessage: "Catch a snap judgment? Replace with 'I wonder why.'",
    domain: 'language_cognitive',
    replacementAdoptId: 'adopt-suspend-judgment',
  },
  {
    id: 'eliminate-phone-pickup',
    title: 'Reflexive Phone Pickup',
    pingMessage: 'Did you grab your phone without a reason? Put it back.',
    domain: 'professional',
    replacementAdoptId: 'adopt-deliberate-communication',
  },
  {
    id: 'eliminate-interrupting',
    title: 'Interrupting Others',
    pingMessage: 'Did you cut someone off? Pause. Let them finish.',
    domain: 'social',
    replacementAdoptId: 'adopt-active-listening',
  },
  {
    id: 'eliminate-slouching',
    title: 'Slouching',
    pingMessage: 'Catch yourself slouching? Reset spine and shoulders.',
    domain: 'physical',
    replacementAdoptId: 'adopt-dominant-posture',
  },
  {
    id: 'eliminate-eye-avoidance',
    title: 'Eye Avoidance',
    pingMessage: 'Did you look away too quickly? Hold three seconds.',
    domain: 'social',
    replacementAdoptId: 'adopt-eye-contact',
  },
  {
    id: 'eliminate-ruminating',
    title: 'Ruminating on Past Mistakes',
    pingMessage: "Caught looping? Label it 'thinking' and refocus.",
    domain: 'emotional',
    replacementAdoptId: 'adopt-compassionate-curiosity',
  },
  {
    id: 'eliminate-rage-spiral',
    title: 'Rage Spirals',
    pingMessage: 'Notice rising tension. Name it. Breathe out slowly.',
    domain: 'emotional',
    replacementAdoptId: 'adopt-let-go-of-rage',
  },
  {
    id: 'eliminate-news-doomscroll',
    title: 'News Doomscrolling',
    pingMessage: 'Caught doomscrolling? Close it. Move your body.',
    domain: 'professional',
    replacementAdoptId: 'adopt-daily-meditation',
  },
  {
    id: 'eliminate-overexplaining',
    title: 'Over-explaining Decisions',
    pingMessage: 'Caught defending a "no"? State the decision. Stop.',
    domain: 'social',
    replacementAdoptId: 'adopt-deliberate-communication',
  },
  {
    id: 'eliminate-nervous-laughter',
    title: 'Nervous Laughter',
    pingMessage: "Slow exhale. Eyes neutral. Don't laugh through it.",
    domain: 'social',
    replacementAdoptId: 'adopt-dont-laugh',
  },
];

export function featuredTemplates(): AdoptTemplate[] {
  return ADOPT_TEMPLATES.filter((t) => t.featured);
}

export function domainLabel(domain: Domain): string {
  switch (domain) {
    case 'language_cognitive':
      return 'Language & Cognitive';
    case 'physical':
      return 'Physical';
    case 'social':
      return 'Social';
    case 'emotional':
      return 'Emotional';
    case 'creative':
      return 'Creative';
    case 'professional':
      return 'Professional';
  }
}

export function practiceTypeIcon(type: PracticeType): string {
  switch (type) {
    case 'mental':
      return 'brain.head.profile';
    case 'physical':
      return 'figure.walk';
    case 'learning':
      return 'book.fill';
    case 'dual':
      return 'rectangle.stack.fill';
  }
}
