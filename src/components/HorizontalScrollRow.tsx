import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStaggeredEntrance } from '../lib/animations';
import { colors, spacing, fontSize, fontWeight } from '../lib/theme';

interface HorizontalScrollRowProps<T> {
  title: string;
  data: T[];
  loading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: (index: number) => React.ReactNode;
  skeletonCount?: number;
  keyExtractor: (item: T) => string;
  onSeeAll?: () => void;
}

function StaggeredItem({ index, children }: { index: number; children: React.ReactNode }) {
  const animatedStyle = useStaggeredEntrance(index);
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function HorizontalScrollRow<T>({
  title,
  data,
  loading,
  renderItem,
  renderSkeleton,
  skeletonCount = 4,
  keyExtractor,
  onSeeAll,
}: HorizontalScrollRowProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {loading && renderSkeleton
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <View key={`skeleton-${i}`}>{renderSkeleton(i)}</View>
            ))
          : data.map((item, index) => (
              <StaggeredItem key={keyExtractor(item)} index={index}>
                {renderItem(item, index)}
              </StaggeredItem>
            ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
