import type { AdoptTemplate } from '../library-content';

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
    body: `Mirror drill: feet shoulder-width, spine tall, shoulders back and down, chin level — 2 min daily. Set recurring reminders to check posture. Before high-stakes situations: hold dominant posture 2 min in private.

**Related:** [[Dominant Posture]]`,
  },
  {
    id: 'adopt-poker-face',
    title: 'Poker Face',
    pingMessage: 'Hold neutral. What does your face look like right now?',
    domain: 'social',
    practiceType: 'mental_physical',
    intervalMinutes: 20,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-poker-face',
    featured: true,
    body: `Mirror drill: hold neutral expression 60 seconds while imagining funny/shocking/irritating scenarios. Identify your leak tells (eyebrow raise, mouth twitch, nostril flare) — target those specifically. Mental anchor: pair neutral face with a calm internal phrase ("steady").

**Related:** [[Poker Face]] · [[Don't Laugh]]`,
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
    body: `Hold eye contact for one complete thought (3–5 seconds), then move to someone else. Practice in low-stakes conversations first — hold gaze during pauses, not just while speaking. Most people break gaze while thinking. Train that habit out first.

**Related:** [[Eye Contact]]`,
  },
  {
    id: 'adopt-deliberate-communication',
    title: 'Deliberate Communication',
    pingMessage: 'One slow inhale before responding. Are you about to react?',
    domain: 'social',
    practiceType: 'mental_physical',
    intervalMinutes: 20,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-communication-process',
    featured: true,
    body: `One slow inhale before responding (buys 2–3 seconds). Before speaking: "Is this true? Is this useful? Is this the right moment?" In groups: speak second or third — you have more information than whoever goes first.

**Related:** [[Communication Process]]`,
  },
  {
    id: 'adopt-think-in-english',
    title: 'Think in English',
    pingMessage: 'What are you thinking right now? Say it in English.',
    domain: 'language_cognitive',
    practiceType: 'mental',
    intervalMinutes: 15,
    window: { from: '09:00', to: '21:00' },
    body: `Narrate your day internally in English. Problem-solve in English first. Notice when you default to another language and redirect. Start with one activity per day; expand gradually.`,
  },
  {
    id: 'adopt-understand-pov',
    title: "Understand Others' Point of View",
    pingMessage: 'Replay the last conversation from their side.',
    domain: 'social',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    body: `After any disagreement, replay it from the other person's perspective. Before a hard conversation: "What do they want? What are they afraid of?" Journal exercise: write a first-person account of a recent conflict as the other person.`,
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
    body: `Sympathy acknowledges pain; empathy enters it. When someone shares a problem, stay in the feeling before fixing. Internal check: "Am I about to say what I would feel, or what they actually feel?" Read fiction deliberately — builds theory of mind faster than self-help.

**Related:** [[Empathy on Command]]`,
  },
  {
    id: 'adopt-let-go-of-rage',
    title: 'Let Go of Rage',
    pingMessage: 'Notice your body. Is there tension? Name it.',
    domain: 'emotional',
    practiceType: 'mental_physical',
    intervalMinutes: 20,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-let-go-of-rage',
    body: `Identify the physical signal before emotion peaks (jaw tension, chest heat, shallow breath) — that's the interrupt window. Pause 5 seconds: "Is this worth what it costs me?" Reframe: "This has no power over who I become." Physical release separate from the situation: exercise, controlled breath, cold water. Journal recurring triggers — address the root.

**Related:** [[Fear & Panic]] · [[Let Go of Rage]]`,
  },
  {
    id: 'adopt-suspend-judgment',
    title: 'Suspend Judgment',
    pingMessage: "Catch a judgment forming. Replace with: 'I wonder why.'",
    domain: 'language_cognitive',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    body: `Catch judgments mid-formation — they feel like certainty; that's the tell. Replace: "That's wrong" → "I wonder why they think that." Ask one more question before forming an opinion. Weekly review: recall one judgment that turned out to be wrong — what did you miss?`,
  },
  {
    id: 'adopt-active-listening',
    title: 'Active Listening',
    pingMessage: 'Body toward speaker. Phone away. Reflect before responding.',
    domain: 'social',
    practiceType: 'mental_physical',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-communication-process',
    body: `Baseline: eyes on speaker, body toward them, phone away. Reflect before responding: "So what I'm hearing is..." — wait for confirmation. Let pauses breathe. Notice when your mind drafts a reply while they're still talking — that's what to interrupt.

**Related:** [[Small Talk]]`,
  },
  {
    id: 'adopt-dont-laugh',
    title: "Don't Laugh",
    pingMessage: 'Slow exhale. Eyes on a neutral point. Steady.',
    domain: 'social',
    practiceType: 'mental_physical',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    libraryGuideId: 'guide-dont-laugh',
    body: `Physical: slow exhale through nose, jaw slightly relaxed, eyes on a neutral point. Mental anchor: shift attention from what's funny to the person and what this moment means to them. Drill: watch funny content in a mirror; practice holding neutral.

**Related:** [[Don't Laugh]]`,
  },
  {
    id: 'adopt-daily-meditation',
    title: 'Daily Mindfulness Meditation',
    pingMessage: '20 minutes. Breath at the nostrils. Nothing else.',
    domain: 'emotional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '07:00', to: '22:00' },
    body: `20 minutes daily. Sit comfortably. Focus on breath at the nostrils. When a thought arises, notice it without engaging — let it pass like a cloud. Return to breath. The point is not to have no thoughts; it is to practice noticing thoughts without being swept away by them. This single habit is the foundation of every other behavior change — it trains the Conscious Self to observe the Automatic Self rather than be run by it.

**Why it works:** Mindfulness physically changes brain structure (prefrontal cortex thickens; amygdala reactivity decreases). Regular practice reduces stress hormones, improves impulse control, increases empathy, and improves sleep. Each session is a rep in the psychic gym.

**Related:** [[Deep Focus]] · [[Digital Discipline]]`,
  },
  {
    id: 'adopt-three-good-things',
    title: 'Three Good Things',
    pingMessage: 'Three good things from today. Feel each one.',
    domain: 'emotional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '20:00', to: '23:00' },
    body: `Each night before sleep: recall three good things that happened today — small or large. Focus on the feeling, not the fact. Is it pride? Warmth? Relief? Let yourself notice the physical sensation of that feeling. Visualize new happiness circuits forming.

**Why it works:** Studies show this practice increases measurable happiness and decreases depression symptoms for up to 6 months. It trains selective attention toward the positive — not by denying the negative, but by widening the frame. Most of what makes you happy has nothing to do with possessions, wealth, or status.

**Related:** [[Rumination Interrupt]]`,
  },
  {
    id: 'adopt-compassionate-curiosity',
    title: 'Compassionate Curiosity',
    pingMessage: "Notice without judging. Ask why, not what's wrong with you.",
    domain: 'emotional',
    practiceType: 'mental',
    intervalMinutes: 30,
    window: { from: '09:00', to: '21:00' },
    body: `When you notice you've done something self-destructive, or feel the Inner Critic attacking: switch from judge to investigator. Ask *why* rather than *what's wrong with me*. "I wonder what made me react that way?" — not "I'm an idiot." This is not permissiveness; it is the stance a good therapist takes. Patience + warmth + genuine interest in what makes you tick.

**Why it works:** Self-hate keeps self-destructive patterns locked in because it provides no information — only punishment. Compassionate curiosity provides information. It is the prerequisite for changing any deep pattern. You cannot fix what you won't look at directly.`,
  },
  {
    id: 'adopt-behavioral-psych',
    title: 'Behavioral Psychology Foundations',
    pingMessage: 'Read one page. Then apply it to one behavior today.',
    domain: 'language_cognitive',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '08:00', to: '21:00' },
    body: `Understanding how habits form makes every other behavior easier. Read one source, then immediately apply it to one behavior — don't read all four before acting.

**Resources:** *Thinking, Fast and Slow* (Kahneman) · *Atomic Habits* (Clear) · *Tiny Habits* (Fogg) · *The Power of Habit* (Duhigg) · *Rewire* (O'Connor)`,
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
    body: `Theory behind the physical drills. After one source: go to the mirror and practice one physical behavior immediately.

**Resources:** *What Every Body Is Saying* (Navarro) · *The Definitive Book of Body Language* (Pease) · Amy Cuddy TED Talk · *Spy the Lie* (Houston)`,
  },
  {
    id: 'adopt-emotional-intelligence',
    title: 'Emotional Intelligence & Regulation',
    pingMessage: 'Apply one NVC framework to one real conversation this week.',
    domain: 'emotional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '09:00', to: '21:00' },
    body: `Foundation for the mental behaviors. Knowing the neuroscience of emotion (amygdala hijack, window of tolerance) helps design better mental practice. Apply one NVC framework (observation/feeling/need/request) to one real conversation this week.

**Resources:** *Emotional Intelligence* (Goleman) · *The Body Keeps the Score* (van der Kolk) · *Nonviolent Communication* (Rosenberg) · *Meditations* (Marcus Aurelius) · *Enchiridion* (Epictetus) · *Rewire* (O'Connor)`,
  },
  {
    id: 'adopt-topic-mastery',
    title: 'Topic Mastery',
    pingMessage: 'Can you explain this without notes? Where does it break?',
    domain: 'professional',
    practiceType: 'learning',
    intervalMinutes: 60,
    window: { from: '09:00', to: '21:00' },
    body: `No delivery skill compensates for uncertainty about the subject. The audience detects the difference between a speaker who knows something and one who has prepared to sound like they do. Deep understanding removes hesitation, enables improvisation, and generates conviction the body broadcasts automatically.

**Method:** For any topic you will speak on, go one level deeper than the audience. Understand the underlying mechanism, not just the surface claim. Test your understanding by trying to explain it without notes — if you falter, that's a gap. Feynman Technique: explain the concept as if to a twelve-year-old; where the explanation breaks down is where the understanding does. Repeat until it doesn't break.

**Related:** [[Public Speaking]] · [[Think in English]]`,
  },
];
