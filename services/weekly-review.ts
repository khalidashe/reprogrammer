/**
 * Weekly Review — Phase 1 of the Capture → Profile → Weekly Review pillar (REP-5).
 *
 * Phase 1 builds the review screen entirely from data we already have:
 * check-in results (yes / tried / no), reframed into a per-behavior weekly
 * picture with a week-over-week delta and the note the user wrote on a hard day.
 * No new capture primitives yet — those are later phases. Pure + injectable
 * `now` so it is unit-testable.
 */
import { Behavior, BehaviorKind, CaptureEntry, CaptureType, CheckIn, Domain } from '../types';
import type { DayStatus } from './consistency';
import { calculateStreak } from './streak';

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_DAYS = 7;

function startOfLocalDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface WeekWindow {
  /** Inclusive start (local midnight). */
  start: number;
  /** Exclusive end (local midnight = start of the day after the window). */
  end: number;
  /** 0 = the 7 days ending today, 1 = the prior 7 days, … */
  weeksAgo: number;
}

/** A rolling, day-aligned 7-day window; `weeksAgo` shifts it back a full week. */
export function weekWindow(now: number, weeksAgo: number): WeekWindow {
  const end = startOfLocalDay(now) + DAY_MS - weeksAgo * WEEK_DAYS * DAY_MS;
  const start = end - WEEK_DAYS * DAY_MS;
  return { start, end, weeksAgo };
}

function bestOfDay(dayCheckIns: CheckIn[]): DayStatus {
  if (dayCheckIns.some((c) => c.result === 'yes')) return 'yes';
  if (dayCheckIns.some((c) => c.result === 'tried')) return 'tried';
  if (dayCheckIns.length > 0) return 'no';
  return 'none';
}

/** Best-of-day status for each of the window's 7 days, oldest → newest. */
export function windowDayStatuses(
  checkIns: CheckIn[],
  behaviorId: string,
  window: WeekWindow
): DayStatus[] {
  const mine = checkIns.filter((c) => c.behaviorId === behaviorId);
  return Array.from({ length: WEEK_DAYS }, (_, i) => {
    const dayStart = window.start + i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    return bestOfDay(mine.filter((c) => c.at >= dayStart && c.at < dayEnd));
  });
}

/** Per-day sums of capture values across the window's 7 days, oldest → newest. */
export function windowDailySums(
  entries: CaptureEntry[],
  behaviorId: string,
  window: WeekWindow
): number[] {
  const mine = entries.filter((e) => e.behaviorId === behaviorId);
  return Array.from({ length: WEEK_DAYS }, (_, i) => {
    const dayStart = window.start + i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    return mine
      .filter((e) => e.at >= dayStart && e.at < dayEnd)
      .reduce((sum, e) => sum + e.value, 0);
  });
}

function countStatus(statuses: DayStatus[], s: DayStatus): number {
  return statuses.filter((x) => x === s).length;
}

export interface CaptureSummary {
  type: CaptureType;
  label: string;
  unit?: string;
  direction: 'up' | 'down';
  /** Daily sums for the window's 7 days, oldest → newest. */
  daily: number[];
  total: number;
  loggedDays: number;
  /** Average per logged day (0 when nothing logged). */
  avg: number;
  prevTotal: number;
  /** % change in total vs the prior week; null when prior week was 0. */
  deltaPct: number | null;
  /** Whether the delta moved in the behavior's good direction; null if no prior. */
  improved: boolean | null;
  /** Number of entries logged this window (= completions for templates). */
  count: number;
  /** Most recent entry this window — used to surface a template's latest fields. */
  last?: { at: number; fields?: Record<string, string> };
}

/** The note the user wrote on a hard day — a 'tried' reflection beats a 'no'. */
function pickHardestNote(
  checkIns: CheckIn[],
  behaviorId: string,
  window: WeekWindow
): BehaviorWeek['hardestNote'] {
  const inWindow = checkIns
    .filter(
      (c) =>
        c.behaviorId === behaviorId &&
        c.at >= window.start &&
        c.at < window.end &&
        !!c.note &&
        c.note.trim().length > 0 &&
        (c.result === 'tried' || c.result === 'no')
    )
    .sort((a, b) => b.at - a.at);
  const chosen = inWindow.find((c) => c.result === 'tried') ?? inWindow[0];
  if (!chosen) return undefined;
  return {
    at: chosen.at,
    text: chosen.note!.trim(),
    result: chosen.result as 'tried' | 'no',
  };
}

export interface BehaviorWeek {
  behaviorId: string;
  title: string;
  kind: BehaviorKind;
  /** Life domain, when set — lets the Coach match a recovery program (REP-6 Phase 2). */
  domain?: Domain;
  /** The Library guide this behavior came from, when any (REP-6 Phase 2). */
  libraryGuideId?: string;
  level: number;
  dayStatuses: DayStatus[];
  successDays: number;
  triedDays: number;
  showedUpDays: number;
  reps: number;
  prevSuccessDays: number;
  /** % change in success days vs the prior week; null when prior week was 0. */
  deltaPct: number | null;
  /** Current streak; only computed for the live week (weeksAgo === 0). */
  streak?: number;
  hardestNote?: { at: number; text: string; result: 'tried' | 'no' };
  /** Present when the behavior has a captureSpec (REP-5 Phase 2). */
  capture?: CaptureSummary;
}

