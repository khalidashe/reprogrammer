/**
 * Deprecated: legacy FSRS-style API. Kept as a thin shim over the level-based
 * scheduler in `./levels.ts`. New code should import from `./levels.ts`.
 */
import { Behavior } from '../types';
import {
  INITIAL_LEVEL,
  effectiveIntervalMinutes as effIntervalLevel,
  perBehaviorDailyCap as perBehaviorDailyCapLevel,
  applyLevelUp,
  applyLapse,
  LAPSE_NO_THRESHOLD,
  INTERVAL_PRESETS as INTERVAL_PRESETS_NEW,
} from './levels';
import { calculateStreak } from './streak';

export const STABILITY_MIN = 0.5;
export const STABILITY_MAX = 168;
export const DIFFICULTY_MIN = 0;
export const DIFFICULTY_MAX = 1;
export const INITIAL_STABILITY = 4;
export const INITIAL_DIFFICULTY = 0.3;
export const INTERVAL_PRESETS = INTERVAL_PRESETS_NEW;

export function effectiveIntervalMinutes(intervalMinutes: number, stabilityOrLevel: number): number {
  const level = stabilityOrLevel > 5 ? Math.min(5, Math.ceil(stabilityOrLevel / 16) + 1) : stabilityOrLevel;
  return effIntervalLevel(intervalMinutes, level);
}

export function bucketLevel(stability: number): 1 | 2 | 3 | 4 | 5 {
  if (stability < 6) return 1;
  if (stability < 12) return 2;
  if (stability < 24) return 3;
  if (stability < 48) return 4;
  return 5;
}

/**
 * Deprecated: caller should call `applyLevelUp` / `applyLapse` based on
 * streak rather than per-tap mutations. Kept for back-compat callers.
 */
export function onYes(b: Behavior, _checkInsForBehavior?: number): Behavior {
  return b;
}

export function onNo(b: Behavior): Behavior {
  return b;
}

export function perBehaviorDailyCap(
  intervalMinutes: number,
  stabilityOrLevel: number,
  windowHours: number
): number {
  const level = stabilityOrLevel > 5 ? Math.min(5, Math.ceil(stabilityOrLevel / 16) + 1) : stabilityOrLevel;
  return perBehaviorDailyCapLevel(intervalMinutes, level, windowHours);
}

export { INITIAL_LEVEL, applyLevelUp, applyLapse, LAPSE_NO_THRESHOLD, calculateStreak };
