import { Behavior } from '../types';

export const STABILITY_MIN = 0.5;
export const STABILITY_MAX = 168;
export const DIFFICULTY_MIN = 0;
export const DIFFICULTY_MAX = 1;

export const INITIAL_STABILITY = 4;
export const INITIAL_DIFFICULTY = 0.3;

export const INTERVAL_PRESETS = [1, 2, 5, 10, 15, 20, 30, 45, 60] as const;

const NO_CASCADE = [0.8, 0.7, 0.5] as const;
const EFFECTIVE_INTERVAL_CAP_MIN = 120;
const PER_BEHAVIOR_DAILY_CAP = 20;

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function effectiveIntervalMinutes(intervalMinutes: number, stability: number): number {
  const g = 1 + Math.log2(1 + stability / 4);
  return clamp(intervalMinutes * g, intervalMinutes, EFFECTIVE_INTERVAL_CAP_MIN);
}

export function bucketLevel(stability: number): 1 | 2 | 3 | 4 | 5 {
  if (stability < 6) return 1;
  if (stability < 12) return 2;
  if (stability < 24) return 3;
  if (stability < 48) return 4;
  return 5;
}

export function onYes(b: Behavior): Behavior {
  const growth = 0.5 * (1 - b.difficulty) * Math.exp(-b.stability / 72);
  return {
    ...b,
    stability: clamp(b.stability * (1 + growth), STABILITY_MIN, STABILITY_MAX),
    difficulty: clamp(b.difficulty - 0.05, DIFFICULTY_MIN, DIFFICULTY_MAX),
    lastNoStreak: 0,
  };
}

export function onNo(b: Behavior): Behavior {
  const factor = NO_CASCADE[Math.min(b.lastNoStreak, NO_CASCADE.length - 1)];
  return {
    ...b,
    stability: clamp(b.stability * factor, STABILITY_MIN, STABILITY_MAX),
    difficulty: clamp(b.difficulty + 0.1, DIFFICULTY_MIN, DIFFICULTY_MAX),
    lastNoStreak: b.lastNoStreak + 1,
  };
}

export function perBehaviorDailyCap(
  intervalMinutes: number,
  stability: number,
  windowHours: number
): number {
  const effMin = effectiveIntervalMinutes(intervalMinutes, stability);
  const target = Math.floor((windowHours * 60) / effMin);
  return Math.max(1, Math.min(PER_BEHAVIOR_DAILY_CAP, target));
}
