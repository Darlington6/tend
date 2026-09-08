import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../constants/theme';
import { RitualCard } from '../components/RitualCard';
import { useRitualsStore } from '../lib/store';
import { hasCompletedOnboarding } from '../lib/onboarding';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { rituals, loading, loadAll, completeToday } = useRitualsStore();
  const [onboardingStatus, setOnboardingStatus] = useState<'checking' | 'needed' | 'done'>(
    'checking'
  );

  useEffect(() => {
    hasCompletedOnboarding().then((completed) => {
      setOnboardingStatus(completed ? 'done' : 'needed');
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll(db);
    }, [db, loadAll])
  );

  if (onboardingStatus === 'checking') {
    return <View style={styles.container} />;
  }

  if (onboardingStatus === 'needed') {
    return <Redirect href="/onboarding" />;
  }

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={typography.caption}>{todayLabel}</Text>
            <Text style={typography.title}>Your rituals</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              hitSlop={12}
              onPress={() => router.push('/insights')}
              style={styles.settingsButton}
            >
              <Ionicons name="stats-chart-outline" size={22} color={colors.textMuted} />
            </Pressable>
            <Pressable
              hitSlop={12}
              onPress={() => router.push('/settings')}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>

      {!loading && rituals.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="flame-outline"
            size={40}
            color={colors.ember}
            style={styles.emptyIcon}
          />
          <Text style={[typography.heading, styles.emptyTitle]}>No rituals yet</Text>
          <Text style={[typography.caption, styles.emptyBody]}>
            Add a small morning or evening ritual to start tending your first streak.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rituals}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RitualCard
              ritual={item}
              onToggle={() => completeToday(db, item.id)}
              onPress={() => router.push(`/ritual/${item.id}`)}
            />
          )}
        />
      )}

      <Pressable style={styles.addButton} onPress={() => router.push('/ritual/new')}>
        <Text style={styles.addButtonText}>+ Add ritual</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
  },
  emptyBody: {
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    backgroundColor: colors.ember,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    shadowColor: colors.emberDark,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
