import type { LibraryGuide, LibraryPackage } from './types';

export const LIBRARY_GUIDES: LibraryGuide[] = [
  {
    id: 'guide-attention-fragmentation',
    title: 'Attention Fragmentation',
    domain: 'professional',
    practiceType: 'mental',
    estimatedMinutes: 7,
    summary:
      'Why the brain learns to flinch between tasks, and how to retrain a single locus of attention.',
    story:
      'Stanford, 2009. Eyal Ophir had a hypothesis: people who constantly multitask must be getting good at it. They do it so often, surely they’ve built some advantage.\n\nHe tested heavy vs. light multitaskers on three things: filtering out distractions, switching tasks cleanly, and holding information in mind under interference. He expected heavy multitaskers to excel at at least one.\n\nThey failed all three. Clifford Nass summed it up: "They’re suckers for irrelevancy. Everything distracts them." The people who spent the most time fragmenting their attention hadn’t developed a skill. They had trained themselves to be distracted — and the training transferred everywhere.',
    whatItReveals:
      'Heavy multitasking doesn’t build skill. It builds the habit of fragmentation. The brain adapts to constant context-switches by making them the default — and sustained focus becomes increasingly uncomfortable.\n\nThis is why you can’t simply decide to focus. The decision is being made against years of trained distraction, by a brain calibrated to expect a switch every few minutes.',
    principle:
      'Attention is the sum of where you’ve put it. Train fragmentation and you get fragmentation. Train focus and you get focus.',
    research: [
      {
        fact: 'Heavy multitaskers performed worse than light multitaskers on all three attention tests',
        source: 'Ophir, Nass & Wagner, 2009',
        sourceUrl: 'https://www.pnas.org/doi/10.1073/pnas.0903620106',
      },
      {
        fact: 'A silent phone on the desk — face-down, notifications off — reduces cognitive performance vs. phone in another room',
        source: 'Ward et al., 2017',
        sourceUrl: 'https://www.journals.uchicago.edu/doi/full/10.1086/691462',
      },
      {
        fact: 'Knowledge workers self-interrupt on average every 3 minutes',
        source: 'Mark et al., 2014',
        sourceUrl: 'https://dl.acm.org/doi/10.1145/2556288.2557204',
      },
      {
        fact: 'Recovery after an interruption averages 23 minutes',
        source: 'Mark et al., 2008',
        sourceUrl: 'https://dl.acm.org/doi/10.1145/1357054.1357072',
      },
    ],
    howToApply: [
      {
        heading: '10-minute anchor drill.',
        body: 'Pick one task. Set a timer. Your only job is to notice when attention drifts and bring it back without acting on it. This is the rep. Add 5 minutes per week.',
      },
      {
        heading: 'Phone out of the room.',
        body: 'Not face-down — out. The Ward study is clear: presence alone drains cognition, even when you’re not touching it.',
      },
      {
        heading: 'Name the itch, don’t scratch it.',
        body: 'When the urge to check fires, say internally: "There’s the itch." Then return to the task. Each time you don’t act, you weaken the circuit slightly.',
      },
      {
        heading: 'One window, one task.',
        body: 'Extra tabs are visual prompts to switch. Remove the option.',
      },
      {
        heading: 'Rest between sessions deliberately.',
        body: 'A walk without a destination restores directed attention (Attention Restoration Theory). Scrolling does not — it continues fragmentation in a different direction.',
      },
    ],
    connection:
      'Deep Focus is the target state; this guide explains what’s blocking it. Digital Discipline covers the environment changes that remove the triggers so attention training can actually take hold.',
    relatedGuideIds: ['guide-deep-focus', 'guide-digital-discipline'],
  },
  {
    id: 'guide-body-language',
    title: 'Body Language',
    domain: 'physical',
    practiceType: 'physical',
    estimatedMinutes: 8,
    summary:
      'The non-verbal signal channel runs faster than speech. Practice owning the channel before words.',
    story:
      'Princeton, 2004. Alexander Todorov showed participants a photo of two election candidates for exactly 100 milliseconds — one-tenth of a second. Just their faces. No names, no policies, no background. He asked: who looks more competent?\n\nTheir answers predicted the actual election outcome 70% of the time.\n\nGiving people more time to look didn’t improve accuracy. The judgment was essentially done in the first tenth of a second.',
    whatItReveals:
      'The audience reads your body before they process your words. Open, congruent body language reads as confident and honest. When your body contradicts what you’re saying — arms crossed while claiming openness, gaze dropped while asserting a key point — the body wins. The audience unconsciously reads the body as the truth.',
    principle:
      'Your body delivers the verdict before your words begin. Make sure it’s saying what you mean.',
    research: [
      {
        fact: 'Competence judgments from a 100ms photo predicted 70% of election outcomes',
        source: 'Todorov & Willis, 2006',
        sourceUrl: 'https://journals.sagepub.com/doi/abs/10.1111/j.1467-9280.2006.01750.x',
      },
      {
        fact: 'When verbal and non-verbal signals conflict, the audience interprets through the body',
        source: 'Mehrabian & Ferris, 1967',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/h0024648',
      },
      {
        fact: 'Open postures increase confidence and willingness to act (behavioral effect replicated)',
        source: 'Carney, Cuddy & Yap, 2010',
        sourceUrl: 'https://journals.sagepub.com/doi/abs/10.1177/0956797610383437',
      },
      {
        fact: 'Gesture improves audience retention of specific content',
        source: 'Goldin-Meadow, 2003',
      },
    ],
    howToApply: [
      {
        heading: 'Find your tells.',
        body: 'Film yourself talking for 5 minutes. Watch it without sound. What is your body saying?',
      },
      {
        heading: 'Default to open.',
        body: 'Chest open, arms uncrossed, hands visible, weight even. Closed positions are the exception, not the baseline.',
      },
      {
        heading: 'Anchor key points with gesture.',
        body: 'A deliberate hand movement on your most important claim helps the audience remember it. Keep it intentional, not random.',
      },
      {
        heading: 'Go still under pressure.',
        body: 'Pacing and fidgeting signal anxiety. Plant your feet and let the speech carry the energy.',
      },
      {
        heading: 'Mirror drill — congruence check.',
        body: 'Say something you believe fully. Watch your body. Then say something you’re uncertain about. The difference is exactly what the audience reads.',
      },
    ],
    connection:
      'Body Language is the non-verbal foundation of Public Speaking. It amplifies everything else — Eye Contact lands better from an open body, Confidence shows through posture. See Dominant Posture for the physical base to build on first.',
    relatedGuideIds: [
      'guide-public-speaking',
      'guide-eye-contact',
      'guide-confidence',
      'guide-dominant-posture',
    ],
  },
  {
    id: 'guide-communication-process',
    title: 'Communication Process',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 9,
    summary: 'Listen → understand → respond. Drop a step and the loop breaks.',
    story:
      'Princeton, 2006. Nalini Ambady showed participants silent, 30-second clips of teachers — no words, just body language and facial expression. She asked them to rate the teachers’ quality.\n\nThose ratings predicted end-of-semester course evaluations. Six-second clips worked too.\n\nThe brain forms judgments about communication quality almost instantly. Before a single word is processed.',
    whatItReveals:
      'How you speak signals your inner state before your content lands. A rushed, reactive delivery reads as uncertain. A deliberate pause before responding signals control — not hesitation, but presence.\n\nThe window between stimulus and response is where communication quality is determined. Most people have a window of zero.',
    principle: 'Deliberate communication starts not with your mouth, but with the pause before it.',
    research: [
      {
        fact: '30-second silent clips predict semester-long teacher evaluations',
        source: 'Ambady & Rosenthal, 1993',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.64.3.431',
      },
      {
        fact: 'High-status speakers use fewer first-person pronouns ("I," "me")',
        source: 'Pennebaker et al., 2003',
        sourceUrl: 'https://www.annualreviews.org/doi/10.1146/annurev.psych.54.101601.145041',
      },
      {
        fact: 'Slower speech (~20% reduction) increases perceived credibility',
        source: 'Mehta et al., 2019',
        sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31192632/',
      },
      {
        fact: 'A deliberate pause before speaking reduces perceived anxiety',
        source: 'DePaulo, 1992',
        sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/1557474/',
      },
    ],
    howToApply: [
      {
        heading: 'Pre-response breath.',
        body: 'One slow inhale before responding to anything that matters. Buys 2-3 seconds. In that window: is this true? Is this useful?',
      },
      {
        heading: 'Speak second or third in groups.',
        body: 'You learn what the room thinks, then add precision. Your contribution lands with more weight.',
      },
      {
        heading: 'Drop the "I" opener.',
        body: '"I think this is a good idea" → "This is a good idea because..." Same content. Different signal.',
      },
      {
        heading: 'Slow the first sentence.',
        body: 'The opener sets the frame. Rush it and everything after sounds anxious. Slow just the opening — the rest can be natural.',
      },
      {
        heading: 'Let silence land.',
        body: 'After making a point, stop. Filling silence is the single most common way speakers undercut their own credibility.',
      },
    ],
    connection:
      'Pairs tightly with Small Talk and Public Speaking. The same deliberate pause that works in serious conversations works in casual ones too — grounded, unhurried delivery reads as social confidence in any context.',
    relatedGuideIds: ['guide-small-talk', 'guide-public-speaking'],
  },
  {
    id: 'guide-confidence',
    title: 'Confidence',
    domain: 'emotional',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Confidence follows action, not the other way around. Action → encode → identity.',
    story:
      'Stanford, 1977. Albert Bandura worked with adults who had a lifelong snake phobia — severe enough to shape their daily lives for years. In a single session, they stood progressively closer to a live snake. One small step at a time, at their own pace.\n\nWithin an hour, most were sitting with the snake in their lap.\n\nThe six-month follow-up found something unexpected: their confidence had shifted in unrelated areas. More assertive at work. More willing to negotiate. More likely to take on new challenges. One exposure sequence had changed how they estimated their own capability.\n\nBandura named the mechanism: mastery experience. Not visualization. Not affirmation. Doing something difficult and surviving it updates the brain’s model of what you can do — and the update generalizes.',
    whatItReveals:
      'Confidence is a current estimate, not a fixed trait. The brain runs a continuous calculation: given what I know about myself, what can I do? Every hard thing you do and survive raises the estimate. Easy wins barely register. Hard ones move the needle.\n\nMost confidence advice fails because it targets the feeling without producing the evidence that would justify changing it. The estimate reverts because nothing has happened to justify a new one.',
    principle:
      'Confidence is evidence you produce by doing difficult things in sequence — small to large — until the brain’s estimate catches up with reality.',
    research: [
      {
        fact: 'Single-session guided mastery eliminated lifelong phobias; effects generalized to unrelated domains',
        source: 'Bandura, 1977',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0033-295X.84.2.191',
      },
      {
        fact: 'Self-efficacy is the strongest predictor of behavior change across domains — stronger than knowledge, attitude, or intention',
        source: 'Bandura, 1997; Stajkovic & Luthans, 1998',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0033-2909.124.2.240',
      },
      {
        fact: 'High self-efficacy → harder goals, more persistence, faster recovery from failure',
        source: 'Locke & Latham, 2002',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0003-066X.57.9.705',
      },
      {
        fact: 'Verbal persuasion ("you can do it") is the weakest source of self-efficacy and doesn’t persist without confirming experience',
        source: 'Bandura, 1977',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0033-295X.84.2.191',
      },
    ],
    howToApply: [
      {
        heading: 'Map your gradient.',
        body: 'Find the step that’s uncomfortable but not impossible. A small meeting, a question from the floor. One level above paralysis — not two.',
      },
      {
        heading: 'Debrief after every rep.',
        body: 'Even a bad one. Find one thing that held. The brain needs an anchor for the mastery update.',
      },
      {
        heading: 'Increase difficulty when comfort sets in.',
        body: 'Comfort means you’ve plateaued. A step that no longer produces anxiety no longer builds confidence. Move up.',
      },
      {
        heading: 'Watch someone handle the next level.',
        body: 'Brief vicarious exposure before stepping up gives a small but real self-efficacy boost. Watch, then act — don’t use watching as a substitute for doing.',
      },
      {
        heading: 'Keep a written log.',
        body: 'One sentence after each exposure: what you did, what worked. The default is to remember failures more vividly. The log corrects that asymmetry.',
      },
    ],
    connection:
      'Confidence is the foundation of the Public Speaking package — without it, every other component collapses under pressure. Connects directly to Fear & Panic (the physiological side) and Dominant Posture (proprioceptive feedback that supports the estimate).',
    relatedGuideIds: ['guide-public-speaking', 'guide-fear-and-panic', 'guide-dominant-posture'],
  },
  {
    id: 'guide-deep-focus',
    title: 'Deep Focus',
    domain: 'professional',
    practiceType: 'mental',
    estimatedMinutes: 8,
    summary: 'The 90-minute ultradian arc — what to do with it, what to never interrupt it for.',
    story:
      'Chicago, 1975. Mihaly Csikszentmihalyi studied 10,000 people over 25 years using random beepers to track when they felt their best. His finding: people’s peak experiences happened most often during challenging, focused work — not leisure, not rest.\n\nHe called it flow. The conditions that produce it are specific: a clear goal, immediate feedback, and difficulty matched to your skill level. Miss any one and the state becomes inaccessible.\n\nSeparately, Gloria Mark at UC Irvine tracked knowledge workers throughout their days. She found two things: it takes an average of 23 minutes to fully re-engage with a task after an interruption — and workers interrupt themselves (without any external trigger) every 3 minutes on average.',
    whatItReveals:
      'Deep focus isn’t a natural state that distraction corrupted. It’s a cultivated state with entry conditions. You can’t force your way into it through willpower — you have to design the conditions first. Every interruption resets the clock. And most of those interruptions are self-generated.',
    principle:
      'Deep focus is a state with entry conditions. Design the conditions and it becomes accessible. Skip them and it becomes impossible.',
    research: [
      {
        fact: 'Flow requires clear goals, immediate feedback, and challenge matched to skill',
        source: 'Csikszentmihalyi, 1990',
      },
      {
        fact: 'Recovery after an interruption averages 23 minutes',
        source: 'Mark et al., 2008',
        sourceUrl: 'https://dl.acm.org/doi/10.1145/1357054.1357072',
      },
      {
        fact: 'Knowledge workers self-interrupt every 3 minutes on average',
        source: 'Mark et al., 2014',
        sourceUrl: 'https://dl.acm.org/doi/10.1145/2556288.2557204',
      },
      {
        fact: 'Music with lyrics impairs verbal and reading tasks — the phonological loop can’t handle two language streams simultaneously',
        source: 'Salamé & Baddeley, 1982; Frontiers in Psychology, 2024',
        sourceUrl:
          'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1363562/full',
      },
    ],
    howToApply: [
      {
        heading: 'Define a specific goal before sitting down.',
        body: '"Work on Spanish" is a category. "Complete 30 Anki cards and one LingQ lesson" is a goal. The brain can’t focus on a category.',
      },
      {
        heading: 'Protect the first 90 minutes.',
        body: 'The first cognitive window of the day is the highest quality for most people. No messages, no notifications. Guard it.',
      },
      {
        heading: 'One tab, one task.',
        body: 'Every open tab is an available distraction. Remove the option — the option alone impairs performance.',
      },
      {
        heading: 'Match difficulty to your current skill.',
        body: 'Too easy and the mind wanders. Too hard and anxiety overrides engagement. Find the edge where real effort is required but success is possible.',
      },
      {
        heading: 'End with a note.',
        body: 'Before stopping, write one sentence: where you are and what the next step is. This closes the open loop and cuts re-entry cost significantly.',
      },
    ],
    connection:
      'Pairs with Digital Discipline — Deep Focus defines what to protect; Digital Discipline builds the environment that protects it. See Attention Fragmentation for the cognitive cost of the default fragmented state this replaces.',
    relatedGuideIds: ['guide-digital-discipline', 'guide-attention-fragmentation'],
  },
  {
    id: 'guide-digital-discipline',
    title: 'Digital Discipline',
    domain: 'professional',
    practiceType: 'dual',
    estimatedMinutes: 7,
    summary: 'Remove the slot machine. Most "self-control" failures are environment-design failures.',
    story:
      'University of Texas, 2017. Adrian Ward split participants into three groups for a set of cognitive tasks: phone in another room, phone face-down on the desk, or phone in their pocket.\n\nThe phone was silent. Not ringing. Just present.\n\nThe group with phones in another room significantly outperformed the others. Participants with the phone on the desk reported having to actively not think about it — which depleted the same cognitive resources needed for the tasks.\n\nThe phone didn’t need to ring. Its presence alone was enough.',
    whatItReveals:
      'This isn’t a willpower problem. The apps on your phone were designed using the most powerful behavioral conditioning technique known: variable rewards — the same mechanic as slot machines. You can’t outperform a slot machine through discipline. You can remove it from the room.',
    principle:
      'You cannot willpower your way past a slot machine. Remove it from the room. Environment beats intention every time.',
    research: [
      {
        fact: 'Silent phone on the desk reduces cognitive performance vs. phone in another room',
        source: 'Ward et al., 2017',
        sourceUrl: 'https://www.journals.uchicago.edu/doi/full/10.1086/691462',
      },
      {
        fact: 'Variable ratio reinforcement (unpredictable rewards) produces the most persistent behavior',
        source: 'Skinner, 1957',
      },
      {
        fact: 'Notification removal is the highest-ROI attention intervention',
        source: 'Mark et al., 2012',
        sourceUrl: 'https://dl.acm.org/doi/abs/10.1145/2207676.2207754',
      },
      {
        fact: 'Small friction barriers reduce behavior completion significantly',
        source: 'Fogg, 2009; Thaler & Sunstein, 2008',
        sourceUrl: 'https://dl.acm.org/doi/10.1145/1541948.1541999',
      },
    ],
    howToApply: [
      {
        heading: 'Phone out of the room during focus sessions.',
        body: 'Not face-down. Another room. This is the single highest-leverage change in this entire program.',
      },
      {
        heading: 'Turn off all non-essential notifications.',
        body: 'Not "managed" — off. Check messages on your schedule, not theirs.',
      },
      {
        heading: 'Own the first 30 minutes of the day.',
        body: 'One task before the phone enters the room. Architecture, not discipline.',
      },
      {
        heading: 'Add friction to apps you want to use less.',
        body: 'Move them to a folder on page two. Log out after each session. The extra 10 seconds is enough to break the habit loop for most people.',
      },
      {
        heading: 'Silence the audio environment for verbal work.',
        body: 'Music with lyrics runs in the same cognitive channel as reading and language tasks. For anything involving text or language: use silence or instrumental-only.',
      },
    ],
    connection:
      'Digital Discipline is the environment that makes Deep Focus possible. Without it, focus sessions degrade by default regardless of intention. See Attention Fragmentation for the full cognitive cost this design addresses.',
    relatedGuideIds: ['guide-deep-focus', 'guide-attention-fragmentation'],
  },
  {
    id: 'guide-dominant-posture',
    title: 'Dominant Posture',
    domain: 'physical',
    practiceType: 'physical',
    estimatedMinutes: 5,
    summary: 'Feet planted. Spine tall. Chin level. Your body teaches your brain what state it is in.',
    story:
      '1988. Fritz Strack had participants hold a pen in their mouth in one of two ways: gripped between the teeth (which forces the face into something resembling a smile) or held by the lips (which prevents it). They then rated the funniness of cartoons.\n\nThe teeth group rated the cartoons as funnier.\n\nTheir bodies were producing the physical signal of amusement before there was anything to be amused about — and the brain interpreted it as genuine. The body had influenced the state, not just expressed it.',
    whatItReveals:
      'The body and mind have a two-way relationship. Your posture doesn’t just broadcast your internal state — it helps produce it. And before you speak, everyone in the room has already read your posture. The judgment is made in seconds, before a word.',
    principle:
      'Your posture is read before you speak and felt before you move. Train it as a broadcast, not an afterthought.',
    research: [
      {
        fact: 'Body position influences emotional state through proprioceptive feedback',
        source: 'Strack et al., 1988; Coles et al., 2022',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.54.5.768',
      },
      {
        fact: 'Open postures increase confidence and risk-taking behavior (behavioral effect replicated)',
        source: 'Carney, Cuddy & Yap, 2010',
        sourceUrl: 'https://journals.sagepub.com/doi/abs/10.1177/0956797610383437',
      },
      {
        fact: 'Observers form dominance and competence judgments from postural cues within seconds',
        source: 'Carney, Hall & LeBeau, 2005',
        sourceUrl: 'https://link.springer.com/article/10.1007/s10919-005-2743-z',
      },
      {
        fact: 'Upright posture improves mood, energy, and stress tolerance',
        source: 'Nair et al., 2015',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/hea0000146',
      },
    ],
    howToApply: [
      {
        heading: '2-minute mirror drill, daily.',
        body: 'Feet shoulder-width, spine tall (not forced), shoulders released, chin level. Hold it. Do it before high-stakes interactions.',
      },
      {
        heading: 'Know your collapse triggers.',
        body: 'Posture drops in predictable situations: long sitting, phone use, high-status rooms, fatigue. Map yours. Set a 90-minute check-in reminder.',
      },
      {
        heading: 'Occupy the space you’re in.',
        body: 'In a chair: sit back, spine tall, arms resting on the surface. Grounded, not rigid.',
      },
      {
        heading: 'Reset before entry.',
        body: '30 seconds upright before any high-stakes room. Gives your body a reference point to return to when it drifts.',
      },
      {
        heading: 'Link posture to your voice.',
        body: 'Upright posture allows full diaphragmatic breathing and a lower, more resonant sound. Train them together — they’re mechanically connected.',
      },
    ],
    connection:
      'Foundational to the Public Speaking package. Connects to Body Language (posture is the base everything else builds on), Confidence (proprioceptive feedback supports the self-efficacy estimate), and Poker Face (physical self-management in observed environments).',
    relatedGuideIds: [
      'guide-public-speaking',
      'guide-body-language',
      'guide-confidence',
      'guide-poker-face',
    ],
  },
  {
    id: 'guide-dont-laugh',
    title: 'Don’t Laugh',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Composure in serious moments is trainable. The mechanism is breath, not willpower.',
    story:
      'Trinity University, 1987. Daniel Wegner gave participants one instruction: for the next five minutes, do not think about a white bear.\n\nParticipants thought about it constantly — roughly once a minute. The harder they tried not to, the more insistently it appeared. He called it ironic process theory: the system monitoring for the unwanted thought keeps it active in working memory. Suppression creates the very thing it’s trying to eliminate.',
    whatItReveals:
      'Trying not to laugh makes you more likely to laugh. Suppression keeps the target live.\n\nThe solution isn’t force — it’s redirection. Move your attention to something real and external, and the impulse loses its grip. You can’t be fully absorbed in the present moment and fully amused simultaneously.',
    principle:
      'You cannot suppress laughter by trying not to. You can redirect it by becoming genuinely absorbed in something else.',
    research: [
      {
        fact: 'Trying to suppress a thought increases its frequency',
        source: 'Wegner et al., 1987',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.53.1.5',
      },
      {
        fact: 'Post-suppression rebound: suppressed content intrudes more strongly afterward',
        source: 'Wegner & Erber, 1992',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.63.6.903',
      },
      {
        fact: '80%+ of natural laughter is a social bonding signal, not a response to jokes',
        source: 'Provine, 2000',
      },
      {
        fact: 'Attentional redirection is more effective than suppression for emotional control',
        source: 'Nolen-Hoeksema et al., 2008',
        sourceUrl: 'https://journals.sagepub.com/doi/10.1111/j.1745-6924.2008.00088.x',
      },
    ],
    howToApply: [
      {
        heading: 'Don’t try not to laugh.',
        body: 'This guarantees failure. Let the impulse register — then immediately move attention outward to something real.',
      },
      {
        heading: 'Find a genuine anchor.',
        body: 'Focus on the other person’s face. What are they actually feeling right now? What does this moment mean to them? Real curiosity crowds out the impulse.',
      },
      {
        heading: 'Slow exhale through the nose.',
        body: '5-7 seconds. Releases the tension being routed toward laughter. Keep the jaw loose — clenching amplifies the internal pressure.',
      },
      {
        heading: 'Mirror drill — exposure practice.',
        body: 'Watch genuinely funny content and practice holding a neutral face. Identify your specific tells: eyebrow raise, lip corner, nostril flare. Target those specifically.',
      },
      {
        heading: 'Know your triggers.',
        body: 'Inappropriate laughter fires in predictable situations. Name yours. Recognition is 80% of the solution — when you see the situation coming, the brake is already engaged.',
      },
    ],
    connection:
      'Pairs directly with Poker Face — same mechanism, different trigger. The redirection principle applies equally to Fear & Panic (redirect from self-monitoring to the task) and Let Go of Rage (redirect from escalation to resolution).',
    relatedGuideIds: ['guide-poker-face', 'guide-fear-and-panic', 'guide-let-go-of-rage'],
  },
  {
    id: 'guide-empathy-on-command',
    title: 'Empathy on Command',
    domain: 'emotional',
    practiceType: 'mental',
    estimatedMinutes: 7,
    summary:
      'Before responding, replay the situation from their viewpoint. Two-second pause changes the answer.',
    story:
      'NYU, 2013. David Kidd and Emanuele Castano had participants read literary fiction — the kind that leaves characters’ inner lives ambiguous — then tested them on the "Reading the Mind in the Eyes" test: identify the emotion from a photograph of eyes alone.\n\nFiction readers scored significantly higher than those who read non-fiction, genre fiction, or nothing.\n\nThe mechanism: literary fiction makes you practice the same cognitive operation as real social interaction. You observe surface signals and construct an internal model of another mind. The same muscle. The book is the training ground.',
    whatItReveals:
      'Empathy isn’t a personality trait — it’s a skill. Specifically, the skill of building an accurate model of what someone else is feeling. The key failure mode is projection: substituting what you would feel for what they actually feel.\n\nEmpathy requires a deliberate shift: not "I’d feel X in this situation" but "given who they are and what’s happening, they probably feel Y."',
    principle:
      'Empathy is not feeling what someone feels — it is building an accurate model of what they feel. Built from observation, not projection.',
    research: [
      {
        fact: 'Reading literary fiction improves theory-of-mind performance',
        source: 'Kidd & Castano, 2013',
        sourceUrl: 'https://www.science.org/doi/10.1126/science.1239918',
      },
      {
        fact: 'Empathy has two systems: affective (automatic) and cognitive (deliberate, trainable)',
        source: 'Decety & Jackson, 2004',
        sourceUrl: 'https://journals.sagepub.com/doi/10.1177/1534582304267187',
      },
      {
        fact: 'High cognitive empathy predicts leadership and negotiation outcomes; affect-only empathy predicts burnout',
        source: 'Decety & Moriguchi, 2007',
        sourceUrl: 'https://link.springer.com/article/10.1186/1751-0759-1-22',
      },
      {
        fact: 'People in neutral states systematically underestimate emotional intensity in others',
        source: 'Loewenstein, 2005',
        sourceUrl: 'https://doi.org/10.1037/0278-6133.24.4.s49',
      },
    ],
    howToApply: [
      {
        heading: 'Three questions before responding.',
        body: 'What does this person want? What are they afraid of? What do they need to feel? Ten seconds. The answers don’t need to be perfect — the act of asking shifts your focus to them.',
      },
      {
        heading: 'Ask "what is this like for them?" not "what would this be like for me?"',
        body: 'You are not the subject. They are. Their history, their sensitivities, their current state determine their experience — not yours.',
      },
      {
        heading: 'Read literary fiction.',
        body: 'One piece a month — Chekhov, Munro, Morrison. Fiction where inner lives are complex and you have to infer. Treat it as deliberate practice, not just entertainment.',
      },
      {
        heading: '60-second write-up after friction.',
        body: 'After any difficult exchange, spend 60 seconds writing the other person’s version of it in first person. What they wanted, feared, hoped for. Do it immediately, while it’s fresh.',
      },
      {
        heading: 'Distinguish heat from position.',
        body: 'The position is what someone says they want. The heat is what they actually need. Respond to the heat first.',
      },
    ],
    connection:
      'Supports the empathy and perspective-taking items in States to Adopt. Connects to Small Talk (accurate empathy makes casual conversation feel genuinely interested, not performed) and Communication Process (knowing what someone needs changes what you say and when).',
    relatedGuideIds: ['guide-small-talk', 'guide-communication-process'],
  },
  {
    id: 'guide-eye-contact',
    title: 'Eye Contact',
    domain: 'social',
    practiceType: 'physical',
    estimatedMinutes: 5,
    summary: 'Three-second holds. Look between the eyes if locking on feels intense. Repeat 50 times today.',
    story:
      '1974. Steven Beebe had two speakers deliver the same prepared talk to the same audience. Same words. Same room. One made consistent eye contact. The other read from notes.\n\nThe audience rated the eye-contact speaker as more competent and more trustworthy — without being told anything about credentials or preparation.\n\nIn 2002, an fMRI study at UCL found that when a stranger makes eye contact, the brain’s reward circuitry activates. Gaze avoidance removes the reward signal. The audience neurologically disengages.',
    whatItReveals:
      'Eye contact is a credibility signal that operates before the audience consciously decides anything. By the time you reach your key point, they’ve already decided how much to believe you — and that decision was made in the first thirty seconds of gaze behavior.',
    principle:
      'Before the audience decides if your content is worth trusting, they’ve decided if you are. Eye contact is how that decision gets made.',
    research: [
      {
        fact: 'Eye contact significantly increases perceived competence and trustworthiness',
        source: 'Beebe, 1974',
        sourceUrl: 'https://www.tandfonline.com/doi/abs/10.1080/03634527409378052',
      },
      {
        fact: 'Eye contact activates the brain’s reward circuit; gaze avoidance removes it',
        source: 'Kampe et al., 2001',
        sourceUrl: 'https://www.nature.com/articles/35098149',
      },
      {
        fact: 'Gaze avoidance is the primary non-verbal signal of speaker uncertainty',
        source: 'Burgoon et al., 1986',
        sourceUrl: 'https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1468-2958.1986.tb00089.x',
      },
      {
        fact: 'Sustained eye contact with hostile audience members increases their resistance',
        source: 'Chen et al., 2013',
        sourceUrl: 'https://journals.sagepub.com/doi/abs/10.1177/0956797613491968',
      },
    ],
    howToApply: [
      {
        heading: 'One person, one thought.',
        body: 'Hold eye contact for one complete thought (3-5 seconds), then move to someone else. Prevents scanning (reads as anxiety) and staring (reads as aggression).',
      },
      {
        heading: 'Triangulate the room.',
        body: 'Divide the audience mentally into left, center, right. Rotate deliberately. People in each zone feel addressed even when you’re technically looking nearby.',
      },
      {
        heading: 'Practice in low-stakes conversations first.',
        body: 'Hold gaze during pauses — not just while delivering lines. Most people break gaze while thinking. Train that habit out first.',
      },
      {
        heading: 'Notes are for pauses between thoughts.',
        body: 'Glance, absorb the next point, look up, then speak. The audience should never see the top of your head mid-sentence.',
      },
      {
        heading: 'Notice where your eyes go under pressure.',
        body: 'People break gaze in predictable directions when uncertain. That’s your tell. Returning to the audience in those moments is the drill.',
      },
    ],
    connection:
      'Primary credibility signal in the Public Speaking package. Most effective when paired with Body Language and Confidence, both of which support the ability to hold gaze under pressure. Without it, Communication Process delivery loses much of its impact.',
    relatedGuideIds: [
      'guide-public-speaking',
      'guide-body-language',
      'guide-confidence',
      'guide-communication-process',
    ],
  },
  {
    id: 'guide-fear-and-panic',
    title: 'Fear & Panic',
    domain: 'emotional',
    practiceType: 'dual',
    estimatedMinutes: 9,
    summary: 'Why the freeze response fires before thought, and how to interrupt it with the breath.',
    story:
      'Harvard, 2014. Alison Wood Brooks had participants prepare to give a stressful impromptu speech. One group was told: "Try to calm down." Another group: "Try to get excited." A third got no instruction.\n\nThe calm-down group performed worst. The excited group performed best — on objective scores from outside observers.\n\nAnxiety and excitement are physiologically identical: elevated heart rate, heightened alertness, activated nervous system. Calm requires a physical downshift that takes time and effort. Excitement is a reframe of the same state — instantly available.',
    whatItReveals:
      'Fear is a signal. It knows what it’s pointing at. Panic is fear that’s lost its object and started consuming itself.\n\nYou can’t slow your heart rate in two seconds. But you can change what you tell yourself the arousal means. That reframe isn’t self-deception — it’s the most accurate reading of what the body is actually doing. The body is ready. The interpretation is the variable.',
    principle:
      'Fear is a signal — it knows what it’s pointing at. Panic is fear that lost its object. The intervention point is the two seconds before interpretation locks in.',
    research: [
      {
        fact: 'Reappraising anxiety as excitement improves performance vs. trying to calm down',
        source: 'Brooks, 2014',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/a0035325',
      },
      {
        fact: 'Anxiety and excitement share the same physiological signature',
        source: 'Barrett, 2017 (How Emotions Are Made)',
      },
      {
        fact: 'Diaphragmatic breathing activates the parasympathetic system within 1-3 breaths',
        source: 'Zaccaro et al., 2018',
        sourceUrl: 'https://www.frontiersin.org/articles/10.3389/fnhum.2018.00353/full',
      },
      {
        fact: 'Labeling an emotion ("affect labeling") reduces amygdala activation',
        source: 'Lieberman et al., 2007',
        sourceUrl: 'https://journals.sagepub.com/doi/10.1111/j.1467-9280.2007.01916.x',
      },
    ],
    howToApply: [
      {
        heading: 'Name it.',
        body: '"This is fear." Not weakness — the first regulatory move. Labeling the state engages the prefrontal cortex and reduces the amygdala signal.',
      },
      {
        heading: 'Locate the object.',
        body: 'What specifically are you afraid of? A specific threat can be assessed. A diffuse feeling of dread cannot. Naming the object converts panic back into fear — which is manageable.',
      },
      {
        heading: 'One slow exhale.',
        body: 'Longer out than in. Activates the parasympathetic system within seconds. Doesn’t eliminate arousal — just opens a window for the brain to re-engage.',
      },
      {
        heading: 'Reframe the arousal.',
        body: '"This arousal means this moment matters. I’m ready." The body gave you more resources than usual. The interpretation of what those resources mean is yours to assign.',
      },
      {
        heading: 'Return to the task.',
        body: 'Identify the immediate next concrete action — not "succeed," just the next specific step. The task is the anchor. Focus moves from you to it.',
      },
    ],
    connection:
      'Pairs with Let Go of Rage — both involve the interrupt window for high-arousal states, just at different ends of the spectrum. Core component of Public Speaking.',
    relatedGuideIds: ['guide-let-go-of-rage', 'guide-public-speaking'],
  },
  {
    id: 'guide-let-go-of-rage',
    title: 'Let Go of Rage',
    domain: 'emotional',
    practiceType: 'dual',
    estimatedMinutes: 8,
    summary: 'Name the body sensation, then the emotion, then the trigger. The naming is the regulator.',
    story:
      'Stanford, 1990s. James Gross showed participants a graphic film clip designed to induce disgust. One group was told to suppress all visible reaction — don’t let it show. Another group was told to reappraise: "This is a medical training film. The surgeons are helping."\n\nThe suppressors successfully hid their expression. But their physiological arousal — heart rate, skin conductance — went up. They were working harder to appear less affected.\n\nThe reappraisers showed less visible reaction and less physiological arousal simultaneously. The reframe changed the actual experience, not just the display.',
    whatItReveals:
      'Rage is a 90-second neurochemical event. The first wave is involuntary — you can’t stop it. Everything after — the replay, the justification, the escalation — is built by thought. Suppression doesn’t end it; it pressurizes it. Reappraisal resolves it at the source.',
    principle:
      'Rage is a 90-second neurochemical event. Everything after that is a choice to keep feeding it.',
    research: [
      {
        fact: 'Suppression reduces visible expression but increases physiological arousal',
        source: 'Gross, 1998',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.74.1.224',
      },
      {
        fact: 'Reappraisal reduces both visible expression and physiological arousal simultaneously',
        source: 'Gross, 1998; Ochsner & Gross, 2005',
        sourceUrl: 'https://www.sciencedirect.com/science/article/abs/pii/S1364661305000902',
      },
      {
        fact: 'The initial neurochemical wave of anger clears in ~90 seconds',
        source: 'Taylor, 2006 (My Stroke of Insight)',
      },
      {
        fact: 'Residual arousal from unrelated sources amplifies anger toward the next available target',
        source: 'Zillmann, 1971',
        sourceUrl: 'https://www.sciencedirect.com/science/article/abs/pii/0022103171900758',
      },
      {
        fact: 'Labeling an emotion reduces amygdala activation',
        source: 'Lieberman et al., 2007',
        sourceUrl: 'https://journals.sagepub.com/doi/10.1111/j.1467-9280.2007.01916.x',
      },
    ],
    howToApply: [
      {
        heading: 'Catch the body signal first.',
        body: 'Jaw tension, chest pressure, heat in the face. That physical signal arrives before the thought has fully formed — it’s the earliest interrupt point.',
      },
      {
        heading: 'Don’t suppress — pause.',
        body: 'The only goal in the first 90 seconds is to not act. A slow exhale. Physical distance from the trigger if possible. The pause is not agreement — it’s strategic delay.',
      },
      {
        heading: 'Name it without feeding it.',
        body: '"I’m angry." Not "this is outrageous" or "they always do this." The label reduces activation. The narrative extends it.',
      },
      {
        heading: 'Check for transfer.',
        body: 'Is this anger proportional to what just happened — or are you carrying something in from earlier? Stress and fatigue amplify everything. Adjust the response accordingly.',
      },
      {
        heading: 'Reappraise, don’t suppress.',
        body: 'Once the 90 seconds have passed: find a frame that is true and less activating. "What’s the outcome I actually want here?" Redirect energy from escalation to resolution.',
      },
    ],
    connection:
      'Pairs with Fear & Panic — same interrupt window, opposite end of the arousal spectrum. See Rumination Interrupt for what happens when the rage doesn’t resolve in the moment and becomes the replay loop.',
    relatedGuideIds: ['guide-fear-and-panic', 'guide-rumination-interrupt'],
  },
  {
    id: 'guide-poker-face',
    title: 'Poker Face',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Emotional neutrality on command is a muscle. Train it before you need it.',
    story:
      'Paul Ekman spent 50 years mapping the human face. His key finding: micro-expressions — brief flickers lasting 1/5 to 1/25 of a second — that leak genuine emotion even when someone is actively trying to hide it.\n\nHe discovered these while studying psychiatric patients who denied suicidal intent but later attempted suicide. Played back in slow motion, their faces contradicted everything they said.\n\nHe then developed a training tool (METT) and tested it across populations. Baseline accuracy at detecting micro-expressions: 47%. After 7 hours of training: 70-90%+.\n\nThe critical insight: most people trying to look neutral suppress globally — they try to make the whole face neutral at once. But emotional expression is localized. The leak is always one specific muscle.',
    whatItReveals:
      'Global suppression fails because it doesn’t target the actual leak. Contempt is a specific lip-corner raise. Fear shows in the inner brow. Amusement is around the eyes. You have to find your specific tell and train that muscle — not your whole face.',
    principle:
      'You can’t control emotion through willpower alone — but you can train the specific muscles that broadcast it. Find your tells. Train those muscles.',
    research: [
      {
        fact: 'Six basic emotional expressions are universal across cultures',
        source: 'Ekman & Friesen, 1969',
        sourceUrl: 'https://doi.org/10.1515/semi.1969.1.1.49',
      },
      {
        fact: 'Micro-expressions last 1/5 to 1/25 second and leak genuine emotion',
        source: 'Ekman, 1969',
      },
      {
        fact: 'Emotional expression is localized to specific muscle groups, not the whole face',
        source: 'Ekman & Friesen, 1978 (FACS)',
      },
      {
        fact: 'Training increases detection accuracy from 47% to 70-90%+',
        source: 'Ekman, 2003 (METT studies)',
      },
    ],
    howToApply: [
      {
        heading: 'Find your specific tell — on camera, not in theory.',
        body: 'Watch yourself in a mildly funny or mildly embarrassing situation. Where does the expression appear first? Eyebrow? Lip corner? Nostril? That’s the leak.',
      },
      {
        heading: 'Drill that muscle, not your whole face.',
        body: 'Allow the expression, then return to neutral, while imagining the trigger. Repeat. You’re building a motor pattern — not suppressing an emotion.',
      },
      {
        heading: 'Start with the eyes.',
        body: 'The muscle around the eye (orbicularis oculi) is harder to control than the mouth and more diagnostically reliable. Drill it separately.',
      },
      {
        heading: 'Use an anchor phrase.',
        body: 'Pair a chosen word — "calm," "quiet," "steady" — with a neutral face during practice. After enough repetitions, the phrase retrieves the state when you need it.',
      },
      {
        heading: 'Grade the exposure.',
        body: 'Start with mild triggers. When you can hold neutral there, move to stronger ones. The goal isn’t to stop feeling — it’s to stop broadcasting.',
      },
    ],
    connection:
      'Pairs directly with Don’t Laugh — same mechanism, different trigger. Fear & Panic covers the internal state; this covers the external broadcast. Both are components of the Public Speaking package.',
    relatedGuideIds: ['guide-dont-laugh', 'guide-fear-and-panic', 'guide-public-speaking'],
  },
  {
    id: 'guide-public-speaking',
    title: 'Public Speaking',
    domain: 'professional',
    practiceType: 'dual',
    estimatedMinutes: 10,
    summary: 'You are not afraid of speaking — you are afraid of social rejection. Decouple the two.',
    story:
      'Cornell, 1999. Thomas Gilovich made participants enter a room full of strangers wearing an embarrassing T-shirt. Before entering, they estimated that 50% of people in the room would remember it.\n\nThe actual number: 25%.\n\nHe called it the spotlight effect: we live at the center of our own experience, so we assume everyone else’s attention mirrors ours. It doesn’t. Every person in that room is in their own spotlight, managing their own anxieties and preoccupations. You are a much smaller part of the scene than you think.',
    whatItReveals:
      'Two things undermine public speaking performance. First, overestimating how closely the audience is judging you — the spotlight is half the size you think. Second, ignoring the mechanics of delivery. Content is what you say. Delivery is what they believe.',
    principle:
      'The audience isn’t watching as closely as you think. And when they are, they’re judging your voice and body before your words.',
    research: [
      {
        fact: 'People overestimate how much others notice their behavior by approximately 2x',
        source: 'Gilovich et al., 2000',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.78.2.211',
      },
      {
        fact: 'Lower, slower vocal delivery predicts perceived competence, leadership, and electability',
        source: 'Klofstad et al., 2012',
        sourceUrl: 'https://royalsocietypublishing.org/doi/10.1098/rspb.2012.0311',
      },
      {
        fact: 'Optimal performance occurs at moderate arousal — too high or too low both hurt',
        source: 'Yerkes & Dodson, 1908',
      },
      {
        fact: 'Deliberate practice (not just exposure) is the mechanism of improvement',
        source: 'Ericsson et al., 1993',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0033-295X.100.4.363',
      },
    ],
    howToApply: [
      {
        heading: 'Recalibrate the spotlight before you walk in.',
        body: 'The percentage of attention on you is about half your estimate. You don’t need to eliminate anxiety — you need to right-size the threat.',
      },
      {
        heading: 'Slow down 20%.',
        body: 'Record yourself and find your natural pace, then deliberately slow it. The pause before a key point — 2-3 seconds of silence — creates weight and signals that what follows matters.',
      },
      {
        heading: 'Drop pitch at sentence ends.',
        body: 'Rising intonation sounds like a question — like you’re seeking approval. Dropping pitch sounds certain. One of the highest-leverage delivery changes with no content change required.',
      },
      {
        heading: 'Anchor your body.',
        body: 'Feet shoulder-width, spine tall, weight even. Deliberate movement is fine. Pacing and swaying are not. Stillness reads as control. See Dominant Posture for the full protocol.',
      },
      {
        heading: 'Practice standing up, out loud.',
        body: 'Mental rehearsal has a ceiling. The nervous system needs to encounter real arousal in training to manage it in performance. Camera, mirror, or willing participant — not just your head.',
      },
    ],
    connection:
      'This guide covers delivery mechanics. Communication Process covers what to say and how to structure it. Fear & Panic covers managing arousal before taking the floor. Eye Contact and Body Language cover the non-verbal signals. Together these form the Public Speaking package.',
    relatedGuideIds: [
      'guide-communication-process',
      'guide-fear-and-panic',
      'guide-eye-contact',
      'guide-body-language',
      'guide-dominant-posture',
    ],
  },
  {
    id: 'guide-rumination-interrupt',
    title: 'Rumination Interrupt',
    domain: 'emotional',
    practiceType: 'mental',
    estimatedMinutes: 7,
    summary:
      'Catch the loop, label it ("thinking"), and break the chain with a 30-second somatic anchor.',
    story:
      'Stanford, 1987. Susan Nolen-Hoeksema studied how people respond to low mood. Some focused inward — analyzing why they felt bad, what it meant, what caused it (ruminators). Others redirected to external activity when mood dropped (distractors).\n\n30 days later, ruminators were significantly more depressed than distractors, even controlling for how depressed they started.\n\nThe extra analysis produced nothing useful. No new insight. No resolution. Just the same loop, sustained longer, with the same emotional charge.',
    whatItReveals:
      'Rumination looks like thinking. It uses the same internal voice, occupies the same mental space. But it produces no new outputs — just the same thought on repeat. If you’ve had this thought five times and the emotional charge hasn’t changed, you’re not reflecting. You’re ruminating.\n\nThe difference: reflection moves. It produces something — a decision, a lesson, a new question. Rumination orbits.',
    principle:
      'Rumination is not reflection — it’s the same thought on repeat. Reflection moves. Rumination orbits. The interrupt isn’t suppression — it’s completion and redirection.',
    research: [
      {
        fact: 'Rumination (not mood severity) is the strongest predictor of depression onset and duration',
        source: 'Nolen-Hoeksema, 1991',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0021-843X.100.4.569',
      },
      {
        fact: 'Ruminators gain no additional insight — the extra analysis produces nothing useful',
        source: 'Lyubomirsky & Nolen-Hoeksema, 1995',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.69.1.176',
      },
      {
        fact: 'Using your own name instead of "I" produces faster emotional recovery',
        source: 'Kross et al., 2014',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/a0035173',
      },
      {
        fact: 'Writing about a negative experience for 15-20 minutes over 3 days produces lasting psychological benefit',
        source: 'Pennebaker & Beall, 1986',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0021-843X.95.3.274',
      },
    ],
    howToApply: [
      {
        heading: 'Recognize the signature.',
        body: 'You’ve had this thought before. The emotional charge hasn’t decreased with repetition. That’s rumination — not reflection. The thought itself is the signal.',
      },
      {
        heading: 'Extract the lesson and write it down.',
        body: 'One sentence: "What I’ll do differently is ___." Writing creates a record that tells the brain the loop is closed. If you can’t fill it in, write: "Nothing to extract — this is done." Then stop.',
      },
      {
        heading: 'Use your name, not "I."',
        body: '"Why is [your name] still thinking about this?" instead of "Why am I..." The self-distance is small. The effect is immediate and usable anywhere.',
      },
      {
        heading: 'Redirect to a task with output.',
        body: 'Write, build, cook, exercise. Output occupies the prefrontal cortex so it can’t simultaneously run the loop. The task doesn’t need to be related to the problem.',
      },
      {
        heading: 'Set a time limit for deliberate review.',
        body: 'If something genuinely needs processing, schedule 20 minutes. Write during it. When time’s up, close it. Returning outside the window is the rumination.',
      },
    ],
    connection:
      'Supports the Rumination item in States to Eliminate. Pairs with Let Go of Rage — rage is the hot end of unresolved activation; rumination is the cold replay. Same upstream cause, same cure: extract + redirect.',
    relatedGuideIds: ['guide-let-go-of-rage', 'guide-fear-and-panic'],
  },
  {
    id: 'guide-small-talk',
    title: 'Small Talk',
    domain: 'social',
    practiceType: 'dual',
    estimatedMinutes: 6,
    summary: 'Small talk is not the goal — it is the bridge. Three sentences and an open question.',
    story:
      'University of Chicago, 2014. Nicholas Epley recruited commuters and assigned them to one of three conditions: talk to a stranger on the train, stay alone, or follow their normal routine.\n\nBefore the study, nearly every participant predicted conversation would be awkward — maybe unpleasant. They expected the strangers to be uninterested.\n\nThe results: the people who talked to strangers reported the best commute of the three groups. Not marginally — significantly. The strangers were curious, engaged, and genuinely interested. The predicted misery never arrived.',
    whatItReveals:
      'The resistance to small talk is not about small talk. It’s about a misfiring prediction. People expect rejection and awkwardness. The data shows those predictions are systematically wrong. Strangers are more interested in you than you think. The initiation cost is imaginary. The payoff is real.',
    principle:
      'The discomfort of initiating small talk is not a signal that the conversation will go badly — it is a prediction that almost never comes true.',
    research: [
      {
        fact: 'Commuters predicted misery; talking to strangers produced the best experience',
        source: 'Epley & Schroeder, 2014',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/a0037323',
      },
      {
        fact: 'Peripheral social connections (weak ties) significantly predict daily well-being',
        source: 'Sandstrom & Dunn, 2014',
        sourceUrl: 'https://journals.sagepub.com/doi/abs/10.1177/0146167214529799',
      },
      {
        fact: 'People underestimate how much others enjoy their conversation (the "liking gap")',
        source: 'Boothby et al., 2018',
        sourceUrl: 'https://journals.sagepub.com/doi/abs/10.1177/0956797618783714',
      },
      {
        fact: 'Mirroring conversational style increases rapport and connection',
        source: 'Chartrand & Bargh, 1999',
        sourceUrl: 'https://psycnet.apa.org/doi/10.1037/0022-3514.76.6.893',
      },
    ],
    howToApply: [
      {
        heading: 'Open with observation, not a question.',
        body: 'Comment on something real in the shared environment — the situation, what’s on display, the context. Shared ground without pressure.',
      },
      {
        heading: 'Three-beat structure.',
        body: 'Open → one follow-up → listen for something to build on. "Oh, you’re from there — what brought you here?" Not just "Cool."',
      },
      {
        heading: 'Invite more, say less.',
        body: 'Ask questions that open space ("What’s that like?") and let the other person fill it. People leave feeling the other person was fascinating — often having spoken 70% of the words.',
      },
      {
        heading: 'Have a clean exit ready.',
        body: '"Really glad I asked — have a good one." Warm and decisive. No one feels dismissed. Awkward endings are what people actually dread, not the conversation itself.',
      },
      {
        heading: 'Log the discomfort, not the outcome.',
        body: 'After each initiation: did it go as badly as you predicted? Twenty honest entries will do more to reduce small-talk anxiety than any amount of reading about it.',
      },
    ],
    connection:
      'Pairs with Communication Process — the same deliberate, unhurried delivery that works in serious conversations reads as social confidence in casual ones too. Connects to Empathy on Command: accurate interest in the other person is what makes small talk feel genuine rather than performed.',
    relatedGuideIds: ['guide-communication-process', 'guide-empathy-on-command'],
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
