import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface, springs } from '../lib/theme';

interface ComparisonBarProps {
  label: string;
  valueA: number;
  valueB: number;
  total: number;
  labelA?: string;
  labelB?: string;
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(pct, springs.default);
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <Animated.View style={[styles.barFill, { backgroundColor: color }, fillStyle]} />
  );
}

export function ComparisonBar({
  label,
  valueA,
  valueB,
  total,
  labelA = 'You',
  labelB = 'Friend',
}: ComparisonBarProps) {
  const pctA = total > 0 ? (valueA / total) * 100 : 0;
  const pctB = total > 0 ? (valueB / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.bars}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>{labelA}</Text>
          <View style={styles.barTrack}>
            <AnimatedBar pct={pctA} color={colors.accent} />
          </View>
          <Text style={styles.barValue}>{Math.round(pctA)}%</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>{labelB}</Text>
          <View style={styles.barTrack}>
            <AnimatedBar pct={pctB} color={colors.accentLight} />
          </View>
          <Text style={styles.barValue}>{Math.round(pctB)}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  bars: {
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    width: 50,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: surface.raised,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  barValue: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    width: 40,
    textAlign: 'right',
  },
});
