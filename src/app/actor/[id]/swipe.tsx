import { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useActor } from '../../../hooks/useActor';
import { useSeenTitles } from '../../../hooks/useSeenTitles';
import { SwipeDeck } from '../../../components/SwipeDeck';
import { colors, spacing, fontSize, fontWeight, surface } from '../../../lib/theme';
import type { TMDBPersonCreditEntry } from '../../../types/tmdb';

export default function ActorSwipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const actorId = Number(id);
  const { details, filmography, loading, error } = useActor(actorId);
  const { seenIds, loading: seenLoading, markAsSeen } = useSeenTitles();

  // Pre-filter here in the parent where both are guaranteed loaded
  const unseenFilmography = useMemo(
    () => filmography.filter((f) => !seenIds.has(f.id)),
    [filmography, seenLoading] // recompute when seenLoading flips false, then stable
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.accent} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.gray[500]} />
          <Text style={styles.errorText}>Couldn't load filmography</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Wait for BOTH actor data and seen titles to load before showing deck
  if (loading || seenLoading || !details) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const handleSwipeRight = (item: TMDBPersonCreditEntry) => {
    const releaseDate = item.release_date || item.first_air_date;
    const releaseYear = releaseDate ? parseInt(releaseDate.substring(0, 4)) : null;
    markAsSeen(
      item.id,
      item.media_type,
      item.title || item.name || '',
      item.poster_path,
      releaseYear
    );
  };

  const handleSwipeLeft = (_item: TMDBPersonCreditEntry) => {
    // Skip -- do nothing
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.actorName}>{details.name}</Text>
        <View style={styles.spacer} />
      </View>

      <SwipeDeck
        filmography={filmography}
        unseenFilmography={unseenFilmography}
        seenIds={seenIds}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        actorName={details.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  loader: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  actorName: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  spacer: {
    width: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    color: colors.gray[400],
    fontSize: fontSize.md,
  },
});
