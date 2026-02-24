import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSpringPressable } from '../lib/animations';
import { Skeleton } from './ui/Skeleton';
import { getProfileUrl } from '../lib/tmdb';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

interface ActorPortraitCardProps {
  id: number;
  name: string;
  profilePath: string | null;
  subtitle?: string;
  width?: number;
  onPress?: () => void;
}

export function ActorPortraitCard({
  id,
  name,
  profilePath,
  subtitle,
  width = 120,
  onPress,
}: ActorPortraitCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useSpringPressable();
  const imageHeight = Math.round(width * 1.5); // 2:3 ratio
  const imageUrl = getProfileUrl(profilePath, 'medium');

  return (
    <Animated.View style={[{ width }, animatedStyle]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width, height: imageHeight }]}
          />
        ) : (
          <View style={[styles.image, styles.placeholder, { width, height: imageHeight }]}>
            <Ionicons name="person-outline" size={32} color={colors.gray[500]} />
          </View>
        )}
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </Pressable>
    </Animated.View>
  );
}

export function ActorPortraitCardSkeleton({ width = 120 }: { width?: number }) {
  const imageHeight = Math.round(width * 1.5);
  return (
    <View style={{ width }}>
      <Skeleton.Rect width={width} height={imageHeight} borderRadius={borderRadius.md} />
      <Skeleton.Text width={width * 0.8} height={14} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[800],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
