/**
 * Weekly Review — Phase 1 of the Capture → Profile → Weekly Review pillar (REP-5).
 *
 * Phase 1 builds the review screen entirely from data we already have:
 * check-in results (yes / tried / no), reframed into a per-behavior weekly
 * picture with a week-over-week delta and the note the user wrote on a hard day.
 * No new capture primitives yet — those are later phases. Pure + injectable
 * `now` so it is unit-testable.
 */
import { Behavior, BehaviorKind, CheckIn } from '../types';
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

function countStatus(statuses: DayStatus[], s: DayStatus): number {
  return statuses.filter((x) => x === s).length;
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
}

export function buildBehaviorWeek(
  behavior: Behavior,
  checkIns: CheckIn[],
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
  now: number,
  weeksAgo: number = 0
): WeeklyReview {
  const window = weekWindow(now, weeksAgo);
  const prevWindow = weekWindow(now, weeksAgo + 1);
  const rows = behaviors
    .filter((b) => !b.hidden)
    .map((b) => buildBehaviorWeek(b, checkIns, window, prevWindow, weeksAgo === 0));

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
