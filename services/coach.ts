/**
 * The Coach — REP-6 Phase 1 (on-device insight, no LLM, no network).
 *
 * Reads the already-built Weekly Review and narrates it: a few ranked,
 * deterministic insights that tell the user something they'd miss scanning the
 * raw cards — what's working, where momentum is, and (gently) where the week
 * got hard. Pure and synchronous so it stays unit-testable and runs offline.
 *
 * Phase 2 (this file) adds the other half of the loop: every problem insight now
 * ends in one trackable "do" (a {@link CoachPrescriptionDraft}), and a later
 * review closes the loop — checking whether the paired behavior recovered. Still
 * deterministic, on-device, templated copy — no model. Cross-signal correlations
 * are Phase 3; LLM enrichment is Phase 4.
 */
import type { WeeklyReview, BehaviorWeek } from './weekly-review';
import type { CoachActionKind, CoachPrescription } from '../types';

export type CoachInsightKind =
  | 'cold_start'
  | 'best_week'
  | 'capture_win'
  | 'momentum'
  | 'showed_up'
  | 'steady'
  | 'regression'
  | 'loop_win'
  | 'loop_followup';

export type CoachTone = 'celebrate' | 'encourage' | 'support';

/**
 * The "do" half of a prescription — a trackable action the insight invites,
 * shown as a CTA. The screen performs it and (when `behaviorId` is set) records
 * a {@link CoachPrescription} so the next review can close the loop.
 */
export interface CoachPrescriptionDraft {
  action: CoachActionKind;
  /** Guide / program / adopt-template id the action opens. */
  targetId?: string;
  /** CTA text, e.g. "Start a recovery plan". */
  label: string;
  /** The behavior this helps; presence makes the prescription loop-tracked. */
  behaviorId?: string;
  /** Snapshot of the behavior's success days now — the loop's baseline. */
  baselineSuccessDays?: number;
}

export interface CoachInsight {
  /** Stable per kind (+behavior) — used for React keys and loop tracking. */
  id: string;
  kind: CoachInsightKind;
  tone: CoachTone;
  title: string;
  body: string;
  behaviorId?: string;
  /** Optional guide to open (e.g. relapse-and-restart on a hard week) — the "read". */
  guideId?: string;
  /** Optional trackable action paired with the read — the "do". */
  prescription?: CoachPrescriptionDraft;
}

const MAX_INSIGHTS = 3;
const STREAK_MOMENTUM = 3; // days
const CAPTURE_DELTA = 15; // % move worth calling out
const REGRESSION_DELTA = -34; // a single behavior's success-day drop worth a gentle note
const BEST_WEEK_DELTA = 25; // % rise in good days that earns a "strong week"

// Close the loop in the week *after* a prescription — not the same week (too
// soon), not forever (no nagging). The review window rolls daily, so the loop
// is derived from how many days have passed, never from a mutated status — that
// keeps it visible all week instead of vanishing the moment it's "resolved".
const DAY_MS = 24 * 60 * 60 * 1000;
const LOOP_MIN_DAYS = 7;
const LOOP_MAX_DAYS = 13;

const RELAPSE_GUIDE = 'guide-relapse-and-restart';

// The trackable "do" for a slip: the meta recovery program (atomic + tiny +
// never-miss-twice). Emotional behaviors get the CBT program instead.
const RECOVERY_PROGRAM = 'pkg-rebuild-your-habits';
const EMOTIONAL_RECOVERY_PROGRAM = 'pkg-feeling-good';

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

// ── Prescriptions (the "do") ───────────────────────────────────────────────

function recoveryProgramFor(row: BehaviorWeek): string {
  return row.domain === 'emotional' ? EMOTIONAL_RECOVERY_PROGRAM : RECOVERY_PROGRAM;
}

/**
 * The trackable action to pair with an insight, or undefined when the insight is
 * pure encouragement (wins don't nag). Deterministic — no model.
 */
function prescriptionFor(
  ins: CoachInsight,
  review: WeeklyReview
): CoachPrescriptionDraft | undefined {
  if (ins.kind === 'cold_start') {
    return { action: 'add_behavior', label: 'Add your first behavior' };
  }
  if (ins.kind === 'regression') {
    const row = ins.behaviorId
      ? review.behaviors.find((b) => b.behaviorId === ins.behaviorId)
      : undefined;
    return {
      action: 'open_program',
      targetId: row ? recoveryProgramFor(row) : RECOVERY_PROGRAM,
      label: 'Start a recovery plan',
      behaviorId: row?.behaviorId,
      baselineSuccessDays: row?.successDays,
    };
  }
  return undefined;
}

