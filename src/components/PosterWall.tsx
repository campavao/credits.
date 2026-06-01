import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { getTrending, getPosterUrl } from '../lib/tmdb';
import { colors } from '../lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const GAP = 10;
const POSTER_W = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const POSTER_H = POSTER_W * 1.5;
const ITEM_H = POSTER_H + GAP;

interface ColumnProps {
  posters: string[];
  direction: 'up' | 'down';
  duration: number;
}

function Column({ posters, direction, duration }: ColumnProps) {
  const translateY = useSharedValue(0);
  // Two stacked copies make the loop seamless; one copy's height is the travel.
  const copyHeight = posters.length * ITEM_H;

  useEffect(() => {
    translateY.value = direction === 'up' ? 0 : -copyHeight;
    translateY.value = withRepeat(
      withTiming(direction === 'up' ? -copyHeight : 0, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => cancelAnimation(translateY);
  }, [copyHeight, direction, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.columnClip}>
      <Animated.View style={animatedStyle}>
        {[...posters, ...posters].map((uri, i) => (
          <Image
            key={`${uri}-${i}`}
            source={{ uri }}
            style={styles.poster}
            blurRadius={3}
            resizeMode="cover"
          />
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * A slowly-scrolling, blurred wall of trending movie posters — used as a
 * "locked behind login" backdrop. Renders nothing until posters load.
 */
export function PosterWall() {
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    getTrending('movie', 'week')
      .then((res) => {
        if (!active) return;
        const urls = res.results
          .map((r) => getPosterUrl(r.poster_path, 'medium'))
          .filter((u): u is string => !!u);
        setPosters(urls);
      })
      .catch(() => {
        /* backdrop is decorative — ignore fetch errors */
      });
    return () => {
      active = false;
    };
  }, []);

  if (posters.length === 0) {
    return <View style={styles.fallback} />;
  }

  // Split posters across columns so each scrolls a distinct set.
  const columns = Array.from({ length: NUM_COLUMNS }, (_, col) =>
    posters.filter((_, i) => i % NUM_COLUMNS === col)
  );

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.row}>
        {columns.map((colPosters, col) => (
          <Column
            key={col}
            posters={colPosters}
            direction={col % 2 === 0 ? 'up' : 'down'}
            duration={28000 + col * 6000}
          />
        ))}
      </View>
      {/* Darkening overlay so the login form stays readable */}
      <View style={styles.overlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
    paddingHorizontal: GAP,
    height: SCREEN_HEIGHT,
  },
  columnClip: {
    width: POSTER_W,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  poster: {
    width: POSTER_W,
    height: POSTER_H,
    marginBottom: GAP,
    borderRadius: 10,
    backgroundColor: colors.gray[900],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.66)',
  },
});
