import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import RevenueCatUI from 'react-native-purchases-ui';
import { colors, radii, spacing, typography } from '../constants/theme';
import { PREMIUM_ENTITLEMENT_ID } from '../constants/revenuecat';
import { useInsightsStore } from '../lib/insights-store';
import { useEntitlementsStore } from '../lib/entitlements-store';
import { WeekBarChart } from '../components/WeekBarChart';

const TIME_OF_DAY_LABELS = { morning: 'Morning', evening: 'Evening', anytime: 'Anytime' } as const;

export default function InsightsScreen() {
  const db = useSQLiteContext();
  const isPremium = useEntitlementsStore((state) => state.isPremium);
  const { loading, weeklyBars, bestWeekday, timeOfDayCounts, totalCompletions, load } =
    useInsightsStore();
  const [presentingPaywall, setPresentingPaywall] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load(db);
    }, [db, load])
  );

  const handleUnlock = async () => {
    setPresentingPaywall(true);
    try {
      await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: PREMIUM_ENTITLEMENT_ID,
      });
    } finally {
      setPresentingPaywall(false);
    }
  };

  const maxTimeOfDayCount = Math.max(...Object.values(timeOfDayCounts), 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={typography.title}>Insights</Text>

      <View style={styles.card}>
        <Text style={[typography.caption, styles.cardLabel]}>Last 7 days</Text>
        {!loading && totalCompletions === 0 ? (
          <Text style={[typography.body, styles.emptyText]}>
            Complete a ritual to start seeing patterns here.
          </Text>
        ) : (
          <WeekBarChart bars={weeklyBars} />
        )}
      </View>

      {isPremium ? (
        <>
          <View style={styles.card}>
            <Text style={[typography.caption, styles.cardLabel]}>Most consistent day</Text>
            {bestWeekday ? (
              <>
                <Text style={typography.heading}>{bestWeekday.day}</Text>
                <Text style={[typography.caption, styles.cardHint]}>
                  {Math.round(bestWeekday.share * 100)}% of your check-ins land here
                </Text>
              </>
            ) : (
              <Text style={[typography.body, styles.emptyText]}>Not enough data yet.</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={[typography.caption, styles.cardLabel]}>By time of day</Text>
            {(Object.keys(TIME_OF_DAY_LABELS) as (keyof typeof TIME_OF_DAY_LABELS)[]).map(
              (key) => (
                <View key={key} style={styles.timeRow}>
                  <Text style={[typography.caption, styles.timeRowLabel]}>
                    {TIME_OF_DAY_LABELS[key]}
                  </Text>
                  <View style={styles.timeRowTrack}>
                    <View
                      style={[
                        styles.timeRowFill,
                        { width: `${(timeOfDayCounts[key] / maxTimeOfDayCount) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={[typography.caption, styles.timeRowCount]}>
                    {timeOfDayCounts[key]}
                  </Text>
                </View>
              )
            )}
          </View>
        </>
      ) : (
        <View style={[styles.card, styles.lockedCard]}>
          <Ionicons name="lock-closed-outline" size={22} color={colors.textMuted} />
          <Text style={[typography.heading, styles.lockedTitle]}>Unlock your patterns</Text>
          <Text style={[typography.caption, styles.lockedBody]}>
            Tend+ shows your most consistent day and how your rituals break down by time of day.
          </Text>
          <Pressable
            style={[styles.unlockButton, presentingPaywall && styles.unlockButtonDisabled]}
            onPress={handleUnlock}
            disabled={presentingPaywall}
          >
            <Text style={styles.unlockButtonText}>
              {presentingPaywall ? 'Loading...' : 'See Tend+'}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardLabel: {
    marginBottom: spacing.md,
  },
  cardHint: {
    marginTop: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  timeRowLabel: {
    width: 64,
  },
  timeRowTrack: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  timeRowFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.ember,
  },
  timeRowCount: {
    width: 24,
    textAlign: 'right',
  },
  lockedCard: {
    alignItems: 'center',
  },
  lockedTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  lockedBody: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  unlockButton: {
    backgroundColor: colors.ember,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  unlockButtonDisabled: {
    opacity: 0.5,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
