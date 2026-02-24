import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface, springs } from '../lib/theme';

interface GradientStatBarProps {
  label: string;
  value: number;
  total: number;
  color?: string;
}

export function GradientStatBar({
  label,
  value,
  total,
  color = colors.accent,
}: GradientStatBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withSpring(pct, springs.default);
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%` as any,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}/{total}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  value: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  track: {
    height: 12,
    backgroundColor: surface.raised,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
