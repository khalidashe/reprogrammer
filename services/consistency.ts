import { CheckIn } from '../types';

/**
 * Per-day outcome for a behavior's recent history.
 * `none` means the day had no check-ins at all.
 */
export type DayStatus = 'yes' | 'tried' | 'no' | 'none';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Best-of-day status for the last `n` calendar days for a single behavior,
 * ordered oldest → today. Within a day, `yes` beats `tried` beats `no`; a day
 * with no check-ins is `none`. This mirrors the streak model's "best-of-day"
 * rule and powers the dashboard week-strip and the detail consistency row.
 *
 * `now` is injectable so tests are deterministic; it defaults to the wall clock.
 */
export function lastNDaysStatus(
  checkIns: CheckIn[],
  behaviorId: string,
  n: number,
  now: number = Date.now()
): DayStatus[] {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  const mine = checkIns.filter((c) => c.behaviorId === behaviorId);

  return Array.from({ length: n }, (_, i) => {
    const dayStart = todayStartMs - (n - 1 - i) * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const day = mine.filter((c) => c.at >= dayStart && c.at < dayEnd);
    if (day.some((c) => c.result === 'yes')) return 'yes';
    if (day.some((c) => c.result === 'tried')) return 'tried';
    if (day.length > 0) return 'no';
    return 'none';
  });
}
