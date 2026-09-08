import type { Completion, Ritual, TimeOfDay } from './db';
import { addDays, todayIsoDate } from './date';

export type DayBar = {
  date: string;
  label: string;
  rate: number;
};

/**
 * One bar per day for the last 7 days. Rate is completions that day over
 * the current active ritual count, a simplification (it doesn't account
 * for rituals added or archived partway through the window) that's fine
 * for an at-a-glance trend, not a precise historical denominator.
 */
export function computeWeeklyBars(completions: Completion[], activeRitualCount: number): DayBar[] {
  const today = todayIsoDate();
  const bars: DayBar[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const count = completions.filter((c) => c.completed_at === date).length;
    const rate = activeRitualCount > 0 ? Math.min(count / activeRitualCount, 1) : 0;
    const label = new Date(`${date}T00:00:00`)
      .toLocaleDateString(undefined, { weekday: 'short' })
      .slice(0, 1);
    bars.push({ date, label, rate });
  }

  return bars;
}

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export type BestWeekday = {
  day: string;
  share: number;
};

export function computeBestWeekday(completions: Completion[]): BestWeekday | null {
  if (completions.length === 0) return null;

  const countsByWeekday = new Array(7).fill(0);
  for (const completion of completions) {
    const weekday = new Date(`${completion.completed_at}T00:00:00`).getDay();
    countsByWeekday[weekday] += 1;
  }

  const max = Math.max(...countsByWeekday);
  if (max === 0) return null;

  const index = countsByWeekday.indexOf(max);
  return { day: WEEKDAY_NAMES[index], share: max / completions.length };
}

export type TimeOfDayCounts = Record<TimeOfDay, number>;

export function computeTimeOfDayBreakdown(
  completions: Completion[],
  rituals: Ritual[]
): TimeOfDayCounts {
  const ritualById = new Map(rituals.map((ritual) => [ritual.id, ritual]));
  const counts: TimeOfDayCounts = { morning: 0, evening: 0, anytime: 0 };

  for (const completion of completions) {
    const ritual = ritualById.get(completion.ritual_id);
    if (!ritual) continue;
    counts[ritual.time_of_day] += 1;
  }

  return counts;
}
