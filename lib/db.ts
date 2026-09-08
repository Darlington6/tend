import type { SQLiteDatabase } from 'expo-sqlite';
import type { RitualIconName } from '../constants/theme';

export type TimeOfDay = 'morning' | 'evening' | 'anytime';

export type Ritual = {
  id: number;
  name: string;
  icon: RitualIconName;
  color: string;
  time_of_day: TimeOfDay;
  sort_order: number;
  created_at: string;
  archived_at: string | null;
};

export type Completion = {
  id: number;
  ritual_id: number;
  completed_at: string;
};

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS rituals (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      time_of_day TEXT NOT NULL DEFAULT 'anytime',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      archived_at TEXT
    );
    CREATE TABLE IF NOT EXISTS completions (
      id INTEGER PRIMARY KEY NOT NULL,
      ritual_id INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (ritual_id) REFERENCES rituals(id)
    );
    CREATE INDEX IF NOT EXISTS idx_completions_ritual_date
      ON completions(ritual_id, completed_at);
  `);
}

export async function getActiveRituals(db: SQLiteDatabase): Promise<Ritual[]> {
  return db.getAllAsync<Ritual>(
    'SELECT * FROM rituals WHERE archived_at IS NULL ORDER BY sort_order ASC, created_at ASC'
  );
}

export async function insertRitual(
  db: SQLiteDatabase,
  ritual: Pick<Ritual, 'name' | 'icon' | 'color' | 'time_of_day'>
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO rituals (name, icon, color, time_of_day, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      ritual.name,
      ritual.icon,
      ritual.color,
      ritual.time_of_day,
      Date.now(),
      new Date().toISOString(),
    ]
  );
  return result.lastInsertRowId;
}

export async function archiveRitual(db: SQLiteDatabase, ritualId: number) {
  await db.runAsync('UPDATE rituals SET archived_at = ? WHERE id = ?', [
    new Date().toISOString(),
    ritualId,
  ]);
}

export async function getCompletionsForRitual(
  db: SQLiteDatabase,
  ritualId: number
): Promise<Completion[]> {
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE ritual_id = ? ORDER BY completed_at DESC',
    [ritualId]
  );
}

export async function getAllCompletionsSince(
  db: SQLiteDatabase,
  sinceDate: string
): Promise<Completion[]> {
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE completed_at >= ? ORDER BY completed_at DESC',
    [sinceDate]
  );
}

export async function toggleCompletion(
  db: SQLiteDatabase,
  ritualId: number,
  isoDate: string
): Promise<'completed' | 'uncompleted'> {
  const existing = await db.getFirstAsync<Completion>(
    'SELECT * FROM completions WHERE ritual_id = ? AND completed_at = ?',
    [ritualId, isoDate]
  );
  if (existing) {
    await db.runAsync('DELETE FROM completions WHERE id = ?', [existing.id]);
    return 'uncompleted';
  }
  await db.runAsync(
    'INSERT INTO completions (ritual_id, completed_at) VALUES (?, ?)',
    [ritualId, isoDate]
  );
  return 'completed';
}
