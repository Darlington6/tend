import { addDays, todayIsoDate } from './date';

/**
 * Streak counts consecutive completed days ending today or yesterday.
 * A miss today doesn't break the streak until tomorrow, so a ritual
 * completed daily still shows its streak throughout the current day.
 */
export function computeStreak(completedDates: string[]): number {
  const dates = new Set(completedDates);
  const today = todayIsoDate();
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
