import { CheckIn } from '../types';
import { startOfDay, subDays, isToday } from 'date-fns';

export function calculateStreak(behaviorId: string, checkIns: CheckIn[]): number {
  const behaviorCheckIns = checkIns
    .filter(ci => ci.behaviorId === behaviorId)
    .sort((a, b) => b.at - a.at);

  if (behaviorCheckIns.length === 0) return 0;

  let streak = 0;
  let currentDate = startOfDay(Date.now()).getTime();
  let checkInIndex = 0;

  while (checkInIndex < behaviorCheckIns.length) {
    const checkIn = behaviorCheckIns[checkInIndex];
    const checkInDate = startOfDay(checkIn.at).getTime();

    if (checkInDate === currentDate) {
      if (checkIn.result === 'yes') {
        streak++;
        currentDate = subDays(currentDate, 1).getTime();
        checkInIndex++;
      } else {
        break;
      }
    } else if (checkInDate < currentDate) {
      const daysDiff = Math.floor((currentDate - checkInDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        currentDate = checkInDate;
      } else {
        break;
      }
    } else {
      checkInIndex++;
    }
  }

  return streak;
}