// ── Close the loop ─────────────────────────────────────────────────────────

function loopWin(row: BehaviorWeek, p: CoachPrescription): CoachInsight {
  return {
    id: `loop_win:${row.behaviorId}`,
    kind: 'loop_win',
    tone: 'celebrate',
    behaviorId: row.behaviorId,
    title: `${row.title} is bouncing back`,
    body: `Up to ${row.successDays} good ${row.successDays === 1 ? 'day' : 'days'} from ${p.baselineSuccessDays} when you started the plan — that’s the loop closing.`,
  };
}

function loopFollowup(row: BehaviorWeek): CoachInsight {
  return {
    id: `loop_followup:${row.behaviorId}`,
    kind: 'loop_followup',
    tone: 'support',
    behaviorId: row.behaviorId,
    title: `Still finding ${row.title}’s rhythm`,
    body: 'Last week’s plan hasn’t moved the needle yet. Shrink it — a two-minute version you can’t fail beats a big one you skip.',
    guideId: RELAPSE_GUIDE,
  };
}

/** Days from a prescription's window to the current review window. */
function daysSince(review: WeeklyReview, p: CoachPrescription): number {
  return Math.round((review.window.start - p.windowStart) / DAY_MS);
}

/** A prescription is "live" — recent enough to suppress fresh nudges for its behavior. */
function isLivePrescription(review: WeeklyReview, p: CoachPrescription): boolean {
  return p.status !== 'dismissed' && !!p.behaviorId && daysSince(review, p) <= LOOP_MAX_DAYS;
}

/**
 * For each prescription whose loop window has arrived (the week after it was
 * made) and whose behavior is still here, emit a loop insight — celebrate the
 * recovery or gently follow up. Purely window-derived, so it shows for the whole
 * week rather than vanishing once "resolved".
 */
function closeLoops(review: WeeklyReview, prescriptions: CoachPrescription[]): CoachInsight[] {
  const out: CoachInsight[] = [];
  for (const p of prescriptions) {
    if (p.status === 'dismissed' || !p.behaviorId) continue;
    const elapsed = daysSince(review, p);
    if (elapsed < LOOP_MIN_DAYS || elapsed > LOOP_MAX_DAYS) continue;
    const row = review.behaviors.find((b) => b.behaviorId === p.behaviorId);
    if (!row) continue;
    out.push(row.successDays > p.baselineSuccessDays ? loopWin(row, p) : loopFollowup(row));
  }
  return out;
}

/**
 * Up to {@link MAX_INSIGHTS} ranked insights for the given review window. Loop
 * checks lead (the "steering" moment), then what's working, then at most one
 * gentle support note carrying a trackable action. Dedupes so the same behavior
 * doesn't dominate, and skips fresh nudges for behaviors already prescribed for.
 *
 * `prescriptions` is optional and pure: pass the user's accepted prescriptions
 * to enable close-the-loop; omit it for plain narration (e.g. unit tests).
 */
export function buildCoachInsights(
  review: WeeklyReview,
  prescriptions: CoachPrescription[] = []
): CoachInsight[] {
  if (review.behaviors.length === 0) return [];

  const totalShowedUp = review.behaviors.reduce((n, row) => n + row.showedUpDays, 0);
  if (totalShowedUp === 0) {
    const cs = coldStart();
    cs.prescription = prescriptionFor(cs, review);
    return [cs];
  }

  // Loop closing leads. Behaviors with a live (recent) prescription are "used"
  // so they don't also draw a fresh win/regression note — their loop insight, or
  // the just-prescribed quiet, stands in. Older prescriptions fall out of this
  // set, so a behavior that slips again later gets fresh treatment.
  const loops = closeLoops(review, prescriptions);
  const used = new Set<string>(
    prescriptions
      .filter((p) => isLivePrescription(review, p))
      .map((p) => p.behaviorId as string)
  );
  const chosen: CoachInsight[] = [...loops];

  // Positives in priority order; skip a later one that repeats a covered behavior.
  const positives = [bestWeek(review), captureWin(review), momentum(review), showedUp(review)];
  for (const ins of positives) {
    if (!ins) continue;
    if (ins.behaviorId && used.has(ins.behaviorId)) continue;
    if (ins.behaviorId) used.add(ins.behaviorId);
    chosen.push(ins);
  }

  const support = regression(review);
  if (support && !(support.behaviorId && used.has(support.behaviorId))) {
    support.prescription = prescriptionFor(support, review);
    chosen.push(support);
  }

  if (chosen.length === 0) return [steady(review)];
  return chosen.slice(0, MAX_INSIGHTS);
}
