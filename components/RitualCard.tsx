import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { RitualWithStreak } from '../lib/store';

type Props = {
  ritual: RitualWithStreak;
  onToggle: () => void;
  onPress: () => void;
};

export function RitualCard({ ritual, onToggle, onPress }: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(ritual.completedToday ? 1 : 0);

  const handleToggle = () => {
    const willComplete = !ritual.completedToday;
    scale.value = withSequence(withSpring(0.92), withSpring(1));
    glow.value = withTiming(willComplete ? 1 : 0, { duration: 280 });
    Haptics.impactAsync(
      willComplete ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onToggle();
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    backgroundColor: ritual.color,
  }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Pressable style={styles.body} onPress={onPress}>
        <View style={[styles.iconWrap, { borderColor: ritual.color }]}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Ionicons name={ritual.icon} size={22} color={ritual.color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={typography.body}>{ritual.name}</Text>
          <Text style={typography.caption}>
            {ritual.streak > 0 ? `${ritual.streak} day streak` : 'Start your streak today'}
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={handleToggle}
        hitSlop={8}
        style={[
          styles.checkButton,
          {
            backgroundColor: ritual.completedToday ? ritual.color : colors.surfaceMuted,
            borderColor: ritual.color,
          },
        ]}
      >
        {ritual.completedToday ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radii.pill,
  },
  textWrap: {
    flexShrink: 1,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
