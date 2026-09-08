import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { DayBar } from '../lib/insights';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const CHART_HEIGHT = 96;
const BAR_WIDTH = 22;

function Bar({ bar, index, isToday }: { bar: DayBar; index: number; isToday: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(index * 60, withTiming(bar.rate, { duration: 420 }));
  }, [bar.rate, index, progress]);

  const animatedProps = useAnimatedProps(() => {
    const height = Math.max(progress.value * CHART_HEIGHT, 4);
    return { height, y: CHART_HEIGHT - height };
  });

  return (
    <View style={styles.barColumn}>
      <Svg width={BAR_WIDTH} height={CHART_HEIGHT}>
        <Rect
          x={0}
          y={0}
          width={BAR_WIDTH}
          height={CHART_HEIGHT}
          rx={radii.sm}
          fill={colors.surfaceMuted}
        />
        <AnimatedRect
          x={0}
          width={BAR_WIDTH}
          rx={radii.sm}
          fill={isToday ? colors.ember : colors.emberGlow}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={[typography.caption, isToday && styles.todayLabel]}>{bar.label}</Text>
    </View>
  );
}

export function WeekBarChart({ bars }: { bars: DayBar[] }) {
  const todayIndex = bars.length - 1;
  return (
    <View style={styles.row}>
      {bars.map((bar, index) => (
        <Bar key={bar.date} bar={bar} index={index} isToday={index === todayIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  todayLabel: {
    color: colors.ember,
    fontWeight: '700',
  },
});
