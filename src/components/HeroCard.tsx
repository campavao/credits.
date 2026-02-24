import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSpringPressable } from '../lib/animations';
import { Skeleton } from './ui/Skeleton';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

interface HeroCardProps {
  imageUrl: string | null;
  name: string;
  subtitle?: string;
  height?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function HeroCard({ imageUrl, name, subtitle, height = 360, onPress, style }: HeroCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useSpringPressable();

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={[styles.container, { height }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.placeholder]} />
          )}
          {/* Gradient overlay */}
          <View style={styles.gradientOverlay}>
            <View style={[styles.gradientBand, { opacity: 0.0 }]} />
            <View style={[styles.gradientBand, { opacity: 0.2 }]} />
            <View style={[styles.gradientBand, { opacity: 0.5 }]} />
            <View style={[styles.gradientBand, { opacity: 0.75 }]} />
            <View style={[styles.gradientBand, { opacity: 0.9 }]} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={2}>{name}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function HeroCardSkeleton({ height = 360 }: { height?: number }) {
  return <Skeleton.Rect width="100%" height={height} borderRadius={borderRadius.lg} />;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    backgroundColor: colors.gray[800],
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  gradientBand: {
    flex: 1,
    backgroundColor: '#000000',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.hero * 1.1,
  },
  subtitle: {
    color: colors.gray[300],
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
});
