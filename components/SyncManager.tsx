import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuthStore } from '../lib/auth-store';
import { useRitualsStore } from '../lib/store';
import { syncNow } from '../lib/sync';

/**
 * Renders nothing. Reconciles local SQLite with Supabase whenever a user
 * is signed in, on sign-in and whenever the app returns to the foreground.
 * Signed-out users keep working entirely offline against local SQLite.
 */
export function SyncManager() {
  const db = useSQLiteContext();
  const session = useAuthStore((state) => state.session);
  const loadAll = useRitualsStore((state) => state.loadAll);
  const isSyncing = useRef(false);

  const runSync = useCallback(async () => {
    if (!session || isSyncing.current) return;
    isSyncing.current = true;
    try {
      await syncNow(db, session.user.id);
      await loadAll(db);
    } catch (error) {
      console.warn('Sync failed', error);
    } finally {
      isSyncing.current = false;
    }
  }, [db, session, loadAll]);

  useEffect(() => {
    runSync();
  }, [runSync]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') runSync();
    });
    return () => subscription.remove();
  }, [runSync]);

  return null;
}
