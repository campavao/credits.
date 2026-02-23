import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { getPosterUrl } from '../lib/tmdb';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface SwipeCardProps {
  title: string;
  posterPath: string | null;
  character: string;
  year?: string;
  mediaType: 'movie' | 'tv';
  index: number;
  translateX: SharedValue<number>;
  isTop: boolean;
}

export function SwipeCard({
  title,
  posterPath,
  character,
  year,
  mediaType,
  index,
  translateX,
  isTop,
}: SwipeCardProps) {
  const posterUrl = getPosterUrl(posterPath, 'large');

  const animatedStyle = useAnimatedStyle(() => {
    if (isTop) {
      const rotate = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15]);
      return {
        transform: [
          { translateX: translateX.value },
          { rotate: `${rotate}deg` },
        ],
      };
    }

    // Cards underneath scale up and translate up as top card moves
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH],
      [1 - index * 0.05, 1 - (index - 1) * 0.05]
    );
    const translateY = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH],
      [index * 10, (index - 1) * 10]
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    if (!isTop) return { opacity: 0 };
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.4, 0, SCREEN_WIDTH * 0.4],
      [1, 0, 1]
    );
    return { opacity };
  });

  const overlayTextStyle = useAnimatedStyle(() => {
    if (!isTop) return { opacity: 0 };
    if (translateX.value > 0) {
      return { opacity: interpolate(translateX.value, [0, SCREEN_WIDTH * 0.4], [0, 1]) };
    }
    return { opacity: 0 };
  });

  const skipTextStyle = useAnimatedStyle(() => {
    if (!isTop) return { opacity: 0 };
    if (translateX.value < 0) {
      return { opacity: interpolate(translateX.value, [0, -SCREEN_WIDTH * 0.4], [0, 1]) };
    }
    return { opacity: 0 };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.posterPlaceholderText}>🎬</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {character ? <Text style={styles.character}>as {character}</Text> : null}
        <View style={styles.metaRow}>
          {year ? <Text style={styles.year}>{year}</Text> : null}
          <Text style={styles.type}>{mediaType === 'movie' ? 'Movie' : 'TV'}</Text>
        </View>
      </View>

      {/* Swipe overlay labels */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.Text style={[styles.seenLabel, overlayTextStyle]}>SEEN</Animated.Text>
        <Animated.Text style={[styles.skipLabel, skipTextStyle]}>SKIP</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

export { CARD_WIDTH, CARD_HEIGHT };

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.gray[900],
    overflow: 'hidden',
  },
  poster: {
    flex: 1,
    backgroundColor: colors.gray[800],
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    fontSize: 64,
  },
  info: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  character: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  year: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
  },
  type: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seenLabel: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.success,
    borderWidth: 3,
    borderColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    transform: [{ rotate: '-15deg' }],
    overflow: 'hidden',
  },
  skipLabel: {
    position: 'absolute',
    top: 40,
    right: 20,
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.error,
    borderWidth: 3,
    borderColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    transform: [{ rotate: '15deg' }],
    overflow: 'hidden',
  },
});
