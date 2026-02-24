import { View, Text, StyleSheet } from 'react-native';
import { Skeleton } from './ui/Skeleton';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface } from '../lib/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({ label, value, subtitle, loading }: StatCardProps) {
  return (
    <View style={styles.card}>
      {loading ? (
        <Skeleton.Text width={60} height={22} />
      ) : (
        <>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </>
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: surface.raised,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  label: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
