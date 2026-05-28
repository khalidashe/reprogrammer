import type { CoreStory, ScienceSection } from './types';

export const CORE_STORIES: CoreStory[] = [
  {
    id: 'story-eye-tea-room',
    index: 1,
    title: 'The Room That Knew You Were There',
    narrative:
      'Newcastle University, 2006. A staff tea room — ~48 people, no cashier, no camera. A price list on the wall and a wooden box with a slot. Staff pay on the honor system. Nobody is watching.\n\nDr. Melissa Bateson, Dr. Daniel Nettle, and Dr. Gilbert Roberts change one thing: for ten weeks they alternate the image above the price list — some weeks flowers, some weeks a close-cropped photograph of human eyes staring directly outward. Nobody is told.\n\nFlower weeks: ordinary contributions. Eye weeks: contributions 176% higher. Same people. Same coffee. Same prices. One photograph.',
    whatItReveals:
      'The people weren’t dishonest — most paid either way. But how much they paid shifted based on perceived observation. Humans evolved where reputation was survival; the brain developed fast, unconscious circuitry to detect social observers and modulate behavior. It fires before conscious thought. A photograph triggers it.\n\nThe effect replicated across dozens of settings: 35% reduction in antisocial behavior (meta-analysis, 15 experiments) · 48% higher donations (supermarket charity box) · 4–5x less littering (eye-image leaflets).',
    principle:
      'Your behavior is not fixed — it is a response to context. Design the context, and you shape the behavior.',
    research: [
      { fact: 'Watching eyes: 176% higher contributions', source: 'Bateson, Nettle & Roberts, 2006 (PMC1686213)' },
      { fact: '35% reduction in antisocial behavior', source: 'Meta-analysis, 15 experiments, 2017' },
      { fact: '48% higher donations in a supermarket charity box', source: 'Ernest-Jones, Nettle & Bateson, 2011 (PMC4671191)' },
      { fact: '4–5x less littering with eye-image leaflets', source: 'Fathi, Bateson & Nettle, 2014 (PMC10437101)' },
    ],
    connection:
      'Reprogrammer is a context-design system. Every behavior you adopt is a deliberate change to your internal and external environment. You are not fighting your defaults — you are redesigning the room.',
  },
  {
    id: 'story-45b-shortcut',
    index: 2,
    title: 'The $45 Billion Shortcut',
    narrative:
      'Somewhere right now someone is reading about discipline while avoiding what requires it. Someone else is on their third nootropic stack this year. Another person has seventeen self-improvement books with highlights in the first three chapters and a habit tracker opened twice in January. None of these people are lazy — they are doing exactly what the brain is designed to do.\n\nIn 1949, linguist George Kingsley Zipf documented the Principle of Least Effort: across language, behavior, and decision-making, humans consistently choose the path that minimizes total effort. The brain is 2% of body mass but consumes 20% of energy. Evolution built a brain that conserves.\n\nThe global nootropics market: $6 billion, projected $11.7 billion by 2033. The broader self-improvement industry: $45.7 billion globally. Americans alone: $13.4 billion annually. Meanwhile, the actual mechanism of cognitive improvement — challenge, learning, experience, reflection — is not consumption. It is doing.',
    whatItReveals:
      'The supplement aisle sells System 2 effort at System 1 prices. Swallow a pill and feel like you’ve invested in your cognition. Download an app and feel like you’ve started the work. The feeling is real. The outcome is not.\n\nActive learning improves retention 54% vs. passive instruction. The generation effect (126 studies): information generated beats information received. The 70-20-10 model: 70% of meaningful development from challenging real-world practice, 20% from relationships, 10% from content consumption.',
    principle:
      'The brain is not changed by what you consume. It is changed by what you do.',
    research: [
      { fact: 'Active learning improves retention 54% over passive instruction', source: 'Engageli summary of education research' },
      { fact: 'Generation effect — meta-analysis, 126 studies: information generated beats information received', source: 'Bertsch et al., 2007' },
      { fact: '70-20-10 development model: 70% practice, 20% relationships, 10% content', source: 'Center for Creative Leadership' },
      { fact: 'Self-improvement market $45.7B globally; nootropics $6B → projected $11.7B by 2033', source: 'Industry reports' },
    ],
    connection:
      'Reprogrammer provides structure: framework, science, sequence, tracking. It cannot provide the repetition. That is yours. Read the guides and don’t practice = nothing changes. The shortcut version produces the feeling of progress and none of the results.',
  },
  {
    id: 'story-invisible-contagion',
    index: 3,
    title: 'The Invisible Contagion',
    narrative:
      'Harvard Medical School and UC San Diego, 2007. Nicholas Christakis and James Fowler gain access to the Framingham Heart Study — a dataset tracking 12,067 people across 32 years, recording not just their health but their friendships, their neighbors, their siblings, their coworkers.\n\nThey ask a question that seems almost too simple: does obesity spread between people who know each other? It does. When a Framingham resident becomes obese, their close friends become 57% more likely to become obese — even after controlling for shared diets and neighborhoods. The risk drops but does not disappear at two degrees of separation (+20%), or at three (+10%). At four degrees, the effect vanishes.\n\nThe same pattern holds for happiness: each additional happy friend increases your own likelihood of being happy by 9%, propagating through three degrees. For smoking cessation: when someone quits, their immediate connections become 67% more likely to quit, their connections’ connections 36% more likely, and at the third degree, 11%.\n\nA year earlier, at Yale (1963), Stanley Milgram had already shown the situational mechanism at close range: 65% of participants administered the maximum voltage shock to a stranger because a man in a lab coat said "please continue." And in 1951, Solomon Asch had shown it even for trivial judgments with no stakes — 75% of real participants conformed at least once to an obviously wrong group answer.\n\nNature Communications, 2024: random-roommate assignment shows the causal version. Being randomly placed with a higher-GPA roommate causally increases your own GPA. The effect grows stronger the longer you share a room.',
    whatItReveals:
      'This is the mechanism every proverb knew but couldn’t quantify. The data makes it precise: your social environment is not a backdrop to your behavior — it is an active determinant of it, operating below the threshold of awareness, propagating outward through three layers of your network. Designing your social environment is not elitism or coldness. It is the same logic as removing the phone from the room.',
    principle:
      'You don’t just choose your friends. You choose your future behavior, your health, and your defaults.',
    research: [
      { fact: 'Friend becoming obese → 57% more likely to become obese; effect propagates 3 degrees (+20%, +10%); vanishes at the 4th', source: 'Christakis & Fowler, 2007 (NEJM)' },
      { fact: 'Each additional happy friend +9% own happiness; smoking cessation spreads 67% → 36% → 11% across 3 degrees', source: 'Christakis & Fowler, 2008 (BMJ)' },
      { fact: '65% administered maximum voltage shock under authority pressure', source: 'Milgram, 1963 (Yale obedience studies)' },
      { fact: '75% conformed at least once to an obviously wrong group answer; control error rate <1%', source: 'Asch, 1951' },
      { fact: 'Random higher-GPA roommate causally increased student GPA; effect grew with time together', source: 'Nature Communications, 2024 (PMC11156860)' },
    ],
    connection:
      'Every person in your daily environment is an active variable in the equation that determines who you become. Remove the slot machine, don’t fight the pull — and apply the same logic to the people, feeds, and social contexts you expose yourself to daily.',
  },
];

