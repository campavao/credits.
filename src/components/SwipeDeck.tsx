import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SwipeCard, CARD_WIDTH, CARD_HEIGHT } from './SwipeCard';
import { useShake } from '../hooks/useShake';
import { SWIPE_THRESHOLD } from '../lib/constants';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface } from '../lib/theme';
import type { TMDBPersonCreditEntry } from '../types/tmdb';

type SwipeDirection = 'left' | 'right' | 'up';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_VELOCITY = 500;

interface SwipeDeckProps {
  filmography: TMDBPersonCreditEntry[];
  unseenFilmography: TMDBPersonCreditEntry[];
  seenIds: Set<number>;
  onSwipeRight: (item: TMDBPersonCreditEntry) => void;
  onSwipeLeft: (item: TMDBPersonCreditEntry) => void;
  onSwipeUp?: (item: TMDBPersonCreditEntry) => void;
  onUndo?: (item: TMDBPersonCreditEntry, direction: SwipeDirection) => void;
  actorName: string;
}

export function SwipeDeck({
  filmography,
  unseenFilmography: unseenProp,
  seenIds,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onUndo,
  actorName,
}: SwipeDeckProps) {
  // Freeze the unseen list at mount so swiping doesn't re-order the deck
  const [deck] = useState(() => unseenProp);

  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Records each swipe so it can be reversed (shake or Undo button)
  const historyRef = useRef<SwipeDirection[]>([]);

  const alreadySeenCount = filmography.length - deck.length;
  const total = filmography.length;
  const done = currentIndex >= deck.length;

  // Reset the card offset AFTER React re-renders and removes the old card
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    translateX.value = 0;
    translateY.value = 0;
  }, [currentIndex]);

  const advanceCard = useCallback(
    (direction: SwipeDirection) => {
      const item = deck[currentIndex];
      if (!item) return;

      if (direction === 'right') {
        onSwipeRight(item);
      } else if (direction === 'up') {
        onSwipeUp?.(item);
      } else {
        onSwipeLeft(item);
      }

      historyRef.current.push(direction);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, deck, onSwipeRight, onSwipeLeft, onSwipeUp]
  );

  // Reverse the most recent swipe — re-shows the previous card and undoes its
  // effect (e.g. un-marks a "seen" title). Triggered by a shake or the button.
  const undoLast = useCallback(() => {
    const direction = historyRef.current.pop();
    if (!direction) return;
    const item = deck[currentIndex - 1];
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    onUndo?.(item, direction);
  }, [currentIndex, deck, onUndo]);

  // Shake to undo (native only — see useShake).
  useShake(undoLast);

  const canUndo = currentIndex > 0;

  // Tapping Skip/Seen/Watch List animates the top card off then advances — same
  // result as a swipe, for people (especially on web) who'd rather tap than drag.
  const handleButtonSwipe = (direction: SwipeDirection) => {
    if (direction === 'up') {
      translateY.value = withTiming(-SCREEN_HEIGHT * 1.2, { duration: 300 }, (finished) => {
        if (finished) runOnJS(advanceCard)('up');
      });
      return;
    }
    translateX.value = withTiming(
      direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
      { duration: 300 },
      (finished) => {
        if (finished) runOnJS(advanceCard)(direction);
      }
    );
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * SWIPE_THRESHOLD;
      const upThreshold = SCREEN_HEIGHT * 0.18;

      // Upward flick takes priority when it's the dominant axis — save to watch list.
      if (
        -event.translationY > Math.abs(event.translationX) &&
        (-event.translationY > upThreshold || -event.velocityY > SWIPE_VELOCITY)
      ) {
        translateY.value = withTiming(-SCREEN_HEIGHT * 1.2, { duration: 300 }, () => {
          runOnJS(advanceCard)('up');
        });
      } else if (
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
        // Settle any vertical drift so the card exits cleanly sideways.
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
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

        {canUndo && (
          <Pressable style={styles.doneUndoButton} onPress={undoLast} hitSlop={10}>
            <Ionicons name="arrow-undo" size={16} color={colors.gray[300]} />
            <Text style={styles.undoText}>Bring back last</Text>
          </Pressable>
        )}
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
                translateY={translateY}
                isTop={isTop}
              />
            );
          })}
        </View>
      </GestureDetector>

      <View style={styles.hints}>
        <Pressable
          style={({ pressed }) => [styles.hintButton, pressed && styles.hintButtonPressed]}
          onPress={() => handleButtonSwipe('left')}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={16} color={colors.error} />
          <Text style={styles.hintLeft}>Skip</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.watchButton, pressed && styles.hintButtonPressed]}
          onPress={() => handleButtonSwipe('up')}
          hitSlop={12}
        >
          <Ionicons name="bookmark-outline" size={16} color={colors.accent} />
          <Text style={styles.hintWatch}>Watch List</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.hintButton, pressed && styles.hintButtonPressed]}
          onPress={() => handleButtonSwipe('right')}
          hitSlop={12}
        >
          <Text style={styles.hintRight}>Seen</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.success} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
        onPress={undoLast}
        disabled={!canUndo}
        hitSlop={10}
      >
        <Ionicons name="arrow-undo" size={16} color={colors.gray[300]} />
        <Text style={styles.undoText}>Undo</Text>
      </Pressable>
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
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: surface.raised,
    borderWidth: 1,
    borderColor: surface.border,
  },
  hintButtonPressed: {
    opacity: 0.55,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: surface.raised,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  hintWatch: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: surface.raised,
    borderWidth: 1,
    borderColor: surface.border,
  },
  undoButtonDisabled: {
    opacity: 0,
  },
  undoText: {
    color: colors.gray[300],
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  doneUndoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: surface.raised,
    borderWidth: 1,
    borderColor: surface.border,
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
