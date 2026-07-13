/**
 * Intent-based cadence (REP-37).
 *
 * The scheduler works in raw `intervalMinutes`, but that's an engine knob, not a
 * user decision. The create flow speaks in intent — Gentle / Steady / Intense —
 * and this module is the single mapping between the two. No schema change:
 * cadence is purely a friendly layer over the `intervalMinutes` we already store.
 */

export type CadenceId = 'gentle' | 'steady' | 'intense';

export interface CadenceOption {
  id: CadenceId;
  label: string;
  /** One-line "what this feels like" shown under the option. */
  description: string;
  /** Base interval handed to the scheduler; the level engine widens it over time. */
  intervalMinutes: number;
}

/** Ordered gentlest → most frequent. All intervals are existing INTERVAL_PRESETS. */
export const CADENCES: CadenceOption[] = [
  { id: 'gentle', label: 'Gentle', description: 'A handful of nudges a day', intervalMinutes: 30 },
  { id: 'steady', label: 'Steady', description: 'A regular, steady rhythm', intervalMinutes: 15 },
  { id: 'intense', label: 'Intense', description: 'Frequent — for habits that fight back', intervalMinutes: 5 },
];

export const DEFAULT_CADENCE: CadenceId = 'steady';

export function cadenceById(id: CadenceId): CadenceOption {
  return CADENCES.find((c) => c.id === id) ?? CADENCES[1];
}

export function intervalForCadence(id: CadenceId): number {
  return cadenceById(id).intervalMinutes;
}

/**
 * Map an existing `intervalMinutes` back to the nearest cadence — used when
 * editing a behavior (including older ones created with a raw interval) so the
 * Cadence step opens on the closest match.
 */
export function cadenceForInterval(intervalMinutes: number): CadenceId {
  let best = CADENCES[0];
  let bestDelta = Infinity;
  for (const c of CADENCES) {
    const delta = Math.abs(c.intervalMinutes - intervalMinutes);
    if (delta < bestDelta) {
      best = c;
      bestDelta = delta;
    }
  }
  return best.id;
}
