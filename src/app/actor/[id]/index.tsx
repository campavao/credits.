import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useActor } from '../../../hooks/useActor';
import { useSeenTitles } from '../../../hooks/useSeenTitles';
import { HeroCard, HeroCardSkeleton } from '../../../components/HeroCard';
import { HorizontalScrollRow } from '../../../components/HorizontalScrollRow';
import { PosterCard, PosterCardSkeleton } from '../../../components/PosterCard';
import { StarRating } from '../../../components/StarRating';
import { GradientStatBar } from '../../../components/GradientStatBar';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useSpringPressable } from '../../../lib/animations';
import { getProfileUrl } from '../../../lib/tmdb';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius, springs } from '../../../lib/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function SwipeButton({ onPress }: { onPress: () => void }) {
  const { animatedStyle, onPressIn, onPressOut } = useSpringPressable();
  return (
    <Animated.View style={animatedStyle}>
      <Pressable style={styles.swipeButton} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Text style={styles.swipeButtonText}>Start Swiping</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ActorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const actorId = Number(id);
  const { details, filmography, loading } = useActor(actorId);
  const { isSeen } = useSeenTitles();

  if (loading || !details) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <HeroCardSkeleton height={SCREEN_HEIGHT * 0.45} />
        <View style={styles.skeletonContent}>
          <Skeleton.Text width="60%" height={20} />
          <Skeleton.Rect width="100%" height={12} style={{ marginTop: spacing.md }} />
          <View style={styles.skeletonRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <PosterCardSkeleton key={i} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const seenCount = filmography.filter((f) => isSeen(f.id)).length;
  const totalCount = filmography.length;
  const completionPct = totalCount > 0 ? Math.round((seenCount / totalCount) * 100) : 0;
  const profileUrl = getProfileUrl(details.profile_path, 'original');

  // Compute average vote from filmography
  const votedEntries = filmography.filter((f) => (f as any).vote_average != null);
  const avgVote =
    votedEntries.length > 0
      ? votedEntries.reduce((sum, f) => sum + ((f as any).vote_average || 0), 0) / votedEntries.length
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Hero photo */}
        <HeroCard
          imageUrl={profileUrl}
          name={details.name}
          height={SCREEN_HEIGHT * 0.45}
          style={{ marginHorizontal: spacing.md }}
        />

        {/* Star rating */}
        {avgVote > 0 && (
          <View style={styles.ratingRow}>
            <StarRating rating={avgVote} size={20} />
            <Text style={styles.ratingText}>{avgVote.toFixed(1)}</Text>
          </View>
        )}

        {/* Stats pills */}
        <View style={styles.statsRow}>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{seenCount}/{totalCount}</Text>
            <Text style={styles.pillLabel}>seen</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{completionPct}%</Text>
            <Text style={styles.pillLabel}>complete</Text>
          </View>
        </View>

        {/* Completion bar */}
        <View style={styles.barSection}>
          <GradientStatBar label="Filmography" value={seenCount} total={totalCount} />
        </View>

        {/* Start Swiping CTA */}
        <View style={styles.ctaSection}>
          <SwipeButton
            onPress={() =>
              router.push({ pathname: '/actor/[id]/swipe', params: { id: actorId } })
            }
          />
        </View>

        {/* Filmography horizontal scroll */}
        <HorizontalScrollRow
          title="Filmography"
          data={filmography}
          keyExtractor={(item) => String(item.id)}
          renderItem={(item) => {
            const seen = isSeen(item.id);
            return (
              <PosterCard
                id={item.id}
                title={item.title || item.name}
                posterPath={item.poster_path}
                seen={seen}
                onPress={() =>
                  router.push({
                    pathname: '/title/[id]',
                    params: { id: item.id, mediaType: item.media_type },
                  })
                }
              />
            );
          }}
          renderSkeleton={() => <PosterCardSkeleton />}
        />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 4,
  },
  backText: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  skeletonContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  ratingText: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: surface.raised,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pillValue: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  pillLabel: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  barSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  ctaSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  swipeButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  swipeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
