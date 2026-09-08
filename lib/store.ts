import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import {
  Ritual,
  TimeOfDay,
  getActiveRituals,
  insertRitual,
  archiveRitual,
  getAllCompletionsSince,
  toggleCompletion,
} from './db';
import { addDays, todayIsoDate } from './date';
import { computeStreak } from './streak';
import type { RitualIconName } from '../constants/theme';

const STREAK_WINDOW_DAYS = 120;

export type RitualWithStreak = Ritual & {
  streak: number;
  completedToday: boolean;
};

type RitualsState = {
  rituals: RitualWithStreak[];
  loading: boolean;
  loadAll: (db: SQLiteDatabase) => Promise<void>;
  addRitual: (
    db: SQLiteDatabase,
    input: { name: string; icon: RitualIconName; color: string; time_of_day: TimeOfDay }
  ) => Promise<void>;
  completeToday: (db: SQLiteDatabase, ritualId: number) => Promise<void>;
  removeRitual: (db: SQLiteDatabase, ritualId: number) => Promise<void>;
};

export const useRitualsStore = create<RitualsState>((set, get) => ({
  rituals: [],
  loading: true,

  loadAll: async (db) => {
    set({ loading: true });
    const [rituals, completions] = await Promise.all([
      getActiveRituals(db),
      getAllCompletionsSince(db, addDays(todayIsoDate(), -STREAK_WINDOW_DAYS)),
    ]);

    const completionsByRitual = new Map<number, string[]>();
    for (const completion of completions) {
      const dates = completionsByRitual.get(completion.ritual_id) ?? [];
      dates.push(completion.completed_at);
      completionsByRitual.set(completion.ritual_id, dates);
    }

    const today = todayIsoDate();
    const withStreaks: RitualWithStreak[] = rituals.map((ritual) => {
      const dates = completionsByRitual.get(ritual.id) ?? [];
      return {
        ...ritual,
        streak: computeStreak(dates),
        completedToday: dates.includes(today),
      };
    });

    set({ rituals: withStreaks, loading: false });
  },

  addRitual: async (db, input) => {
    await insertRitual(db, input);
    await get().loadAll(db);
  },

  completeToday: async (db, ritualId) => {
    await toggleCompletion(db, ritualId, todayIsoDate());
    await get().loadAll(db);
  },

  removeRitual: async (db, ritualId) => {
    await archiveRitual(db, ritualId);
    await get().loadAll(db);
  },
}));
