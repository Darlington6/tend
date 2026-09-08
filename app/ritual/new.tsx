import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import {
  colors,
  FREE_RITUAL_LIMIT,
  radii,
  RITUAL_COLORS,
  RITUAL_ICONS,
  spacing,
  typography,
} from '../../constants/theme';
import { PREMIUM_ENTITLEMENT_ID } from '../../constants/revenuecat';
import { useRitualsStore } from '../../lib/store';
import { useEntitlementsStore } from '../../lib/entitlements-store';
import type { TimeOfDay } from '../../lib/db';

const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Anytime' },
];

export default function NewRitualScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { rituals, addRitual } = useRitualsStore();
  const isPremium = useEntitlementsStore((state) => state.isPremium);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(RITUAL_ICONS[0]);
  const [color, setColor] = useState(RITUAL_COLORS[0]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [saving, setSaving] = useState(false);
  const [presentingPaywall, setPresentingPaywall] = useState(false);

  const atFreeLimit = !isPremium && rituals.length >= FREE_RITUAL_LIMIT;

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await addRitual(db, { name: name.trim(), icon, color, time_of_day: timeOfDay });
    setSaving(false);
    router.back();
  };

  const handleUpgrade = async () => {
    setPresentingPaywall(true);
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: PREMIUM_ENTITLEMENT_ID,
      });
      if (result === PAYWALL_RESULT.ERROR) {
        console.warn('Paywall failed to present');
      }
    } finally {
      setPresentingPaywall(false);
    }
  };

  if (atFreeLimit) {
    return (
      <View style={styles.upgradeContainer}>
        <Ionicons
          name="sparkles-outline"
          size={40}
          color={colors.ember}
          style={styles.upgradeIcon}
        />
        <Text style={typography.heading}>You&rsquo;ve reached the free limit</Text>
        <Text style={[typography.caption, styles.upgradeBody]}>
          Tend+ unlocks unlimited rituals, deeper insights, and custom themes.
        </Text>
        <Pressable
          style={[styles.saveButton, styles.upgradeButton, presentingPaywall && styles.saveButtonDisabled]}
          onPress={handleUpgrade}
          disabled={presentingPaywall}
        >
          <Text style={styles.saveButtonText}>
            {presentingPaywall ? 'Loading...' : 'See Tend+'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={typography.caption}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Morning stretch"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus
      />

      <Text style={[typography.caption, styles.sectionLabel]}>Icon</Text>
      <View style={styles.row}>
        {RITUAL_ICONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => setIcon(option)}
            style={[styles.iconChoice, icon === option && styles.iconChoiceSelected]}
          >
            <Ionicons
              name={option}
              size={20}
              color={icon === option ? colors.ember : colors.textMuted}
            />
          </Pressable>
        ))}
      </View>

      <Text style={[typography.caption, styles.sectionLabel]}>Color</Text>
      <View style={styles.row}>
        {RITUAL_COLORS.map((option) => (
          <Pressable
            key={option}
            onPress={() => setColor(option)}
            style={[
              styles.colorChoice,
              { backgroundColor: option },
              color === option && styles.colorChoiceSelected,
            ]}
          />
        ))}
      </View>

      <Text style={[typography.caption, styles.sectionLabel]}>When</Text>
      <View style={styles.row}>
        {TIME_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setTimeOfDay(option.value)}
            style={[styles.timeChoice, timeOfDay === option.value && styles.timeChoiceSelected]}
          >
            <Text
              style={
                timeOfDay === option.value ? styles.timeChoiceTextSelected : typography.body
              }
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!name.trim() || saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Create ritual'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  iconChoice: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconChoiceSelected: {
    borderColor: colors.ember,
    backgroundColor: colors.surfaceMuted,
  },
  colorChoice: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChoiceSelected: {
    borderColor: colors.text,
  },
  timeChoice: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChoiceSelected: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
  },
  timeChoiceTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.ember,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  upgradeIcon: {
    marginBottom: spacing.md,
  },
  upgradeBody: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  upgradeButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});
