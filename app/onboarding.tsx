import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../constants/theme';
import { markOnboardingComplete } from '../lib/onboarding';
import { requestNotificationPermission, setupNotificationChannel } from '../lib/notifications';

type Step = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: 'flame-outline',
    title: 'Tend to your rituals',
    body: 'Small morning and evening routines, tracked simply, so the streaks that matter to you stay alive.',
  },
  {
    icon: 'checkmark-circle-outline',
    title: 'One tap, done',
    body: 'Add a ritual, tap it when you complete it. No forms, no friction, just a quick check-in each day.',
  },
  {
    icon: 'notifications-outline',
    title: 'A gentle nudge',
    body: 'Turn on reminders so a quiet notification catches you at the right moment. You can change this anytime in Settings.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = async () => {
    await markOnboardingComplete();
    router.replace('/');
  };

  const handlePrimaryPress = async () => {
    if (!isLastStep) {
      setStep((value) => value + 1);
      return;
    }
    await setupNotificationChannel();
    await requestNotificationPermission();
    await finish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.skip} onPress={finish} hitSlop={12}>
        <Text style={typography.caption}>Skip</Text>
      </Pressable>

      <Animated.View key={step} entering={FadeIn.duration(220)} style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name={current.icon} size={40} color={colors.ember} />
        </View>
        <Text style={[typography.title, styles.title]}>{current.title}</Text>
        <Text style={[typography.body, styles.body]}>{current.body}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === step && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable style={styles.primaryButton} onPress={handlePrimaryPress}>
          <Text style={styles.primaryButtonText}>
            {isLastStep ? 'Enable reminders' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  skip: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.ember,
    width: 20,
  },
  primaryButton: {
    backgroundColor: colors.ember,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
