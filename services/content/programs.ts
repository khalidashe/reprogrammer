import type { LibraryProgram } from '../library-content';

export const LIBRARY_PROGRAMS: LibraryProgram[] = [
  // ── The Foundation ─────────────────────────────────────────────────────────
  {
    id: 'pkg-atomic-habits',
    title: 'Atomic Habits',
    category: 'foundation',
    book: { title: 'Atomic Habits', author: 'James Clear', year: 2018 },
    description:
      'Install one habit and dismantle one using the Four Laws — the meta-program behind every other behavior.',
    guideIds: [
      'guide-context-design',
      'guide-action-over-consumption',
      'guide-relapse-and-restart',
    ],
    body: `## The Thesis

You don't rise to the level of your goals; you fall to the level of your systems. Habits are compound interest — a 1% daily improvement is invisible day to day but transformative over a year. Every habit runs the loop cue → craving → response → reward, and you change behavior by engineering that loop, not by willing yourself through it.

---

## The Method

1. **Make it obvious** — design cues into your environment; use implementation intentions ("I will [behavior] at [time] in [location]") and habit stacking ("After [current habit], I will [new habit]").
2. **Make it attractive** — bundle the habit with something you want; join groups where the behavior is already normal.
3. **Make it easy** — cut friction; use the Two-Minute Rule (scale any habit down to a 2-minute version).
4. **Make it satisfying** — give yourself an immediate reward; track it visibly; never miss twice.
5. **Invert the laws to break a habit** — make the bad one invisible, unattractive, hard, and unsatisfying.
6. **Build identity, not outcomes** — every rep is a vote for the type of person you want to become.

---

## Run It

~30 days, 10–15 minutes a day. Pick one behavior to build and one to break, then train them on your dashboard. This is the meta-program — its machinery (stacking, the Two-Minute Rule, tracking) plugs into every other program.`,
  },
  {
    id: 'pkg-tiny-habits',
    title: 'Tiny Habits',
    category: 'foundation',
    book: { title: 'Tiny Habits', author: 'BJ Fogg', year: 2019 },
    description:
      "Wire in three tiny habits through anchors and celebration — change so small it can't fail.",
    guideIds: ['guide-context-design', 'guide-relapse-and-restart'],
    body: `## The Thesis

Behavior happens when Motivation, Ability, and a Prompt converge at the same moment (B = MAP). Because motivation is unreliable, lasting change comes from shrinking the behavior until it's almost effortless and attaching it to a prompt you already have. Emotion, not repetition, wires a habit in — you feel successful the instant you do it.

---

## The Method

1. **Pick a tiny behavior** — shrink it to under 30 seconds (two push-ups, floss one tooth).
2. **Find an anchor** — an existing solid routine becomes the prompt: "After I [anchor], I will [tiny behavior]."
3. **Celebrate immediately** — fire a genuine positive emotion the second you finish. This is what wires the habit.
4. **Rehearse the sequence** — run anchor → behavior → celebration 7–10 times like a fire drill.
5. **Let it grow naturally** — never force scale; the habit expands on good days and stays tiny on bad ones.
6. **Troubleshoot in order** — if it isn't happening, fix the prompt first, then ability, then motivation.

---

## Run It

~14 days, seconds a day. Start three tiny behaviors anchored to routines you never skip. Pairs with Atomic Habits — Tiny Habits sharpens its "make it easy" law into a system of its own.`,
  },

  // ── Focus & Attention ──────────────────────────────────────────────────────
  {
    id: 'pkg-deep-work',
    title: 'Deep Work',
    category: 'focus_attention',
    book: { title: 'Deep Work', author: 'Cal Newport', year: 2016 },
    description:
      'Build a daily deep-work ritual and cut the attention fragmentation that kills focus.',
    guideIds: [
      'guide-deep-focus',
      'guide-digital-discipline',
      'guide-attention-fragmentation',
    ],
    body: `## The Thesis

The ability to concentrate without distraction on cognitively demanding work is becoming both rarer and more valuable — the defining skill of this economy. Deep work is a trainable capacity, not a personality trait, built through rituals, strict boundaries with shallow work, and deliberately weaning the brain off on-demand distraction.

---

## The Method

1. **Choose a depth philosophy** — rhythmic (same time daily) suits most; alternatives are monastic, bimodal, journalistic.
2. **Ritualize** — fix where you work, how long, the rules (no phone, no inbox), and the support (coffee, materials).
3. **Execute like a business** — focus on the wildly important, track lead measures (hours of depth), keep a visible scoreboard, review weekly.
4. **Embrace boredom** — schedule internet use; train through moments of waiting without the phone.
5. **Quit shallow stimulation** — apply the craftsman test to tools: keep only what substantially serves your core goals.
6. **Drain the shallows** — schedule every minute, cap shallow work, and end the day with a full shutdown ritual.

---

## Run It

~21 days. Set a daily deep-work block and protect it. Pairs with the Deep Focus, Digital Discipline, and Attention Fragmentation guides — and with the upcoming pull-mode drift counter.`,
  },

  // ── Social & Communication ────────────────────────────────────────────────
  {
    id: 'pkg-public-speaking',
    title: 'Public Speaking',
    category: 'social_communication',
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
    body: `Public speaking is not a single skill — it is a stack of trainable behaviors that operate simultaneously. Each component can be isolated, practiced, and encoded into the basal ganglia before being brought together. Build them separately; they compound.

This program groups all behaviors relevant to effective public speaking into a single reference hub. Each component links to its full Library guide.

---

## The Stack

| Behavior | Type | Guide |
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
  {
    id: 'pkg-charisma-myth',
    title: 'The Charisma Myth',
    category: 'social_communication',
    book: { title: 'The Charisma Myth', author: 'Olivia Fox Cabane', year: 2012 },
    description:
      'Train presence, power, and warmth until they are your default social signals.',
    guideIds: [
      'guide-confidence',
      'guide-body-language',
      'guide-eye-contact',
      'guide-dominant-posture',
      'guide-small-talk',
    ],
    body: `## The Thesis

Charisma is not innate magnetism — it is the learnable combination of three signals: presence (you are fully here), power (you can affect the world), and warmth (you will use it for me). Because people read these through body language that can't be faked directly, you produce them by managing your internal state, and the body follows.

---

## The Method

1. **Train presence** — keep bringing attention back to the present moment in conversation; people feel the difference instantly.
2. **Manage internal state** — neutralize anxiety and self-criticism before they leak into your body language (destigmatize, reframe, visualize).
3. **Project power** — posture, space, stillness; remove low-power tells (over-nodding, uptalk, fidgeting).
4. **Project warmth** — gratitude, goodwill, and empathy exercises that produce genuinely warm body language.
5. **Choose a charisma style** — focus, visionary, kindness, or authority — matched to the situation.
6. **Apply in hard moments** — first impressions, listening, difficult conversations, presentations.

---

## Run It

~21 days. Train one signal at a time alongside the Confidence, Body Language, Eye Contact, and Posture guides. Pairs with How to Win Friends and Nonviolent Communication for the social-confidence stack.`,
  },
  {
    id: 'pkg-how-to-win-friends',
    title: 'How to Win Friends and Influence People',
    category: 'social_communication',
    book: {
      title: 'How to Win Friends and Influence People',
      author: 'Dale Carnegie',
      year: 1936,
    },
    description:
      'Make genuine interest, sincere appreciation, and criticism-free influence your default.',
    guideIds: [
      'guide-small-talk',
      'guide-empathy-on-command',
      'guide-communication-process',
    ],
    body: `## The Thesis

People are driven less by logic than by the craving to feel important, and the fastest way to influence anyone is to satisfy that craving honestly — genuine interest, sincere appreciation, their name, their interests, their point of view. Carnegie's corollary: criticism, however justified, almost never changes behavior; it only triggers defense.

---

## The Method

1. **Never criticize, condemn, or complain** — it puts people in defense mode; nothing lands after that.
2. **Give honest, sincere appreciation** — specific and true, never flattery.
3. **Arouse an eager want** — frame every ask in terms of what the other person wants.
4. **Be genuinely interested** — ask, listen, remember; let others talk about themselves.
5. **Use names, smile, encourage** — remember names; smile; get people talking about their interests.
6. **Influence without friction** — admit your own errors fast, let others save face, give a fine reputation to live up to, ask questions instead of giving orders.

---

## Run It

~21 days, one principle practiced per day in a real interaction. Pairs with the Small Talk and Empathy on Command guides, and with The Charisma Myth.`,
  },
  {
    id: 'pkg-nonviolent-communication',
    title: 'Nonviolent Communication',
    category: 'social_communication',
    book: {
      title: 'Nonviolent Communication',
      author: 'Marshall B. Rosenberg',
      year: 1999,
    },
    description:
      'Replace blame and judgment with the four-step OFNR process — in conversation and in your own head.',
    guideIds: [
      'guide-empathy-on-command',
      'guide-let-go-of-rage',
      'guide-communication-process',
    ],
    body: `## The Thesis

Most conflict language — criticism, diagnosis, blame — is a tragic way of expressing an unmet need. Strip communication down to four components — observation, feeling, need, request (OFNR) — and both expressing yourself and hearing others shifts from combat to information exchange. The same four steps work inward, on your own self-talk.

---

## The Method

1. **Observe without evaluating** — state what a camera would record ("you arrived at 8:20"), not your interpretation ("you're always late").
2. **Name the feeling** — actual emotions (hurt, scared, frustrated), not thoughts in disguise ("I feel ignored" is a diagnosis).
3. **Identify the need** — the universal need under the feeling (respect, safety, rest, connection).
4. **Make a request** — specific, positive, doable now, and genuinely refusable ("Would you be willing to…?").
5. **Receive empathically** — hear the observation, feeling, need, and request behind the other person's words, however they say them.
6. **Self-empathy** — run OFNR on your own internal storm before responding to anyone.

---

## Run It

~21 days. Practice one OFNR step at a time, then full statements in real conversations. Pairs with the Empathy on Command and Let Go of Rage guides.`,
  },

  // ── Emotions & Resilience ──────────────────────────────────────────────────
  {
    id: 'pkg-feeling-good',
    title: 'Feeling Good',
    category: 'emotions_resilience',
    book: { title: 'Feeling Good', author: 'David D. Burns', year: 1980 },
    description:
      'Catch, name, and rewrite distorted automatic thoughts until the rewrite is reflexive (CBT).',
    guideIds: ['guide-rumination-interrupt', 'guide-relapse-and-restart'],
    body: `## The Thesis

Your moods are created by your thoughts, not by events — and when moods turn persistently negative, the thoughts producing them are reliably distorted in identifiable ways. Catch the automatic thought, name its distortion, and answer it rationally on paper, and the emotional charge drops. The technique works through writing, not willpower.

---

## The Method

1. **Learn the ten distortions** — all-or-nothing thinking, overgeneralization, mental filter, disqualifying the positive, jumping to conclusions, magnification/minimization, emotional reasoning, should statements, labeling, personalization.
2. **Catch the automatic thought** — when your mood drops, write the exact sentence your mind produced.
3. **Name the distortion(s)** — match the thought against the list.
4. **Write the rational response** — the triple-column technique (automatic thought | distortion | rational response). The response must be believable, not cheerleading.
5. **Act against the distortion** — activity scheduling, breaking "can'ts" into small tests, the anti-procrastination sheet.
6. **Dismantle the deeper rules** — find the should-statements and perfectionist assumptions feeding the daily thoughts.

---

## Run It

~21 days of triple-column thought records. Pairs with the Rumination Interrupt guide. (Note: CBT-style material — educational, not a substitute for therapy.)`,
  },

  // ── Performance & Productivity ────────────────────────────────────────────
  {
    id: 'pkg-make-it-stick',
    title: 'Make It Stick',
    category: 'performance_productivity',
    book: {
      title: 'Make It Stick',
      author: 'Brown, Roediger & McDaniel',
      year: 2014,
    },
    description:
      'Swap rereading and highlighting for retrieval, spacing, and interleaving — how learning actually sticks.',
    guideIds: [],
    body: `## The Thesis

The most popular study methods — rereading, highlighting, massed cramming — produce fluency illusions: material feels known because it's familiar, then vanishes. A century of cognitive science says durable learning comes from the opposite: effortful retrieval, spaced and interleaved practice, and generating answers before being shown them. Harder-feeling practice is better practice.

---

## The Method

1. **Retrieval practice** — test yourself instead of rereading; recalling strengthens memory more than re-exposure.
2. **Spacing** — let forgetting begin before you revisit; the effort of reconstruction is the signal that learning is happening.
3. **Interleaving** — mix topics and problem types within a session rather than blocking one at a time.
4. **Elaboration** — put new material in your own words; connect it to what you already know.
5. **Generation** — attempt answers before being taught them.
6. **Calibration** — check against objective tests; never trust the feeling of knowing.
7. **Reflection** — after learning, ask what happened and what you'd do differently.

---

## Run It

~21 days. Apply one technique to something you're already learning. Pairs with Ultralearning and Fluent Forever.`,
  },
  {
    id: 'pkg-ultralearning',
    title: 'Ultralearning',
    category: 'performance_productivity',
    book: { title: 'Ultralearning', author: 'Scott H. Young', year: 2019 },
    description:
      'Design and run an aggressive, self-directed project to learn a hard skill fast.',
    guideIds: ['guide-deep-focus'],
    body: `## The Thesis

Hard skills can be acquired dramatically faster through aggressive, self-directed projects than through passive courses — if the learning is designed deliberately. The nine principles boil down to: study how the skill is actually used, practice it directly rather than through proxies, attack your specific weaknesses, and test yourself constantly.

---

## The Method

1. **Metalearning** — map the skill before starting: what concepts, facts, and procedures does it contain, and how do the best learners acquire it?
2. **Focus** — cultivate concentrated practice sessions.
3. **Directness** — practice in the context you'll use it (speak the language, write the code, give the speech).
4. **Drill** — isolate your weakest sub-skill and attack it separately.
5. **Retrieval** — test yourself; recall before you re-read.
6. **Feedback** — seek immediate, honest signal, even when it stings.
7. **Retention** — spacing, proceduralization, overlearning.
8. **Intuition** — go deep on concepts; rebuild understanding from scratch (Feynman technique).
9. **Experimentation** — as you advance, vary methods, materials, and style.

---

## Run It

~30 days. Define one skill project and attack it with the nine principles. Pairs with Make It Stick and Deep Work.`,
  },
  {
    id: 'pkg-fluent-forever',
    title: 'Fluent Forever',
    category: 'performance_productivity',
    book: { title: 'Fluent Forever', author: 'Gabriel Wyner', year: 2014 },
    description:
      'Launch a new language pronunciation-first, with images over translations and a daily SRS habit.',
    guideIds: [],
    body: `## The Thesis

Language learning fails when it relies on translation, because the brain discards what it routes through your native language. The fix: train your ears and mouth first, attach words directly to images and personal memories (never translations), and let a spaced-repetition system do the remembering — so every minute of study compounds instead of leaking.

---

## The Method

1. **Train pronunciation first** — learn the sound system (minimal pairs, IPA) before vocabulary; you can't remember what you can't hear.
2. **Learn 625 base words by image** — concrete, frequent words, each linked to a picture and a personal connection, never a translation.
3. **Use spaced repetition daily** — Anki or equivalent, with cards you make yourself (images, sounds, personal hooks).
4. **Grammar through sentences** — mine example sentences; learn grammar as patterns inside sentences you already understand.
5. **Speak early with feedback** — tutors and exchanges; corrected mistakes become your best flashcards.
6. **Immerse deliberately** — media, self-talk, and thinking in the target language fill the gaps between sessions.

---

## Run It

~30 days to a daily SRS habit and a pronunciation foundation. Pairs with Make It Stick (spacing and retrieval).`,
  },

  // ── Identity & Purpose ─────────────────────────────────────────────────────
  {
    id: 'pkg-artists-way',
    title: "The Artist's Way",
    category: 'identity_purpose',
    book: { title: "The Artist's Way", author: 'Julia Cameron', year: 1992 },
    description:
      'Establish morning pages and the artist date, and clear the main blocks to creative output.',
    guideIds: [],
    body: `## The Thesis

Creativity is not a rare gift but a natural function that gets blocked — by perfectionism, internalized criticism, and fear dressed up as practicality. Recovery rests on two non-negotiable practices: morning pages (three longhand pages of stream-of-consciousness every morning, no audience, no quality bar) and the artist date (a weekly solo expedition to refill the well). Everything else is unblocking work built on those two.

---

## The Method

1. **Morning pages** — three longhand pages, first thing, every day. Not writing practice; a sieve for the mind. Never reread during the program, never shown to anyone.
2. **Artist date** — once a week, a solo block doing something that delights or intrigues you. Alone is mandatory; productive is forbidden.
3. **Identify the censor** — name the internal critic; write through its commentary instead of negotiating with it.
4. **Unblock through exercises** — affirmations, listing buried dreams, revisiting early creative wounds, imagining other lives.
5. **Fill the well** — deliberate sensory input: images, music, walks, small beauty. Output requires input.
6. **Protect the recovery** — watch for self-sabotage: skipped pages, "too busy" weeks, sharing work too early.

---

## Run It

~28 days (the four foundation weeks of Cameron's 12-week course). The two daily/weekly practices are the whole engine — protect them.`,
  },

  // ── Cross-book programs (REP-12 / REP-33) ───────────────────────────────────
  // Assembled from the single-book programs above; each links back to its
  // sources. Source books are derived from `sourceProgramIds`.
  {
    id: 'pkg-social-confidence',
    title: 'Social Confidence',
    category: 'social_communication',
    sourceProgramIds: [
      'pkg-charisma-myth',
      'pkg-how-to-win-friends',
      'pkg-nonviolent-communication',
    ],
    description:
      'Be at ease and genuinely influential in any social setting — presence and warmth, real interest in people, and clean communication when things get tense.',
    guideIds: [
      'guide-confidence',
      'guide-eye-contact',
      'guide-body-language',
      'guide-dominant-posture',
      'guide-small-talk',
      'guide-empathy-on-command',
      'guide-communication-process',
      'guide-let-go-of-rage',
    ],
    sequence: [
      'Presence & inner state',
      'Power and warmth signals',
      'Genuine interest',
      'Clean communication under friction',
      'Integration',
    ],
    body: `## The Thesis

Social confidence is not a trait you're born with — it's three learnable layers stacked together. Olivia Fox Cabane shows that charisma is presence, power, and warmth, produced by managing your internal state so your body language follows. Dale Carnegie shows that influence comes from honoring the other person's craving to feel important — genuine interest, not technique. Marshall Rosenberg shows that when things get tense, stripping speech down to observation–feeling–need–request keeps connection intact. Train the inner state, then outward interest, then the language for friction.

---

## The Method

1. **Presence first** — bring your full attention back to the person in front of you; people feel the difference before you say anything ([[The Charisma Myth]]).
2. **Manage the inner state** — neutralize anxiety and self-criticism before they leak into posture and face; project power (posture, stillness) and warmth (goodwill, gratitude).
3. **Lead with genuine interest** — ask, listen, remember names and details; never criticize or condemn — it ends the exchange before it starts ([[How to Win Friends and Influence People]]).
4. **Arouse an eager want** — frame every ask in terms of what the other person already wants.
5. **Speak clean under friction** — when a conversation heats up, run OFNR: observe without evaluating, name the feeling, identify the need, make a refusable request ([[Nonviolent Communication]]).
6. **Self-empathy** — run the same four steps inward on your own storm before you respond.

---

## Run It

~30 days, one layer at a time: presence and state, then genuine-interest behaviors, then OFNR for hard moments, then integrate. Built from [[The Charisma Myth]], [[How to Win Friends and Influence People]], and [[Nonviolent Communication]]; pairs with the Confidence, Eye Contact, Body Language, and Empathy on Command guides.`,
  },
  {
    id: 'pkg-learn-anything-faster',
    title: 'Learn Anything Faster',
    category: 'performance_productivity',
    sourceProgramIds: ['pkg-make-it-stick', 'pkg-ultralearning', 'pkg-deep-work'],
    description:
      'Acquire any hard skill fast: a deliberate self-directed project, distraction-free practice, and the retrieval–spacing–interleaving engine that makes it stick.',
    guideIds: [
      'guide-deep-focus',
      'guide-digital-discipline',
      'guide-attention-fragmentation',
    ],
    sequence: [
      'Map the skill',
      'Protect a daily deep block',
      'Practice directly',
      'Drive with retrieval & spacing',
      'Drill weaknesses',
    ],
    body: `## The Thesis

Most learning fails because the methods feel productive but aren't — rereading, cramming, and passive courses produce fluency illusions that evaporate. Three books converge on the fix. Scott Young's ultralearning says to design an aggressive, self-directed project and practice the skill directly. Brown, Roediger & McDaniel show the engine that makes it stick — retrieval, spacing, interleaving. Cal Newport shows the condition all of it needs: distraction-free depth. Design the project, protect the deep block, and drive it with effortful retrieval.

---

## The Method

1. **Map the skill** — before starting, break it into concepts, facts, and procedures, and study how the best learners acquire it ([[Ultralearning]]).
2. **Practice directly** — train in the context you'll use it (speak the language, write the code, give the talk), not through proxies.
3. **Protect a daily deep block** — ritualize one distraction-free session; schedule internet use; end with a shutdown ([[Deep Work]]).
4. **Drive with retrieval** — test yourself instead of rereading; recall before you re-read ([[Make It Stick]]).
5. **Space and interleave** — let forgetting begin before you revisit; mix problem types within a session.
6. **Drill weaknesses and seek feedback** — isolate your weakest sub-skill, attack it, and get honest signal fast.

---

## Run It

~30 days. Define one skill project, set a daily deep-work block, and make retrieval + spacing your default study mode. Built from [[Make It Stick]], [[Ultralearning]], and [[Deep Work]]; pairs with the Deep Focus, Digital Discipline, and Attention Fragmentation guides.`,
  },
  {
    id: 'pkg-rebuild-your-habits',
    title: 'Rebuild Your Habits',
    category: 'foundation',
    sourceProgramIds: ['pkg-atomic-habits', 'pkg-tiny-habits', 'pkg-feeling-good'],
    description:
      'Overhaul your daily systems end to end: redesign the cues, shrink behaviors until they can’t fail, and rewrite the self-talk that derails them after a slip.',
    guideIds: [
      'guide-context-design',
      'guide-action-over-consumption',
      'guide-relapse-and-restart',
      'guide-rumination-interrupt',
    ],
    sequence: [
      'Pick one to build, one to break',
      'Design the environment',
      'Shrink and anchor',
      'Never miss twice',
      'Rewrite the saboteur thought',
    ],
    body: `## The Thesis

A habit overhaul fails when you rely on willpower instead of changing the system. James Clear shows that behavior follows the environment and the loop cue → craving → response → reward — so you engineer the loop. BJ Fogg shows that the reliable lever is shrinking the behavior until it's effortless, anchoring it to something you already do, and celebrating to wire it in. David Burns shows what derails all of it: distorted self-talk after a slip ("I always quit") — caught and rewritten on paper, the spiral stops. Redesign the cues, shrink the behaviors, and rewrite the thoughts that sabotage them.

---

## The Method

1. **Pick one to build, one to break** — make the good one obvious, attractive, easy, and satisfying; invert all four to dismantle the bad one ([[Atomic Habits]]).
2. **Design the environment** — cues into view for the good habit, friction in front of the bad one.
3. **Shrink it until it can't fail** — an under-30-second version anchored to an existing routine ("after I ___, I will ___"), then celebrate the instant you finish ([[Tiny Habits]]).
4. **Never miss twice** — one miss is an accident; protect the chain on the second day.
5. **Catch the saboteur thought** — when you slip and the mood drops, write the exact automatic thought, name its distortion, and answer it rationally ([[Feeling Good]]).
6. **Vote for the identity** — treat each rep as evidence of the person you're becoming, not a step toward a far-off goal.

---

## Run It

~30 days. Run one build + one break habit on your dashboard, keep them tiny, and use a thought record on any slip. Built from [[Atomic Habits]], [[Tiny Habits]], and [[Feeling Good]]; pairs with the Context Design, Action over Consumption, Relapse & Restart, and Rumination Interrupt guides.`,
  },

  // ════════════════════════════════════════════════════════════════════════════
  // Catalog expansion (REP-33) — flagship books per shelf, so every category
  // reads as a real library. Each is built from the book's established, publicly
  // documented framework (the launch-catalog method), in the house voice, and
  // links to existing Library guides where they genuinely fit.
  // ════════════════════════════════════════════════════════════════════════════

  // ── The Foundation ─────────────────────────────────────────────────────────
  {
    id: 'pkg-power-of-habit',
    title: 'The Power of Habit',
    category: 'foundation',
    book: { title: 'The Power of Habit', author: 'Charles Duhigg', year: 2012 },
    description:
      'Find the loop behind a habit — cue, routine, reward — and rewire it by keeping the ends and swapping the middle.',
    guideIds: ['guide-context-design', 'guide-relapse-and-restart'],
    body: `## The Thesis

Every habit runs a neurological loop — cue, routine, reward — and a craving is what powers it. You can't erase a habit, but you can change it: keep the same cue and the same reward, and swap the routine in between. That's the Golden Rule of habit change. Some habits are keystone habits — change one and it quietly reorganizes everything around it.

---

## The Method

1. **Identify the loop** — name the cue, the routine, and the reward of a habit you want to change.
2. **Find the real reward** — experiment: what craving is the routine actually satisfying? Test substitutes until the craving is met.
3. **Isolate the cue** — almost every cue is a time, a place, an emotional state, other people, or a preceding action. Pin yours down.
4. **Keep cue + reward, change the routine** — insert a new behavior that delivers the same reward (the Golden Rule of habit change).
5. **Install a keystone habit** — pick one habit (exercise, making the bed, a family meal) that drags other good behaviors along with it.
6. **Borrow belief** — under stress, a reworked loop holds only if you believe change is possible; a group makes that belief stick.

---

## Run It

~21 days mapping and rewiring one loop. The mechanism beneath Atomic Habits and Tiny Habits — pairs with the Context Beats Willpower and Relapse & Restart guides.`,
  },

  // ── Mind & Thinking ────────────────────────────────────────────────────────
  {
    id: 'pkg-thinking-fast-slow',
    title: 'Thinking, Fast and Slow',
    category: 'mind_thinking',
    book: { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: 2011 },
    description:
      'Catch the fast, automatic mind making your decisions — and learn when to slow down and let the deliberate one check its work.',
    guideIds: [],
    body: `## The Thesis

The mind runs two systems. System 1 is fast, automatic, and intuitive — it produces impressions and snap judgments effortlessly, and it is the secret author of most of what you do. System 2 is slow, effortful, and deliberate — and lazy: it usually just endorses System 1's answer. Most thinking errors are System 1 shortcuts that System 2 never bothered to check.

---

## The Method

1. **Know the two systems** — notice when a fast, confident answer is System 1 talking rather than actual analysis.
2. **Catch the substitution** — when a hard question suddenly feels easy, you've quietly answered an easier one. Re-ask the real question.
3. **Name the bias** — anchoring, availability, representativeness, loss aversion, the halo effect, hindsight. Labeling slows the snap.
4. **Slow down on what matters** — deliberately engage System 2 for high-stakes or irreversible calls; let System 1 run the trivial ones.
5. **Think in base rates** — start from how often an outcome happens in general before trusting the vivid specific story.
6. **Take the outside view** — premortems and reference classes counter overconfidence and the planning fallacy.

---

## Run It

~21 days. Pick one recurring decision and add a System-2 checkpoint before you commit. Pairs with The Art of Thinking Clearly and Decisive.`,
  },
  {
    id: 'pkg-art-of-thinking-clearly',
    title: 'The Art of Thinking Clearly',
    category: 'mind_thinking',
    book: { title: 'The Art of Thinking Clearly', author: 'Rolf Dobelli', year: 2013 },
    description:
      'Think better by subtracting error: learn the recurring cognitive traps and simply stop falling into the worst of them.',
    guideIds: [],
    body: `## The Thesis

Clear thinking is less about adding brilliance than subtracting error. Dobelli catalogs the systematic biases that quietly distort everyday judgment and argues that recognizing them — and avoiding the worst — beats chasing cleverness. Negative knowledge (knowing what *not* to do) is more robust than positive knowledge.

---

## The Method

1. **Learn the recurring errors** — survivorship bias, sunk-cost fallacy, confirmation bias, social proof, the contrast effect, and their kin.
2. **Watch for survivorship bias** — you only see the winners; the graveyard of failures is invisible and skews your odds.
3. **Ignore sunk costs** — decide from where you are now and the future payoff, never from what you've already spent.
4. **Hunt disconfirming evidence** — actively look for what would prove you wrong; confirmation bias only collects agreement.
5. **Distrust social proof under uncertainty** — "everyone's doing it" is the weakest reason to act.
6. **Keep a decision journal** — write the reasoning at the time so hindsight can't quietly rewrite it later.

---

## Run It

~21 days, one bias studied and spotted in the wild each day. Pairs with Thinking, Fast and Slow and Decisive.`,
  },
  {
    id: 'pkg-decisive',
    title: 'Decisive',
    category: 'mind_thinking',
    book: { title: 'Decisive', author: 'Chip & Dan Heath', year: 2013 },
    description:
      'Beat the four villains of bad decisions with a repeatable process — WRAP — instead of trusting raw gut or IQ.',
    guideIds: [],
    body: `## The Thesis

Good decisions come from a reliable process, not from intelligence or instinct. The Heath brothers name four villains that wreck judgment — narrow framing, the confirmation bias, short-term emotion, and overconfidence about the future — and counter each with a step of WRAP.

---

## The Method

1. **Widen your options** — escape "whether or not" framing; find at least one more real alternative (run the vanishing-options test).
2. **Reality-test your assumptions** — seek disconfirming evidence and run small experiments ("ooch") before betting big.
3. **Attain distance before deciding** — apply 10/10/10 (how will I feel in 10 minutes, 10 months, 10 years?) and honor your core priorities.
4. **Prepare to be wrong** — set tripwires and bookend the future, planning for both the bad case and the good.
5. **Run a premortem** — imagine the decision failed a year out, list why, and pre-empt it.
6. **Decide, then revisit on schedule** — course-correct at a set check-in instead of relitigating endlessly.

---

## Run It

~14 days. Run one real decision through WRAP end to end. Pairs with Thinking, Fast and Slow and The Art of Thinking Clearly.`,
  },

  // ── Focus & Attention ──────────────────────────────────────────────────────
  {
    id: 'pkg-digital-minimalism',
    title: 'Digital Minimalism',
    category: 'focus_attention',
    book: { title: 'Digital Minimalism', author: 'Cal Newport', year: 2019 },
    description:
      'Rebuild your digital life from your values up — a few tools that truly serve you, and the courage to miss everything else.',
    guideIds: ['guide-digital-discipline', 'guide-social-environment'],
    body: `## The Thesis

A digital minimalist starts from values, not apps: a few carefully chosen technologies that strongly serve what they care about, and a cheerful willingness to miss the rest. The attention economy is engineered to fragment you, so reclaiming autonomy takes a deliberate philosophy, not willpower tweaks. Solitude — freedom from other minds' input — is a basic need that constant connection has quietly erased.

---

## The Method

1. **Run a 30-day declutter** — step away from optional technologies and rediscover what you actually miss.
2. **Reintroduce intentionally** — readmit a tool only if it serves a deep value, and set rules for *how* you'll use it.
3. **Reclaim solitude** — schedule regular input-free time: walks without podcasts, leaving the phone behind.
4. **Don't just click "Like"** — replace low-bandwidth digital contact with real conversation and presence.
5. **Reclaim high-quality leisure** — cultivate demanding, often analog hobbies that make passive scrolling unappealing.
6. **Join the attention resistance** — delete social apps from the phone, use them on a schedule from a computer, kill the feeds.

---

## Run It

~30 days (the declutter *is* the program). Pairs with Deep Work and Indistractable, and the Digital Discipline guide.`,
  },
  {
    id: 'pkg-indistractable',
    title: 'Indistractable',
    category: 'focus_attention',
    book: { title: 'Indistractable', author: 'Nir Eyal', year: 2019 },
    description:
      'Most distraction is escape from discomfort, not a pull from the screen. Master the internal triggers and the pings lose their grip.',
    guideIds: ['guide-digital-discipline', 'guide-attention-fragmentation', 'guide-deep-focus'],
    body: `## The Thesis

The opposite of distraction isn't focus — it's *traction*, action that pulls you toward what you want. Most distraction is an attempt to escape an uncomfortable internal feeling, not a pull from the device. Master the internal triggers, make time for traction, and the external pings stop running your day.

---

## The Method

1. **Master internal triggers** — distraction starts inside; identify the discomfort you're escaping and surf the urge for ten minutes.
2. **Reimagine the trigger, the task, and yourself** — curiosity and reframing beat self-criticism.
3. **Make time for traction** — timebox your day from your values; you can't call something a distraction unless you know what it pulled you *from*.
4. **Schedule the inputs, not just outputs** — plan reflection, relationships, and rest, not only work.
5. **Hack back external triggers** — interrogate each notification, meeting, message, and app; keep only what serves you.
6. **Prevent distraction with pacts** — effort, price, and identity pacts ("I'm someone who's indistractable") lock the behavior in.

---

## Run It

~21 days; start by timeboxing one full day. Pairs with Deep Work and Digital Minimalism, and the Attention Fragmentation and Digital Discipline guides.`,
  },

  // ── Emotions & Resilience ──────────────────────────────────────────────────
  {
    id: 'pkg-happiness-trap',
    title: 'The Happiness Trap',
    category: 'emotions_resilience',
    book: { title: 'The Happiness Trap', author: 'Russ Harris', year: 2007 },
    description:
      'Stop fighting difficult thoughts and feelings; make room for them and pour your energy into what you value (ACT).',
    guideIds: ['guide-rumination-interrupt'],
    body: `## The Thesis

The harder you fight to feel good, the worse you often feel — the "happiness trap" is the belief that negative thoughts and feelings are abnormal and must be eliminated. Acceptance and Commitment Therapy offers the opposite: make room for difficult internal experiences, unhook from your thoughts, and invest energy in actions that serve your values. The goal is psychological flexibility, not the absence of pain.

---

## The Method

1. **Defuse from thoughts** — see a thought as words passing through, not a command or a truth ("I'm having the thought that…").
2. **Make room** — let an uncomfortable feeling be present without struggling against it.
3. **Anchor in the present** — return attention to the here and now through the senses.
4. **Notice the observing self** — you are the sky; thoughts and feelings are the weather. You contain them; they aren't you.
5. **Clarify values** — name the kind of person you want to be in the domains that matter.
6. **Commit to action** — take values-guided steps even while discomfort rides along.

---

## Run It

~21 days of defusion plus one values-based action a day. Educational, not a substitute for therapy. Pairs with Feeling Good and the Rumination Interrupt guide.`,
  },
  {
    id: 'pkg-why-has-nobody',
    title: 'Why Has Nobody Told Me This Before?',
    category: 'emotions_resilience',
    book: { title: 'Why Has Nobody Told Me This Before?', author: 'Dr Julie Smith', year: 2022 },
    description:
      'The everyday mental-health skills nobody taught you — small tools for low mood, anxiety, and motivation, practiced before you need them.',
    guideIds: ['guide-rumination-interrupt', 'guide-relapse-and-restart'],
    body: `## The Thesis

Most everyday struggles aren't disorders to be cured but skills nobody taught us — managing low mood, anxiety, self-criticism, and motivation. Emotions are information, and they pass; what helps is a toolkit of small techniques used early, before a dip becomes a spiral. Coping is built in calm, not invented mid-crisis.

---

## The Method

1. **Read emotions as data** — name the feeling and what it's pointing at instead of fighting it.
2. **Work the thought–feeling–behavior loop** — change any one corner (a thought, an action) to shift the others.
3. **Act opposite to the dip** — low mood says withdraw and do less; gentle activity and connection are the lever back up.
4. **Defuse the inner critic** — talk to yourself the way you'd talk to a friend you respect.
5. **Build the toolkit in advance** — breathing, grounding, movement, sleep, and connection, rehearsed before you need them.
6. **Lower the bar to start** — motivation follows action; do the two-minute version and let momentum build.

---

## Run It

~21 days assembling your personal toolkit, one tool at a time. Educational, not a substitute for therapy. Pairs with Feeling Good and the Rumination Interrupt and Relapse & Restart guides.`,
  },

  // ── Social & Communication ─────────────────────────────────────────────────
  {
    id: 'pkg-never-split-the-difference',
    title: 'Never Split the Difference',
    category: 'social_communication',
    book: {
      title: 'Never Split the Difference',
      author: 'Chris Voss',
      year: 2016,
    },
    description:
      'Negotiate through emotion, not logic — tactical empathy, labels, and calibrated questions from an FBI hostage negotiator.',
    guideIds: ['guide-empathy-on-command', 'guide-communication-process'],
    body: `## The Thesis

Negotiation isn't logical argument — it's emotional navigation. The FBI's lead hostage negotiator built his method on tactical empathy, not leverage: people want to feel understood and in control, and once they do, influence follows. "No" is where the negotiation starts, not where it ends.

---

## The Method

1. **Use tactical empathy** — label the other side's emotions out loud ("It seems like…", "It sounds like…") to defuse them.
2. **Mirror** — repeat the last few words they said; it keeps them talking and reveals more.
3. **Get to "that's right"** — summarize their view until they affirm it; that's the breakthrough, not "you're right."
4. **Invite "No"** — ask questions people can safely refuse; it hands them control and lowers their guard.
5. **Ask calibrated "how" and "what" questions** — "How am I supposed to do that?" makes them solve your problem.
6. **Find the black swans** — the hidden pieces of information that, once surfaced, change the whole deal.

---

## Run It

~21 days, one tool practiced per real conversation. Pairs with How to Win Friends and Influence People, and the Empathy on Command and Communication Process guides.`,
  },
  {
    id: 'pkg-crucial-conversations',
    title: 'Crucial Conversations',
    category: 'social_communication',
    book: {
      title: 'Crucial Conversations',
      author: 'Patterson, Grenny, McMillan & Switzler',
      year: 2002,
    },
    description:
      'Stay in dialogue when stakes are high and emotions run hot — make it safe, master your story, and speak your truth without a fight.',
    guideIds: ['guide-communication-process', 'guide-let-go-of-rage', 'guide-empathy-on-command'],
    body: `## The Thesis

The conversations that matter most — high stakes, strong emotions, opposing opinions — are the ones we handle worst, defaulting to silence or to verbal violence. The skill is keeping dialogue alive by making it safe, so everyone adds their meaning to a shared pool. Master the story you tell yourself and you master the conversation.

---

## The Method

1. **Start with heart** — get clear on what you really want (for yourself, the other person, the relationship) before you speak.
2. **Learn to look** — catch the moment a conversation turns crucial and people move to silence or violence.
3. **Make it safe** — restore safety with mutual purpose and mutual respect when others get defensive.
4. **Master your stories** — separate the facts from the story you've built on them; question the villain/victim/helpless narratives.
5. **STATE your path** — Share facts, Tell your story, Ask for theirs, Talk tentatively, Encourage testing.
6. **Move to action** — decide who does what by when, and follow up.

---

## Run It

~21 days; rehearse one crucial conversation with STATE before having it. Pairs with Nonviolent Communication, and the Communication Process and Let Go of Rage guides.`,
  },

  // ── Performance & Productivity ─────────────────────────────────────────────
  {
    id: 'pkg-getting-things-done',
    title: 'Getting Things Done',
    category: 'performance_productivity',
    book: { title: 'Getting Things Done', author: 'David Allen', year: 2001 },
    description:
      'Get every commitment out of your head and into a trusted system, so your mind is free to do the work in front of it.',
    guideIds: ['guide-deep-focus'],
    body: `## The Thesis

Your mind is for having ideas, not holding them. Every open loop you're trying to remember drains attention and breeds low-grade stress. GTD moves every commitment out of your head into a trusted external system, so you can engage fully with whatever you're doing. Stress-free productivity comes from knowing your next physical action — not from working harder.

---

## The Method

1. **Capture** — collect every open loop into trusted inboxes; get it *all* out of your head.
2. **Clarify** — process each item: is it actionable? If yes, what's the very next physical action?
3. **Organize** — sort into lists (next actions, projects, waiting-for, someday/maybe) and put time-bound items on the calendar.
4. **Apply the two-minute rule** — if it takes under two minutes, do it now.
5. **Reflect** — run a weekly review to keep the system current and therefore trusted.
6. **Engage** — choose what to do by context, time, energy, and priority — with a clear mind.

---

## Run It

~14 days to stand up the system, then a standing weekly review. Pairs with Deep Work and Essentialism, and the Deep Focus guide.`,
  },
  {
    id: 'pkg-essentialism',
    title: 'Essentialism',
    category: 'performance_productivity',
    book: { title: 'Essentialism', author: 'Greg McKeown', year: 2014 },
    description:
      'The disciplined pursuit of less — do only the vital few things, and if it isn’t a clear yes, it’s a clear no.',
    guideIds: ['guide-deep-focus', 'guide-digital-discipline'],
    body: `## The Thesis

Essentialism isn't about getting more done — it's about doing only the right things, by relentlessly separating the vital few from the trivial many. Without deliberate choice, others choose for you and your energy scatters. The rule: if it isn't a clear yes, it's a clear no.

---

## The Method

1. **Choose** — reclaim your power to choose; treat nothing as automatic or obligatory.
2. **Discern** — explore widely, then apply extreme criteria; the 90% rule (if it's not a 9 or 10, it's a no).
3. **Escape to think** — build in space to explore, listen, and reflect before committing.
4. **Eliminate** — say a graceful but firm "no"; uncommit from sunk-cost projects; set boundaries.
5. **Edit** — cut the trivial and subtract activities so the essential ones can flow.
6. **Execute by design** — build buffers, remove the slowest obstacle, and make the essential effortless.

---

## Run It

~21 days; pick one area and cut it down to the essential. Pairs with Deep Work and Getting Things Done, and the Deep Focus and Digital Discipline guides.`,
  },

  // ── Identity & Purpose ─────────────────────────────────────────────────────
  {
    id: 'pkg-mindset',
    title: 'Mindset',
    category: 'identity_purpose',
    book: { title: 'Mindset', author: 'Carol S. Dweck', year: 2006 },
    description:
      'Whether you believe ability is fixed or can grow quietly decides how you face challenge, criticism, and failure.',
    guideIds: ['guide-confidence', 'guide-relapse-and-restart'],
    body: `## The Thesis

Whether you believe ability is fixed or can grow shapes everything you do. A fixed mindset treats each challenge as a verdict on your worth, so it avoids risk and crumbles at failure. A growth mindset treats ability as developable, so it seeks challenge and learns from setbacks. The belief itself — not the talent — predicts who thrives.

---

## The Method

1. **Spot your fixed-mindset triggers** — challenge, criticism, others' success; notice the defensive voice they summon.
2. **Hear the fixed-mindset voice** — then answer it back in growth-mindset language.
3. **Praise process, not traits** — value effort, strategy, and progress over "smart" or "talented."
4. **Add "yet"** — "I can't do this" becomes "I can't do this *yet*," turning failure into a stage.
5. **Treat setbacks as information** — ask what the failure teaches and what to try next.
6. **Choose stretch over safety** — pick tasks that grow you over tasks that merely protect your image.

---

## Run It

~21 days catching fixed-mindset reactions and reframing them. Pairs with The Artist's Way, and the Confidence and Relapse & Restart guides.`,
  },
  {
    id: 'pkg-seven-habits',
    title: 'The 7 Habits of Highly Effective People',
    category: 'identity_purpose',
    book: {
      title: 'The 7 Habits of Highly Effective People',
      author: 'Stephen R. Covey',
      year: 1989,
    },
    description:
      'Build effectiveness from the inside out — principles of character that move you from dependence to lasting interdependence.',
    guideIds: ['guide-confidence'],
    body: `## The Thesis

Lasting effectiveness flows from character, not personality tricks — principles you build from the inside out. Covey's seven habits move you from dependence to independence (the private victory) to interdependence (the public victory), grounded in choosing your response and acting from a clear sense of what matters most.

---

## The Method

1. **Be proactive** — between stimulus and response lies your freedom to choose; work inside your circle of influence.
2. **Begin with the end in mind** — write a personal mission from your deepest values and lead your life by it.
3. **Put first things first** — schedule around the important-but-not-urgent (Quadrant II), not the tyranny of the urgent.
4. **Think win-win** — seek mutual benefit from a mindset of abundance, not scarcity.
5. **Seek first to understand, then to be understood** — listen empathically before you make your case.
6. **Synergize** — value differences to reach solutions neither side had alone.
7. **Sharpen the saw** — renew body, mind, heart, and spirit so the other six stay sustainable.

---

## Run It

~30 days, one habit deepened at a time, starting with a personal mission statement. Pairs with Mindset and the Confidence guide.`,
  },

  // ── Body & Health ──────────────────────────────────────────────────────────
  {
    id: 'pkg-why-we-sleep',
    title: 'Why We Sleep',
    category: 'body_health',
    book: { title: 'Why We Sleep', author: 'Matthew Walker', year: 2017 },
    description:
      'Sleep is the single most powerful reset for brain and body. Protect it like the keystone it is.',
    guideIds: [],
    body: `## The Thesis

Sleep is not an optional luxury but the most effective single thing you can do to reset brain and body — it consolidates memory, regulates emotion and appetite, and clears metabolic waste from the brain. Routinely sleeping under seven hours measurably erodes mood, focus, immunity, and longevity. Most "I'm fine on six hours" is impairment you've simply stopped noticing.

---

## The Method

1. **Anchor a fixed wake time** — the same wake time every day, weekends included, stabilizes your clock more than bedtime does.
2. **Give yourself a 7–9 hour opportunity** — count time *in bed*, not just time asleep.
3. **Time your light** — bright light early; dim and screen-free in the last hour, so darkness can cue melatonin.
4. **Manage caffeine and alcohol** — no caffeine after early afternoon; alcohol fragments sleep and blocks REM.
5. **Cool and darken the room** — a drop in core temperature initiates sleep (~18°C / 65°F), and darkness deepens it.
6. **Protect a wind-down ritual** — a consistent calming routine tells the brain to power down; if sleep won't come, get up and reset.

---

## Run It

~21 days holding a fixed wake time and a wind-down ritual. Educational — see a clinician for a suspected sleep disorder. Pairs with Spark and Breath.`,
  },
  {
    id: 'pkg-spark',
    title: 'Spark',
    category: 'body_health',
    book: { title: 'Spark', author: 'John J. Ratey', year: 2008 },
    description:
      'Exercise is the best intervention for the brain — movement is what builds focus, lifts mood, and buffers stress.',
    guideIds: ['guide-deep-focus'],
    body: `## The Thesis

Exercise isn't just for the body — it's the single best intervention for the brain. Movement floods the brain with the chemistry (BDNF, dopamine, serotonin, norepinephrine) that grows new neurons, sharpens focus, lifts mood, and buffers stress and anxiety. You don't exercise only to look good; you exercise to think and feel well.

---

## The Method

1. **Move most days** — regular aerobic activity matters more through consistency than through intensity.
2. **Get the heart rate up** — moderate-to-vigorous cardio is what triggers the neurochemical cascade.
3. **Use a session to regulate mood** — exercise is a fast, drug-free lever on anxiety and low mood.
4. **Train before hard thinking** — a morning bout primes attention and learning for hours afterward.
5. **Add some complexity** — skill-based or coordinated movement engages the brain more than pure repetition.
6. **Anchor it to a cue** — stack the session onto an existing routine so it survives low-motivation days.

---

## Run It

~21 days building a near-daily movement habit. Educational — consult a clinician before starting a new regimen. Pairs with Why We Sleep and the Deep Focus guide.`,
  },
  {
    id: 'pkg-breath',
    title: 'Breath',
    category: 'body_health',
    book: { title: 'Breath', author: 'James Nestor', year: 2020 },
    description:
      'How you breathe — slow, nasal, low — is a direct dial on your nervous system, and most of us have it set wrong.',
    guideIds: ['guide-fear-and-panic'],
    body: `## The Thesis

How you breathe — not just *that* you breathe — shapes health, calm, and performance, and most of us do it badly. Slow, light, nasal, diaphragmatic breathing tunes the nervous system; chronic fast mouth-breathing keeps it on alert. The body's fastest lever on its own state is the breath.

---

## The Method

1. **Breathe through your nose** — nasal breathing filters, humidifies, and improves oxygen uptake; start with daytime awareness.
2. **Slow it down** — aim for roughly 5.5–6 breaths per minute to balance the nervous system.
3. **Lengthen the exhale** — a longer out-breath activates the parasympathetic "rest and digest" response.
4. **Breathe less, not more** — light, low-volume breathing builds CO₂ tolerance and steadies you.
5. **Use the breath to down-shift stress** — a few slow nasal exhales interrupt the fight-or-flight spiral.
6. **Breathe low** — let the belly, not the chest, do the work.

---

## Run It

~14 days of daily slow nasal breathing, plus reset breaths under stress. Pairs with Why We Sleep and the Fear & Panic guide.`,
  },

  // ── Relationships ──────────────────────────────────────────────────────────
  {
    id: 'pkg-attached',
    title: 'Attached',
    category: 'relationships',
    book: { title: 'Attached', author: 'Amir Levine & Rachel Heller', year: 2010 },
    description:
      'Attachment science decoded: know your style and your partner’s, and turn confusing dynamics into something you can name and change.',
    guideIds: ['guide-empathy-on-command', 'guide-communication-process'],
    body: `## The Thesis

Adult attachment science explains why relationships feel the way they do. Most people lean secure, anxious, or avoidant, and those styles drive predictable patterns of closeness and conflict. Knowing your style and your partner's — and moving toward secure functioning — turns baffling dynamics into something you can name and work with.

---

## The Method

1. **Identify your style** — secure, anxious, or avoidant, from how you respond to closeness and to distance.
2. **Spot the anxious–avoidant trap** — the pursue-and-withdraw cycle that keeps both partners stuck.
3. **Recognize protest behavior** — anxious activating strategies (excessive contact, scorekeeping) and avoidant deactivating ones (distancing, fault-finding).
4. **Communicate effectively** — state needs directly and early, without games or hints.
5. **Prioritize secure connection** — choose partners and behaviors that offer a stable, responsive base.
6. **Use the dependency paradox** — being reliably there for each other increases independence, it doesn't reduce it.

---

## Run It

~21 days observing your patterns and practicing one direct need-statement at a time. Pairs with Nonviolent Communication, and the Empathy on Command and Communication Process guides.`,
  },
  {
    id: 'pkg-seven-principles',
    title: 'The Seven Principles for Making Marriage Work',
    category: 'relationships',
    book: {
      title: 'The Seven Principles for Making Marriage Work',
      author: 'John M. Gottman',
      year: 1999,
    },
    description:
      'Decades in the “Love Lab” distilled: friendship and repair, not the absence of conflict, are what make a relationship last.',
    guideIds: ['guide-empathy-on-command', 'guide-let-go-of-rage'],
    body: `## The Thesis

From decades in the "Love Lab," Gottman can predict relationship outcomes with startling accuracy — and it comes down to the quality of friendship and how couples handle conflict, not whether they fight. Most conflict is perpetual and unsolvable; thriving couples build love maps, turn toward each other, and repair. The "Four Horsemen" — criticism, contempt, defensiveness, stonewalling — predict the end.

---

## The Method

1. **Build love maps** — keep knowing your partner's inner world as it changes.
2. **Nurture fondness and admiration** — actively express appreciation and respect.
3. **Turn toward, not away** — answer the small bids for attention; these micro-moments are the bank account.
4. **Accept influence** — share power; let your partner's opinions actually move you.
5. **Solve solvable problems** — soften your start-up, repair early, and self-soothe when flooded.
6. **Overcome gridlock and build shared meaning** — find the dreams inside perpetual conflicts and create rituals and goals together.

---

## Run It

~21 days, one principle practiced per day, watching for the Four Horsemen. Pairs with Attached, and the Empathy on Command and Let Go of Rage guides.`,
  },
  {
    id: 'pkg-five-love-languages',
    title: 'The 5 Love Languages',
    category: 'relationships',
    book: { title: 'The 5 Love Languages', author: 'Gary Chapman', year: 1992 },
    description:
      'People give and receive love in different dialects; most frustration is a mistranslation. Learn to speak theirs.',
    guideIds: ['guide-empathy-on-command'],
    body: `## The Thesis

People give and receive love in different "languages," and most relationship frustration is a mistranslation — pouring effort into a dialect your partner doesn't read. Learn to speak the other person's primary love language and the same effort finally lands. Love is a choice and an action, not only a feeling.

---

## The Method

1. **Learn the five languages** — words of affirmation, quality time, acts of service, gifts, and physical touch.
2. **Find your partner's primary language** — watch what they request and how they express love to others.
3. **Find your own** — so you can ask for what actually fills your tank.
4. **Speak their language deliberately** — invest where it registers, even when it isn't natural to you.
5. **Keep the tank full** — regular small expressions beat rare grand gestures.
6. **Make requests, not demands** — invite love in your language without coercion.

---

## Run It

~14 days speaking your partner's primary language every day. Pairs with The Seven Principles for Making Marriage Work and the Empathy on Command guide.`,
  },

  // ── Wealth & Money ─────────────────────────────────────────────────────────
  {
    id: 'pkg-psychology-of-money',
    title: 'The Psychology of Money',
    category: 'wealth_money',
    book: { title: 'The Psychology of Money', author: 'Morgan Housel', year: 2020 },
    description:
      'Doing well with money is about behavior, not math — define “enough,” save, and let time do the heavy lifting.',
    guideIds: [],
    body: `## The Thesis

Doing well with money has little to do with intelligence and almost everything to do with behavior — and behavior is hard to teach. Wealth is what you *don't* see: the income not spent. Reasonable beats rational, and a margin of error plus a long runway matter far more than precision.

---

## The Method

1. **Define "enough"** — know when more stops being worth it; a goalpost that never stops moving is the real danger.
2. **Save, regardless of reason** — your savings rate, not your returns, is the lever you actually control.
3. **Let compounding run** — wealth comes from long, uninterrupted time invested, not from brilliant timing.
4. **Build room for error** — a margin of safety lets you survive the unexpected and stay in the game.
5. **Be reasonable, not coldly rational** — pick a strategy you can actually stick with through fear and boredom.
6. **Buy freedom** — the highest dividend money pays is control over your time; spend less to own more of it.

---

## Run It

~21 days; define your "enough," automate one saving transfer, and stop checking the market. Pairs with I Will Teach You to Be Rich and Your Money or Your Life.`,
  },
  {
    id: 'pkg-i-will-teach-you',
    title: 'I Will Teach You to Be Rich',
    category: 'wealth_money',
    book: {
      title: 'I Will Teach You to Be Rich',
      author: 'Ramit Sethi',
      year: 2009,
    },
    description:
      'Set up an automated money system once, then spend extravagantly on what you love and cut mercilessly on what you don’t.',
    guideIds: ['guide-context-design'],
    body: `## The Thesis

You don't need to be a finance expert or give up your morning coffee — you need a system that runs automatically and the freedom to spend lavishly on what you love by cutting costs mercilessly on what you don't. Set it up once, automate it, and personal finance becomes nearly hands-off. Done beats perfect.

---

## The Method

1. **Optimize your accounts** — a no-fee checking account, a high-yield savings account, a retirement account, and the right credit card.
2. **Automate the flow** — on payday, money auto-routes to bills, savings, investments, and guilt-free spending.
3. **Invest simply** — low-cost index or target-date funds; consistency over stock-picking.
4. **Use a conscious spending plan** — fund what you love, slash what you don't, and feel no guilt about either.
5. **Win the big wins** — focus on a few high-impact moves (automation, fees, asset allocation), not daily penny-pinching.
6. **Grow the top line** — negotiate and raise income; the upside on earning dwarfs the downside on frugality.

---

## Run It

~14 days to stand up the automated system. Pairs with The Psychology of Money, and the Context Beats Willpower guide — automation is environment design for money.`,
  },
  {
    id: 'pkg-your-money-or-your-life',
    title: 'Your Money or Your Life',
    category: 'wealth_money',
    book: {
      title: 'Your Money or Your Life',
      author: 'Vicki Robin & Joe Dominguez',
      year: 1992,
    },
    description:
      'Money is life energy you trade for it. Price every purchase in hours of your life and spend only on what truly fulfills you.',
    guideIds: [],
    body: `## The Thesis

Money is something you trade your life energy for — so every purchase has a true cost measured in *hours of your life*, not dollars. Track that exchange honestly and you can align spending with what genuinely fulfills you, find your "enough," and move toward financial independence. The aim isn't more; it's enough, plus freedom.

---

## The Method

1. **Make peace with the past** — tally lifetime earnings and current net worth, without shame.
2. **Compute your real hourly wage** — subtract work's hidden costs to see what an hour of your life actually nets.
3. **Track every dollar** — record income and expenses, converting each to "hours of life energy."
4. **Ask the three questions** — did this spending bring fulfillment proportional to the life energy, and does it align with my values?
5. **Find the fulfillment curve** — locate "enough," the peak past which more brings less.
6. **Chart toward independence** — watch monthly expenses fall and investment income rise until the two lines cross.

---

## Run It

~21 days tracking spending as life energy. Pairs with The Psychology of Money and I Will Teach You to Be Rich.`,
  },

  // ── Philosophy & Worldview ─────────────────────────────────────────────────
  {
    id: 'pkg-obstacle-is-the-way',
    title: 'The Obstacle Is the Way',
    category: 'philosophy_worldview',
    book: {
      title: 'The Obstacle Is the Way',
      author: 'Ryan Holiday',
      year: 2014,
    },
    description:
      'The Stoic operating system for adversity: control your perception, take action, and train the will — the obstacle becomes the path.',
    guideIds: ['guide-let-go-of-rage', 'guide-fear-and-panic'],
    body: `## The Thesis

The Stoics taught that we don't control events, only our response — and that the obstacle in the path becomes the path. Every setback carries the raw material for the action it seems to block. Perception, action, and will are the three disciplines that turn adversity into advantage.

---

## The Method

1. **Discipline of perception** — choose how you see; strip an event of panic and label it objectively.
2. **Hold the dichotomy of control** — spend energy only on your own judgments and actions, never on what isn't yours.
3. **Discipline of action** — move, persist, and iterate on the problem in front of you instead of waiting.
4. **Find the opportunity in the obstacle** — ask what this difficulty makes possible or teaches.
5. **Discipline of will** — build inner resilience for what you truly cannot change; accept it without resignation.
6. **Memento mori, amor fati** — let mortality clarify your priorities, and love what happens as fuel.

---

## Run It

~21 days reframing one daily obstacle through perception → action → will. Pairs with Meditations, and the Let Go of Rage and Fear & Panic guides.`,
  },
  {
    id: 'pkg-meditations',
    title: 'Meditations',
    category: 'philosophy_worldview',
    book: { title: 'Meditations', author: 'Marcus Aurelius', year: 180 },
    description:
      'A Roman emperor’s private notebook — the most practical Stoic handbook ever kept, read as daily reminders, not theory.',
    guideIds: ['guide-rumination-interrupt', 'guide-let-go-of-rage'],
    body: `## The Thesis

The private journal of a Roman emperor, written only to himself, is the most practical handbook of Stoic life ever kept. Its core: you control your judgments, not the world; virtue is the only true good; and the present moment is all you ever actually hold. Read it as daily reminders, not as theory.

---

## The Method

1. **Separate what's up to you** — your opinions, intentions, and actions — from what isn't, and let the rest go.
2. **Examine your impressions** — pause before assenting; the disturbance lives in your judgment, not the event.
3. **Act for the common good** — you are part of a whole; do your work without complaint.
4. **Accept impermanence** — everything changes and passes; resenting that is the only real harm.
5. **Take the view from above** — zoom out to see how small most worries truly are.
6. **Return to the present** — the past and future aren't yours to lose; live *this* moment well.

---

## Run It

~21 days, one short passage and one applied reminder per day. Pairs with The Obstacle Is the Way, and the Rumination Interrupt and Let Go of Rage guides.`,
  },
  {
    id: 'pkg-mans-search-for-meaning',
    title: "Man's Search for Meaning",
    category: 'philosophy_worldview',
    book: {
      title: "Man's Search for Meaning",
      author: 'Viktor E. Frankl',
      year: 1946,
    },
    description:
      'The last human freedom is to choose your attitude. Meaning — in work, love, or how you bear suffering — is what sustains a life.',
    guideIds: ['guide-relapse-and-restart'],
    body: `## The Thesis

A psychiatrist's account of surviving the Nazi camps, and the therapy it produced: even when everything is stripped away, the last human freedom remains — to choose your attitude toward your circumstances. Meaning, not pleasure or power, is the primary human drive, and it can be found even in unavoidable suffering. He who has a *why* to live can bear almost any *how*.

---

## The Method

1. **Claim the last freedom** — between what happens and your response lies your choice of attitude.
2. **Find meaning in work** — commit to a task, a creation, a contribution larger than yourself.
3. **Find meaning in love** — in caring deeply for someone, and in experiencing beauty and connection.
4. **Find meaning in unavoidable suffering** — when you can't change a situation, you can still choose how you bear it.
5. **Apply dereflection** — shift attention off yourself and your symptoms onto a meaningful goal outside you.
6. **Live as if a second time** — act now as though you were correcting the mistakes of a first life.

---

## Run It

~21 days; name your current "why" and act from it daily. A reflective, not clinical, program. Pairs with The Obstacle Is the Way and the Relapse & Restart guide.`,
  },
];
