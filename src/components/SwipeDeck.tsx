import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SwipeCard, CARD_WIDTH, CARD_HEIGHT } from './SwipeCard';
import { SWIPE_THRESHOLD } from '../lib/constants';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';
import type { TMDBPersonCreditEntry } from '../types/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_VELOCITY = 500;

interface SwipeDeckProps {
  filmography: TMDBPersonCreditEntry[];
  unseenFilmography: TMDBPersonCreditEntry[];
  seenIds: Set<number>;
  onSwipeRight: (item: TMDBPersonCreditEntry) => void;
  onSwipeLeft: (item: TMDBPersonCreditEntry) => void;
  actorName: string;
}

export function SwipeDeck({
  filmography,
  unseenFilmography: unseenProp,
  seenIds,
  onSwipeRight,
  onSwipeLeft,
  actorName,
}: SwipeDeckProps) {
  // Freeze the unseen list at mount so swiping doesn't re-order the deck
  const [deck] = useState(() => unseenProp);

  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const alreadySeenCount = filmography.length - deck.length;
  const total = filmography.length;
  const done = currentIndex >= deck.length;

  // Reset translateX AFTER React re-renders and removes the old card
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    translateX.value = 0;
  }, [currentIndex]);

  const advanceCard = useCallback(
    (direction: 'left' | 'right') => {
      const item = deck[currentIndex];
      if (!item) return;

      if (direction === 'right') {
        onSwipeRight(item);
      } else {
        onSwipeLeft(item);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, deck, onSwipeRight, onSwipeLeft]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * SWIPE_THRESHOLD;

      if (
        Math.abs(event.translationX) > threshold ||
        Math.abs(event.velocityX) > SWIPE_VELOCITY
      ) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
          { duration: 300 },
          () => {
            runOnJS(advanceCard)(direction);
          }
        );
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  if (done) {
    const seenCount = filmography.filter((f) => seenIds.has(f.id)).length;
    const finalPct = total > 0 ? Math.round((seenCount / total) * 100) : 0;
    return (
      <View style={styles.doneContainer}>
        <Ionicons name="film" size={64} color={colors.accent} style={styles.doneIcon} />
        <Text style={styles.doneTitle}>All done!</Text>
        <Text style={styles.doneStat}>
          You've seen {seenCount} of {total}
        </Text>
        <Text style={styles.donePct}>{finalPct}%</Text>
        <Text style={styles.doneSubtext}>of {actorName}'s filmography</Text>
      </View>
    );
  }

  // Render up to 3 cards (current + 2 behind)
  const visibleCards = deck
    .slice(currentIndex, currentIndex + 3)
    .reverse();

  return (
    <View style={styles.container}>
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {deck.length}
          {alreadySeenCount > 0 ? `  (${alreadySeenCount} already seen)` : ''}
        </Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.deck}>
          {visibleCards.map((item, reverseIndex) => {
            const cardIndex = visibleCards.length - 1 - reverseIndex;
            const isTop = cardIndex === 0;
            const releaseDate = item.release_date || item.first_air_date;
            const year = releaseDate ? releaseDate.substring(0, 4) : undefined;

            return (
              <SwipeCard
                key={`${item.id}-${currentIndex + cardIndex}`}
                title={item.title || item.name || ''}
                posterPath={item.poster_path}
                character={item.character}
                year={year}
                mediaType={item.media_type}
                index={cardIndex}
                translateX={translateX}
                isTop={isTop}
              />
            );
          })}
        </View>
      </GestureDetector>

      <View style={styles.hints}>
        <View style={styles.hintRow}>
          <Ionicons name="chevron-back" size={16} color={colors.error} />
          <Text style={styles.hintLeft}>Skip</Text>
        </View>
        <View style={styles.hintRow}>
          <Text style={styles.hintRight}>Seen</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.success} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  counter: {
    paddingVertical: spacing.md,
  },
  counterText: {
    color: colors.gray[400],
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  deck: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CARD_WIDTH,
    paddingTop: spacing.md,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  hintLeft: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  hintRight: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  doneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  doneIcon: {
    marginBottom: spacing.md,
  },
  doneTitle: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  doneStat: {
    color: colors.gray[400],
    fontSize: fontSize.md,
  },
  donePct: {
    color: colors.accent,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    marginTop: spacing.md,
  },
  doneSubtext: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
  },
});
