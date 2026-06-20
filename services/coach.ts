/**
 * The Coach — REP-6 Phase 1 (on-device insight, no LLM, no network).
 *
 * Reads the already-built Weekly Review and narrates it: a few ranked,
 * deterministic insights that tell the user something they'd miss scanning the
 * raw cards — what's working, where momentum is, and (gently) where the week
 * got hard. Pure and synchronous so it stays unit-testable and runs offline.
 *
 * Phasing: prescriptions (pair a read with a do) and the close-the-loop check
 * are Phase 2; cross-signal correlations are Phase 3; LLM enrichment is Phase 4.
 * This phase deliberately uses templated copy, not a model.
 */
import type { WeeklyReview, BehaviorWeek } from './weekly-review';

export type CoachInsightKind =
  | 'cold_start'
  | 'best_week'
  | 'capture_win'
  | 'momentum'
  | 'showed_up'
  | 'steady'
  | 'regression';

export type CoachTone = 'celebrate' | 'encourage' | 'support';

export interface CoachInsight {
  /** Stable per kind (+behavior) — used for React keys and future loop tracking. */
  id: string;
  kind: CoachInsightKind;
  tone: CoachTone;
  title: string;
  body: string;
  behaviorId?: string;
  /** Optional guide to open (e.g. relapse-and-restart on a hard week). */
  guideId?: string;
}

const MAX_INSIGHTS = 3;
const STREAK_MOMENTUM = 3; // days
const CAPTURE_DELTA = 15; // % move worth calling out
const REGRESSION_DELTA = -34; // a single behavior's success-day drop worth a gentle note
const BEST_WEEK_DELTA = 25; // % rise in good days that earns a "strong week"

const RELAPSE_GUIDE = 'guide-relapse-and-restart';

function overallDelta(r: WeeklyReview): number | null {
  return r.totalPrevSuccessDays > 0
    ? Math.round(((r.totalSuccessDays - r.totalPrevSuccessDays) / r.totalPrevSuccessDays) * 100)
    : null;
}

function coldStart(): CoachInsight {
  return {
    id: 'cold_start',
    kind: 'cold_start',
    tone: 'encourage',
    title: 'Your coach is warming up',
    body: 'Check in across the week and I’ll start spotting what’s working — and what to adjust.',
  };
}

function bestWeek(r: WeeklyReview): CoachInsight | null {
  const delta = overallDelta(r);
  if (delta !== null && delta >= BEST_WEEK_DELTA) {
    return {
      id: 'best_week',
      kind: 'best_week',
      tone: 'celebrate',
      title: 'Your strongest week in a while',
      body: `Good days are up ${delta}% from last week — the momentum is real.`,
    };
  }
  if (delta === null && r.totalSuccessDays >= 4) {
    return {
      id: 'best_week',
      kind: 'best_week',
      tone: 'celebrate',
      title: 'Strong start',
      body: `${r.totalSuccessDays} good days out of the gate. That’s the baseline to beat.`,
    };
  }
  return null;
}

function captureWin(r: WeeklyReview): CoachInsight | null {
  let best: BehaviorWeek | null = null;
  for (const row of r.behaviors) {
    const c = row.capture;
    if (!c || c.improved !== true || c.deltaPct === null) continue;
    if (Math.abs(c.deltaPct) < CAPTURE_DELTA) continue;
    if (!best || Math.abs(c.deltaPct!) > Math.abs(best.capture!.deltaPct!)) best = row;
  }
  if (!best) return null;
  const c = best.capture!;
  const mag = Math.abs(c.deltaPct!);
  const falling = c.direction === 'down';
  return {
    id: `capture_win:${best.behaviorId}`,
    kind: 'capture_win',
    tone: 'celebrate',
    behaviorId: best.behaviorId,
    title: falling ? `${c.label} is falling` : `${c.label} is climbing`,
    body: `${falling ? 'Down' : 'Up'} ${mag}% on ${best.title} vs last week. Keep it going.`,
  };
}

function momentum(r: WeeklyReview): CoachInsight | null {
  let best: BehaviorWeek | null = null;
  for (const row of r.behaviors) {
    if ((row.streak ?? 0) < STREAK_MOMENTUM) continue;
    if (!best || (row.streak ?? 0) > (best.streak ?? 0)) best = row;
  }
  if (!best) return null;
  return {
    id: `momentum:${best.behaviorId}`,
    kind: 'momentum',
    tone: 'celebrate',
    behaviorId: best.behaviorId,
    title: `${best.title} is becoming automatic`,
    body: `${best.streak}-day streak. This is how a behavior turns into a default.`,
  };
}

function showedUp(r: WeeklyReview): CoachInsight | null {
  let best: BehaviorWeek | null = null;
  for (const row of r.behaviors) {
    if (row.triedDays < 2) continue;
    if (!best || row.showedUpDays > best.showedUpDays) best = row;
  }
  if (!best) return null;
  return {
    id: `showed_up:${best.behaviorId}`,
    kind: 'showed_up',
    tone: 'encourage',
    behaviorId: best.behaviorId,
    title: 'You showed up when it was hard',
    body: `${best.title}: you engaged ${best.showedUpDays}/7 days, even the tough ones. That counts.`,
  };
}

function regression(r: WeeklyReview): CoachInsight | null {
  let worst: BehaviorWeek | null = null;
  for (const row of r.behaviors) {
    if (row.deltaPct === null || row.deltaPct > REGRESSION_DELTA) continue;
    if (!worst || row.deltaPct < worst.deltaPct!) worst = row;
  }
  if (worst) {
    return {
      id: `regression:${worst.behaviorId}`,
      kind: 'regression',
      tone: 'support',
      behaviorId: worst.behaviorId,
      title: `Tougher week on ${worst.title}`,
      body: 'Down from last week — that’s data, not failure. Here’s how to come back.',
      guideId: RELAPSE_GUIDE,
    };
  }
  if (r.regressed) {
    return {
      id: 'regression',
      kind: 'regression',
      tone: 'support',
      title: 'A lighter week than last',
      body: 'Fewer good days than last week. That’s information, not failure — let’s reset.',
      guideId: RELAPSE_GUIDE,
    };
  }
  return null;
}

function steady(r: WeeklyReview): CoachInsight {
  return {
    id: 'steady',
    kind: 'steady',
    tone: 'encourage',
    title: 'Steady week',
    body: `${r.totalSuccessDays} good ${r.totalSuccessDays === 1 ? 'day' : 'days'}. Consistency is the whole game — keep the rhythm.`,
  };
}

/**
 * Up to {@link MAX_INSIGHTS} ranked insights for the given review window.
 * Leads with what's working and closes with at most one gentle support note;
 * dedupes so the same behavior doesn't dominate the card.
 */
export function buildCoachInsights(review: WeeklyReview): CoachInsight[] {
  if (review.behaviors.length === 0) return [];

  const totalShowedUp = review.behaviors.reduce((n, row) => n + row.showedUpDays, 0);
  if (totalShowedUp === 0) return [coldStart()];

  // Positives in priority order; skip a later one that repeats a behavior already covered.
  const positives = [bestWeek(review), captureWin(review), momentum(review), showedUp(review)];
  const used = new Set<string>();
  const chosen: CoachInsight[] = [];
  for (const ins of positives) {
    if (!ins) continue;
    if (ins.behaviorId && used.has(ins.behaviorId)) continue;
    if (ins.behaviorId) used.add(ins.behaviorId);
    chosen.push(ins);
  }

  const support = regression(review);
  if (support) chosen.push(support);

  if (chosen.length === 0) return [steady(review)];
  return chosen.slice(0, MAX_INSIGHTS);
}
