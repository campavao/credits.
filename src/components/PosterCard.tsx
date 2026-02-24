import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSpringPressable } from '../lib/animations';
import { Skeleton } from './ui/Skeleton';
import { getPosterUrl } from '../lib/tmdb';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

interface PosterCardProps {
  id: number;
  title?: string;
  posterPath: string | null;
  seen?: boolean;
  width?: number;
  onPress?: () => void;
}

export function PosterCard({
  id,
  title,
  posterPath,
  seen,
  width = 110,
  onPress,
}: PosterCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useSpringPressable();
  const imageHeight = Math.round(width * 1.5); // 2:3 ratio
  const imageUrl = getPosterUrl(posterPath, 'medium');

  return (
    <Animated.View style={[{ width }, animatedStyle]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={{ position: 'relative' }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, { width, height: imageHeight }]}
            />
          ) : (
            <View style={[styles.image, styles.placeholder, { width, height: imageHeight }]}>
              <Ionicons name="film-outline" size={28} color={colors.gray[500]} />
            </View>
          )}
          {seen && (
            <View style={styles.seenBadge}>
              <Ionicons name="checkmark" size={12} color={colors.white} />
            </View>
          )}
        </View>
        {title && <Text style={styles.title} numberOfLines={2}>{title}</Text>}
      </Pressable>
    </Animated.View>
  );
}

export function PosterCardSkeleton({ width = 110 }: { width?: number }) {
  const imageHeight = Math.round(width * 1.5);
  return (
    <View style={{ width }}>
      <Skeleton.Rect width={width} height={imageHeight} borderRadius={borderRadius.sm} />
      <Skeleton.Text width={width * 0.8} height={12} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[800],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  seenBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.success,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
});
