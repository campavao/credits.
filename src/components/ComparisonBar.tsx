import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

interface ComparisonBarProps {
  label: string;
  valueA: number;
  valueB: number;
  total: number;
  labelA?: string;
  labelB?: string;
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
            <View style={[styles.barFillA, { width: `${pctA}%` }]} />
          </View>
          <Text style={styles.barValue}>{valueA}/{total}</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>{labelB}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFillB, { width: `${pctB}%` }]} />
          </View>
          <Text style={styles.barValue}>{valueB}/{total}</Text>
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
    height: 8,
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFillA: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  barFillB: {
    height: '100%',
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.full,
  },
  barValue: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    width: 45,
    textAlign: 'right',
  },
});
