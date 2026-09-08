import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuthStore } from '../lib/auth-store';
import { useRitualsStore } from '../lib/store';
import { syncNow } from '../lib/sync';
import { colors, radii, spacing, typography } from '../constants/theme';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { session, initializing, signIn, signUp, signOut } = useAuthStore();
  const loadAll = useRitualsStore((state) => state.loadAll);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedLabel, setLastSyncedLabel] = useState<string | null>(null);

  const handleAuth = async (mode: 'signIn' | 'signUp') => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    const result = mode === 'signIn' ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
  };

  const handleSyncNow = async () => {
    if (!session) return;
    setSyncing(true);
    try {
      await syncNow(db, session.user.id);
      await loadAll(db);
      setLastSyncedLabel(new Date().toLocaleTimeString());
    } catch {
      setError('Sync failed. Check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text style={typography.body}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[typography.heading, styles.sectionTitle]}>Sync across devices</Text>
        <Text style={[typography.caption, styles.sectionBody]}>
          Tend works fully offline without an account. Sign in to also sync your rituals
          across devices.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryButton, submitting && styles.buttonDisabled]}
          disabled={submitting}
          onPress={() => handleAuth('signIn')}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'Please wait...' : 'Sign in'}</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, submitting && styles.buttonDisabled]}
          disabled={submitting}
          onPress={() => handleAuth('signUp')}
        >
          <Text style={styles.secondaryButtonText}>Create account</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[typography.heading, styles.sectionTitle]}>Signed in</Text>
      <Text style={[typography.body, styles.sectionBody]}>{session.user.email}</Text>

      <Pressable
        style={[styles.primaryButton, syncing && styles.buttonDisabled]}
        disabled={syncing}
        onPress={handleSyncNow}
      >
        <Text style={styles.primaryButtonText}>{syncing ? 'Syncing...' : 'Sync now'}</Text>
      </Pressable>
      {lastSyncedLabel ? (
        <Text style={[typography.caption, styles.syncedLabel]}>
          Last synced at {lastSyncedLabel}
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.secondaryButton} onPress={signOut}>
        <Text style={styles.secondaryButtonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionBody: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.ember,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.ember,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#B04A2E',
    marginTop: spacing.sm,
  },
  syncedLabel: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