function buildCaptureSummary(
  behavior: Behavior,
  entries: CaptureEntry[],
  window: WeekWindow,
  prevWindow: WeekWindow
): CaptureSummary | undefined {
  const spec = behavior.captureSpec;
  if (!spec) return undefined;
  const daily = windowDailySums(entries, behavior.id, window);
  const total = daily.reduce((a, b) => a + b, 0);
  const loggedDays = daily.filter((v) => v > 0).length;
  const prevTotal = windowDailySums(entries, behavior.id, prevWindow).reduce((a, b) => a + b, 0);
  const deltaPct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;
  const improved =
    deltaPct === null ? null : spec.direction === 'up' ? total >= prevTotal : total <= prevTotal;
  const windowEntries = entries
    .filter((e) => e.behaviorId === behavior.id && e.at >= window.start && e.at < window.end)
    .sort((a, b) => b.at - a.at);
  const last = windowEntries[0]
    ? { at: windowEntries[0].at, fields: windowEntries[0].fields }
    : undefined;
  return {
    type: spec.type,
    label: spec.label,
    unit: spec.unit,
    direction: spec.direction,
    daily,
    total,
    loggedDays,
    avg: loggedDays > 0 ? total / loggedDays : 0,
    prevTotal,
    deltaPct,
    improved,
    count: windowEntries.length,
    last,
  };
}

export function buildBehaviorWeek(
  behavior: Behavior,
  checkIns: CheckIn[],
  entries: CaptureEntry[],
  window: WeekWindow,
  prevWindow: WeekWindow,
  includeStreak: boolean
): BehaviorWeek {
  const dayStatuses = windowDayStatuses(checkIns, behavior.id, window);
  const prevStatuses = windowDayStatuses(checkIns, behavior.id, prevWindow);
  const successDays = countStatus(dayStatuses, 'yes');
  const prevSuccessDays = countStatus(prevStatuses, 'yes');
  const reps = checkIns.filter(
    (c) =>
      c.behaviorId === behavior.id &&
      c.at >= window.start &&
      c.at < window.end &&
      c.result === 'yes'
  ).length;

  return {
    behaviorId: behavior.id,
    title: behavior.title,
    kind: behavior.kind,
    domain: behavior.domain,
    libraryGuideId: behavior.libraryGuideId,
    level: behavior.level,
    dayStatuses,
    successDays,
    triedDays: countStatus(dayStatuses, 'tried'),
    showedUpDays: successDays + countStatus(dayStatuses, 'tried'),
    reps,
    prevSuccessDays,
    deltaPct:
      prevSuccessDays > 0
        ? Math.round(((successDays - prevSuccessDays) / prevSuccessDays) * 100)
        : null,
    streak: includeStreak ? calculateStreak(behavior.id, checkIns) : undefined,
    hardestNote: pickHardestNote(checkIns, behavior.id, window),
    capture: buildCaptureSummary(behavior, entries, window, prevWindow),
  };
}

export interface WeeklyReview {
  window: WeekWindow;
  behaviors: BehaviorWeek[];
  totalReps: number;
  totalSuccessDays: number;
  totalPrevSuccessDays: number;
  showedUp: boolean;
  regressed: boolean;
}

export function buildWeeklyReview(
  behaviors: Behavior[],
  checkIns: CheckIn[],
  entries: CaptureEntry[],
  now: number,
  weeksAgo: number = 0
): WeeklyReview {
  const window = weekWindow(now, weeksAgo);
  const prevWindow = weekWindow(now, weeksAgo + 1);
  const rows = behaviors
    .filter((b) => !b.hidden)
    .map((b) => buildBehaviorWeek(b, checkIns, entries, window, prevWindow, weeksAgo === 0));

  const totalReps = rows.reduce((n, r) => n + r.reps, 0);
  const totalSuccessDays = rows.reduce((n, r) => n + r.successDays, 0);
  const totalPrevSuccessDays = rows.reduce((n, r) => n + r.prevSuccessDays, 0);

  return {
    window,
    behaviors: rows,
    totalReps,
    totalSuccessDays,
    totalPrevSuccessDays,
    showedUp: rows.some((r) => r.showedUpDays > 0),
    regressed: totalSuccessDays < totalPrevSuccessDays,
  };
}

/** Human label for a window, e.g. "Jun 11 – 17" or "May 29 – Jun 4". */
export function formatWindowLabel(window: WeekWindow): string {
  const start = new Date(window.start);
  const lastDay = new Date(window.end - DAY_MS);
  const mon = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  return start.getMonth() === lastDay.getMonth()
    ? `${mon(start)} ${start.getDate()} – ${lastDay.getDate()}`
    : `${mon(start)} ${start.getDate()} – ${mon(lastDay)} ${lastDay.getDate()}`;
}
