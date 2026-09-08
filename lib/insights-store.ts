import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getActiveRituals, getAllCompletionsSince } from './db';
import { addDays, todayIsoDate } from './date';
import {
  computeBestWeekday,
  computeTimeOfDayBreakdown,
  computeWeeklyBars,
  type BestWeekday,
  type DayBar,
  type TimeOfDayCounts,
} from './insights';

const INSIGHTS_WINDOW_DAYS = 90;

type InsightsState = {
  loading: boolean;
  weeklyBars: DayBar[];
  bestWeekday: BestWeekday | null;
  timeOfDayCounts: TimeOfDayCounts;
  totalCompletions: number;
  load: (db: SQLiteDatabase) => Promise<void>;
};

export const useInsightsStore = create<InsightsState>((set) => ({
  loading: true,
  weeklyBars: [],
  bestWeekday: null,
  timeOfDayCounts: { morning: 0, evening: 0, anytime: 0 },
  totalCompletions: 0,

  load: async (db) => {
    set({ loading: true });
    const [rituals, completions] = await Promise.all([
      getActiveRituals(db),
      getAllCompletionsSince(db, addDays(todayIsoDate(), -INSIGHTS_WINDOW_DAYS)),
    ]);

    set({
      weeklyBars: computeWeeklyBars(completions, rituals.length),
      bestWeekday: computeBestWeekday(completions),
      timeOfDayCounts: computeTimeOfDayBreakdown(completions, rituals),
      totalCompletions: completions.length,
      loading: false,
    });
  },
}));
