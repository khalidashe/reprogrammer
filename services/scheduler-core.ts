/**
 * Pure, side-effect-free scheduling helpers.
 *
 * Kept separate from `notifications.ts` (which depends on expo-notifications
 * and the Zustand store) so the algorithm can be unit-tested without RN.
 */
import { effectiveIntervalMinutes } from './levels';
import type { Behavior, AppProfile } from '../types';

export const JITTER_RATIO = 0.2;
export const MIN_GAP_RATIO = 0.6;
export const SCHEDULE_LEAD_MS = 1000;

/**
 * True when a behavior is currently paused — either indefinitely ("until I turn
 * it back on", REP-34) or within a timed pause window. Centralizes the check
 * that used to be copy-pasted across the detail screen, dashboard, and tiles.
 */
export function isBehaviorPaused(
  b: Pick<Behavior, 'pausedUntil' | 'pausedIndefinitely'>,
  now: number = Date.now()
): boolean {
  if (b.pausedIndefinitely) return true;
  return b.pausedUntil != null && b.pausedUntil > now;
}

/**
 * True when global reminders are muted (REP-35) — either indefinitely or within
 * a timed mute window. While active, the scheduler cancels everything and
 * schedules nothing until the user un-mutes.
 */
export function isReminderMuteActive(
  p: Pick<AppProfile, 'remindersMutedUntil'>,
  now: number = Date.now()
): boolean {
  const m = p.remindersMutedUntil;
  if (m === 'indefinite') return true;
  return typeof m === 'number' && m > now;
}

export function parseHHmm(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  return { h: h ?? 0, m: m ?? 0 };
}

export function setLocalTimeOnDate(date: Date, hhmm: string): number {
  const { h, m } = parseHHmm(hhmm);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

/** Local end-of-day timestamp (23:59:59.999) for the given moment (default: now). */
export function endOfLocalDay(at: number = Date.now()): number {
  const d = new Date(at);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function hashSeed(behaviorId: string, key: string): number {
  let h = 2166136261;
  const input = `${behaviorId}::${key}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns true if `candidateMs` falls inside the given quiet window for the day
 * `dayDate`. Handles windows that span midnight (e.g., 22:00–07:00). An empty
 * window (from === to) disables filtering.
 */
export function isInQuietHours(
  candidateMs: number,
  dayDate: Date,
  quietHours?: { from: string; to: string }
): boolean {
  if (!quietHours) return false;
  if (quietHours.from === quietHours.to) return false;
  const fromMs = setLocalTimeOnDate(dayDate, quietHours.from);
  const toMs = setLocalTimeOnDate(dayDate, quietHours.to);
  if (toMs > fromMs) {
    return candidateMs >= fromMs && candidateMs < toMs;
  }
  return candidateMs >= fromMs || candidateMs < toMs;
}

export function generateTimesForDay(args: {
  date: Date;
  windowFrom: string;
  windowTo: string;
  intervalMinutes: number;
  level: number;
  now: number;
  rng: () => number;
  maxPings: number;
  quietHours?: { from: string; to: string };
  pausedUntil?: number;
}): number[] {
  const {
    date,
    windowFrom,
    windowTo,
    intervalMinutes,
    level,
    now,
    rng,
    maxPings,
    quietHours,
    pausedUntil,
  } = args;
  const windowStart = setLocalTimeOnDate(date, windowFrom);
  const windowEnd = setLocalTimeOnDate(date, windowTo);
  const fullWindowMs = windowEnd - windowStart;
  if (fullWindowMs <= 0 || intervalMinutes <= 0 || maxPings <= 0) return [];

  const effMin = effectiveIntervalMinutes(intervalMinutes, level);
  const effMs = effMin * 60 * 1000;
  const minGapMs = effMs * MIN_GAP_RATIO;
  const earliest = Math.max(now + SCHEDULE_LEAD_MS, windowStart);

  const times: number[] = [];
  let anchor = windowStart;
  let lastScheduled = -Infinity;

  while (anchor < windowEnd && times.length < maxPings) {
    const jitter = (rng() - 0.5) * 2 * JITTER_RATIO * effMs;
    const candidate = anchor + jitter;
    anchor += effMs;

    if (candidate >= windowEnd) break;
    if (candidate < earliest) continue;
    if (pausedUntil && candidate < pausedUntil) continue;
    if (candidate - lastScheduled < minGapMs) continue;
    if (isInQuietHours(candidate, date, quietHours)) continue;

    times.push(Math.floor(candidate));
    lastScheduled = candidate;
  }
  return times;
}
