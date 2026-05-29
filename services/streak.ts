import { CheckIn } from '../types';
import { startOfDay, subDays, addDays } from 'date-fns';

type DayResult = 'yes' | 'tried' | 'no';

function bestResultForDay(
  behaviorCheckIns: CheckIn[],
  dayStart: number,
  dayEnd: number
): DayResult | null {
  const todays = behaviorCheckIns.filter((ci) => ci.at >= dayStart && ci.at < dayEnd);
  if (todays.length === 0) return null;
  if (todays.some((ci) => ci.result === 'yes')) return 'yes';
  if (todays.some((ci) => ci.result === 'tried')) return 'tried';
  return 'no';
}

export function calculateStreak(behaviorId: string, checkIns: CheckIn[]): number {
  const behaviorCheckIns = checkIns.filter((ci) => ci.behaviorId === behaviorId);
  if (behaviorCheckIns.length === 0) return 0;

  let streak = 0;
  let currentDate = startOfDay(Date.now()).getTime();

  // Bounded walk-back: at most 365 days to prevent pathological loops.
  for (let i = 0; i < 365; i++) {
    const dayEnd = startOfDay(addDays(currentDate, 1)).getTime();
    const result = bestResultForDay(behaviorCheckIns, currentDate, dayEnd);

    if (result === 'yes') {
      streak++;
      currentDate = startOfDay(subDays(currentDate, 1)).getTime();
    } else if (result === 'tried') {
      // Streak-preserving but not advancing — continue walking back.
      currentDate = startOfDay(subDays(currentDate, 1)).getTime();
    } else if (result === 'no') {
      break;
    } else {
      // No check-in for this day. Allow a 1-day grace: if yesterday has a
      // check-in, jump back to it; otherwise the streak ends.
      const yesterdayStart = startOfDay(subDays(currentDate, 1)).getTime();
      const hasYesterdayCheckIn = behaviorCheckIns.some(
        (ci) => ci.at >= yesterdayStart && ci.at < currentDate
      );
      if (hasYesterdayCheckIn) {
        currentDate = yesterdayStart;
      } else {
        break;
      }
    }
  }

  return streak;
}

/**
 * Counts consecutive "no" check-ins on the most recent calendar day for a
 * behavior. Used to detect lapse (3 consecutive nos → pause until EoD).
 *
 * `tried` and `yes` both interrupt the no-streak.
 */
export function consecutiveNoCount(behaviorId: string, checkIns: CheckIn[]): number {
  const todayStart = startOfDay(Date.now()).getTime();
  const todayEnd = startOfDay(addDays(todayStart, 1)).getTime();
  const todays = checkIns
    .filter((ci) => ci.behaviorId === behaviorId && ci.at >= todayStart && ci.at < todayEnd)
    .sort((a, b) => b.at - a.at);

  let count = 0;
  for (const ci of todays) {
    if (ci.result === 'no') count++;
    else break;
  }
  return count;
}
