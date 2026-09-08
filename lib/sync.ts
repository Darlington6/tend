import type { SQLiteDatabase } from 'expo-sqlite';
import { supabase } from './supabase';
import {
  claimLocalRowsForUser,
  getDirtyCompletions,
  getDirtyRituals,
  markCompletionsSynced,
  markRitualsSynced,
  upsertCompletionFromRemote,
  upsertRitualFromRemote,
  type Completion,
  type Ritual,
} from './db';

async function pushRituals(db: SQLiteDatabase, userId: string) {
  const dirty = await getDirtyRituals(db);
  if (dirty.length === 0) return;

  const rows = dirty.map(({ dirty: _dirty, ...ritual }) => ({ ...ritual, user_id: userId }));
  const { error } = await supabase.from('rituals').upsert(rows);
  if (error) throw error;

  await markRitualsSynced(
    db,
    dirty.map((r) => r.id)
  );
}

async function pushCompletions(db: SQLiteDatabase, userId: string) {
  const dirty = await getDirtyCompletions(db);
  if (dirty.length === 0) return;

  const rows = dirty.map(({ dirty: _dirty, ...completion }) => ({
    ...completion,
    user_id: userId,
  }));
  const { error } = await supabase.from('completions').upsert(rows);
  if (error) throw error;

  await markCompletionsSynced(
    db,
    dirty.map((c) => c.id)
  );
}

async function pullRituals(db: SQLiteDatabase, userId: string) {
  const { data, error } = await supabase.from('rituals').select('*').eq('user_id', userId);
  if (error) throw error;

  for (const row of (data ?? []) as Ritual[]) {
    await upsertRitualFromRemote(db, row);
  }
}

async function pullCompletions(db: SQLiteDatabase, userId: string) {
  const { data, error } = await supabase.from('completions').select('*').eq('user_id', userId);
  if (error) throw error;

  for (const row of (data ?? []) as Completion[]) {
    await upsertCompletionFromRemote(db, row);
  }
}

/**
 * Pushes local changes up, then pulls remote changes down, so a device's
 * own edits win over a stale remote copy of the same row before other
 * devices' edits are merged in. Local SQLite stays the read model the UI
 * renders from; this only reconciles it with Supabase.
 */
export async function syncNow(db: SQLiteDatabase, userId: string) {
  await claimLocalRowsForUser(db, userId);
  await pushRituals(db, userId);
  await pushCompletions(db, userId);
  await pullRituals(db, userId);
  await pullCompletions(db, userId);
}