export const SCIENCE_SECTION: ScienceSection = {
  title: 'The Science',
  intro:
    'Every recommendation in Reprogrammer rests on the same biological premise: the brain is physically alterable across the full lifespan, and behavior is the chisel. Below is the evidence base.',
  topics: [
    {
      heading: 'Neuroplasticity',
      body: 'The brain is physically altered by experience at every life stage. The fixed adult brain model is now considered wrong.',
      bullets: [
        'Neuroplasticity operates continuously across the full lifespan (PMC10741468).',
        'Adult hippocampal neurogenesis confirmed well into late adulthood (Karolinska / Science, 2025).',
        '"You can retrain your brain, tap into new skills, and maybe learn a new language, no matter your age" (Mayo Clinic Press).',
      ],
    },
    {
      heading: 'New Skills Physically Grow the Brain',
      body: 'Each neural circuit activation triggers long-term potentiation — synaptic connections become more efficient. Repeat → the pathway becomes faster, more automatic, more deeply encoded.',
      bullets: [
        'New skills cause measurable neural pathway growth (Caltech / ScienceDaily, 2019).',
        'Sustained intellectual stimulation enhances functional connectivity and preserves memory, attention, processing speed (PMC9775149).',
      ],
    },
    {
      heading: 'Synaptic Density → Cognition',
      body: 'Higher synaptic density predicts global cognition across all cortical regions.',
      bullets: [
        'Significant positive association between synaptic density and cognition (PMC9381645, PET imaging).',
        'Increased synaptic efficiency: 67% faster memory recall, 17% increase in inter-regional brain synchrony (Frontiers in Computational Neuroscience, 2026).',
      ],
    },
    {
      heading: 'Cognitive Reserve',
      body: 'Every demanding mental activity is a deposit into structural brain resilience — delays cognitive decline measurably.',
      bullets: [
        'High reserve by 69 significantly reduces memory/thinking decline even from a low childhood baseline (Alzheimer’s Research UK).',
        'Structured learning programs: 11.4% memory improvement vs. 0.3% control (PLOS One PMC12488004, 2025).',
      ],
    },
    {
      heading: 'Habits = Encoded Neural Infrastructure',
      body: 'A habit is a behavioral sequence encoded in the basal ganglia — no longer requiring the prefrontal cortex to run. The Starting → In Progress → Habitual stages map directly to this: Starting = prefrontal cortex working hard. Habitual = basal ganglia running it for free.',
      bullets: [
        'Brain activity measurably shifts from prefrontal cortex to basal ganglia as habits form (MIT / Dr. Ann Graybiel).',
        'Transfer reduces cognitive energy cost by up to 90%.',
        'Average habit formation: 66 days (range 18–254) (UCL / Phillippa Lally, 2010).',
      ],
    },
    {
      heading: 'Identity Follows Action',
      body: 'The brain does not maintain a sharp distinction between what you do and who you are. A behavior practiced consistently enough stops being something you choose and becomes something you are — encoded in the basal ganglia as automatic self-expression. You do not need to feel like a different person before becoming one. Act → brain encodes → identity follows.',
    },
  ],
  summary: [
    { fact: 'Neuroplasticity continues across full lifespan', source: 'PMC10741468; Mayo Clinic' },
    { fact: 'Adult hippocampal neurogenesis confirmed', source: 'Karolinska / Science, 2025' },
    { fact: 'New skills cause measurable neural pathway growth', source: 'Caltech / ScienceDaily, 2019' },
    { fact: 'Synaptic density predicts memory and cognition', source: 'PMC9381645' },
    { fact: '67% faster recall from increased synaptic efficiency', source: 'Frontiers Comp. Neuroscience, 2026' },
    { fact: 'Structured learning → 11.4% memory improvement', source: 'PLOS One PMC12488004, 2025' },
    { fact: 'Cognitive reserve delays memory decline', source: 'Alzheimer’s Research UK' },
    { fact: 'Habit formation averages 66 days (range 18–254)', source: 'UCL / Phillippa Lally, 2010' },
    { fact: 'Habit execution reduces prefrontal energy cost ~90%', source: 'MIT / Dr. Ann Graybiel' },
    { fact: '72% of behavioral intentions are never acted on', source: 'Sheeran, 2002 (422 studies, 82,107 participants)' },
    { fact: 'Announcing identity-relevant goals compromises follow-through', source: 'Gollwitzer et al., 2009 (Psychological Science)' },
    { fact: 'Forward movement is the strongest driver of motivation — the Progress Principle', source: 'Amabile & Kramer, 2011 (HBS)' },
    { fact: 'False Hope Syndrome: unrealistic timelines drive abandonment', source: 'Polivy & Herman, 2000/2002' },
  ],
};
