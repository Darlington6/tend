import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { RitualIconName } from '../constants/theme';

export type TimeOfDay = 'morning' | 'evening' | 'anytime';

export type Ritual = {
  id: string;
  user_id: string | null;
  name: string;
  icon: RitualIconName;
  color: string;
  time_of_day: TimeOfDay;
  sort_order: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  dirty: number;
};

export type Completion = {
  id: string;
  user_id: string | null;
  ritual_id: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  dirty: number;
};

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS rituals (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      time_of_day TEXT NOT NULL DEFAULT 'anytime',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived_at TEXT,
      dirty INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS completions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      ritual_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      dirty INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (ritual_id) REFERENCES rituals(id)
    );
    CREATE INDEX IF NOT EXISTS idx_completions_ritual_date
      ON completions(ritual_id, completed_at);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_ritual_day
      ON completions(ritual_id, completed_at)
      WHERE deleted_at IS NULL;
  `);
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function getActiveRituals(db: SQLiteDatabase): Promise<Ritual[]> {
  return db.getAllAsync<Ritual>(
    'SELECT * FROM rituals WHERE archived_at IS NULL ORDER BY sort_order ASC, created_at ASC'
  );
}

export async function insertRitual(
  db: SQLiteDatabase,
  ritual: Pick<Ritual, 'name' | 'icon' | 'color' | 'time_of_day'>
): Promise<string> {
  const id = Crypto.randomUUID();
  const timestamp = nowIso();
  await db.runAsync(
    `INSERT INTO rituals (id, name, icon, color, time_of_day, sort_order, created_at, updated_at, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [id, ritual.name, ritual.icon, ritual.color, ritual.time_of_day, Date.now(), timestamp, timestamp]
  );
  return id;
}

export async function archiveRitual(db: SQLiteDatabase, ritualId: string) {
  const timestamp = nowIso();
  await db.runAsync(
    'UPDATE rituals SET archived_at = ?, updated_at = ?, dirty = 1 WHERE id = ?',
    [timestamp, timestamp, ritualId]
  );
}

export async function getCompletionsForRitual(
  db: SQLiteDatabase,
  ritualId: string
): Promise<Completion[]> {
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE ritual_id = ? AND deleted_at IS NULL ORDER BY completed_at DESC',
    [ritualId]
  );
}

export async function getAllCompletionsSince(
  db: SQLiteDatabase,
  sinceDate: string
): Promise<Completion[]> {
  return db.getAllAsync<Completion>(
    'SELECT * FROM completions WHERE completed_at >= ? AND deleted_at IS NULL ORDER BY completed_at DESC',
    [sinceDate]
  );
}

export async function toggleCompletion(
  db: SQLiteDatabase,
  ritualId: string,
  isoDate: string
): Promise<'completed' | 'uncompleted'> {
  const existing = await db.getFirstAsync<Completion>(
    'SELECT * FROM completions WHERE ritual_id = ? AND completed_at = ? AND deleted_at IS NULL',
    [ritualId, isoDate]
  );
  const timestamp = nowIso();
  if (existing) {
    await db.runAsync(
      'UPDATE completions SET deleted_at = ?, updated_at = ?, dirty = 1 WHERE id = ?',
      [timestamp, timestamp, existing.id]
    );
    return 'uncompleted';
  }
  await db.runAsync(
    `INSERT INTO completions (id, ritual_id, completed_at, created_at, updated_at, dirty)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [Crypto.randomUUID(), ritualId, isoDate, timestamp, timestamp]
  );
  return 'completed';
}

export async function getDirtyRituals(db: SQLiteDatabase): Promise<Ritual[]> {
  return db.getAllAsync<Ritual>('SELECT * FROM rituals WHERE dirty = 1');
}

export async function getDirtyCompletions(db: SQLiteDatabase): Promise<Completion[]> {
  return db.getAllAsync<Completion>('SELECT * FROM completions WHERE dirty = 1');
}

export async function markRitualsSynced(db: SQLiteDatabase, ids: string[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE rituals SET dirty = 0 WHERE id IN (${placeholders})`, ids);
}

export async function markCompletionsSynced(db: SQLiteDatabase, ids: string[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE completions SET dirty = 0 WHERE id IN (${placeholders})`, ids);
}

export async function upsertRitualFromRemote(db: SQLiteDatabase, ritual: Ritual) {
  const local = await db.getFirstAsync<Ritual>('SELECT * FROM rituals WHERE id = ?', [ritual.id]);
  if (local && local.updated_at >= ritual.updated_at) return;
  await db.runAsync(
    `INSERT INTO rituals (id, user_id, name, icon, color, time_of_day, sort_order, created_at, updated_at, archived_at, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT (id) DO UPDATE SET
       user_id = excluded.user_id, name = excluded.name, icon = excluded.icon,
       color = excluded.color, time_of_day = excluded.time_of_day,
       sort_order = excluded.sort_order, updated_at = excluded.updated_at,
       archived_at = excluded.archived_at, dirty = 0`,
    [
      ritual.id,
      ritual.user_id,
      ritual.name,
      ritual.icon,
      ritual.color,
      ritual.time_of_day,
      ritual.sort_order,
      ritual.created_at,
      ritual.updated_at,
      ritual.archived_at,
    ]
  );
}

export async function upsertCompletionFromRemote(db: SQLiteDatabase, completion: Completion) {
  const local = await db.getFirstAsync<Completion>('SELECT * FROM completions WHERE id = ?', [
    completion.id,
  ]);
  if (local && local.updated_at >= completion.updated_at) return;
  await db.runAsync(
    `INSERT INTO completions (id, user_id, ritual_id, completed_at, created_at, updated_at, deleted_at, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT (id) DO UPDATE SET
       user_id = excluded.user_id, completed_at = excluded.completed_at,
       updated_at = excluded.updated_at, deleted_at = excluded.deleted_at, dirty = 0`,
    [
      completion.id,
      completion.user_id,
      completion.ritual_id,
      completion.completed_at,
      completion.created_at,
      completion.updated_at,
      completion.deleted_at,
    ]
  );
}

export async function claimLocalRowsForUser(db: SQLiteDatabase, userId: string) {
  await db.runAsync('UPDATE rituals SET user_id = ?, dirty = 1 WHERE user_id IS NULL', [userId]);
  await db.runAsync('UPDATE completions SET user_id = ?, dirty = 1 WHERE user_id IS NULL', [
    userId,
  ]);
}
