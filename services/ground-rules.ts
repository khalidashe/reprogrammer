export interface GroundRule {
  id: string;
  title: string;
  body: string;
  citation: string;
}

export const GROUND_RULES: GroundRule[] = [
  {
    id: 'rule-time',
    title: 'Time, or delete it.',
    body: "If you won't set aside daily practice time — not reading, actual doing — delete the app now. The app cannot do the work for you.",
    citation: 'Sheeran, 2002 — 72% of behavioral intentions are never acted on',
  },
  {
    id: 'rule-silence',
    title: 'Improve in silence.',
    body: "Announcing you're changing triggers social resistance and gives your brain a premature reward that kills drive. Tell nobody.",
    citation: 'Gollwitzer et al., 2009',
  },
  {
    id: 'rule-exercise',
    title: 'The exercise is everything.',
    body: "Reading the guides doesn't change you. Doing the exercise does. Start before you feel ready. The first rep is the hardest.",
    citation: 'Amabile & Kramer, 2011 — the Progress Principle',
  },
  {
    id: 'rule-no-magic',
    title: 'This app will not magically change you.',
    body: 'It gives structure and guidance. The effort is entirely yours. Browsing the features and journaling about change is not change.',
    citation: 'Lally et al., 2010 — habit formation averages 66 days (range 18–254)',
  },
  {
    id: 'rule-timeline',
    title: 'This is a 3 to 12 month journey.',
    body: 'Most people quit not because the method failed, but because they set the wrong timeline. Lower the expectation. Raise the commitment.',
    citation: 'Polivy & Herman, 2002 — False Hope Syndrome',
  },
];
