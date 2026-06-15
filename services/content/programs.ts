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
];
