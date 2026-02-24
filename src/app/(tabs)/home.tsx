import { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useStats } from '../../hooks/useStats';
import { useTrackedActors, formatSeenSubtitle } from '../../hooks/useTrackedActors';
import { useRecentlyWatched } from '../../hooks/useRecentlyWatched';
import { useFriendsActivity } from '../../hooks/useFriendsActivity';
import { HeroCard, HeroCardSkeleton } from '../../components/HeroCard';
import { HorizontalScrollRow } from '../../components/HorizontalScrollRow';
import { ActorPortraitCard, ActorPortraitCardSkeleton } from '../../components/ActorPortraitCard';
import { PosterCard, PosterCardSkeleton } from '../../components/PosterCard';
import { getProfileUrl } from '../../lib/tmdb';
import { surface, colors, spacing, fontSize, fontWeight, springs } from '../../lib/theme';

function AnimatedNumber({ value, label }: { value: number; label: string }) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withSpring(value, springs.default);
  }, [value]);

  // We'll just display the target value since RN text doesn't animate content easily
  return (
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { stats, loading: statsLoading, refresh: refreshStats } = useStats();
  const { actors, loading: actorsLoading, refresh: refreshActors } = useTrackedActors();
  const { titles, loading: titlesLoading, refresh: refreshTitles } = useRecentlyWatched();
  const { activity, loading: activityLoading, refresh: refreshActivity } = useFriendsActivity();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
      refreshActors();
      refreshTitles();
      refreshActivity();
    }, [])
  );

  // De-duplicate friend activity by title_id (show each title once)
  const uniqueActivity = activity.filter(
    (item, index, arr) => arr.findIndex((a) => a.title_id === item.title_id) === index
  );

  const topActorProfileUrl = stats?.most_completed_actor_id
    ? null // We don't have the profile_path in stats — use tracked actors
    : null;

  // Find the top actor from tracked actors for the hero card
  const topActor = actors.length > 0 ? actors[0] : null;
  const topActorImageUrl = topActor ? getProfileUrl(topActor.profile_path, 'original') : null;

  const isEmpty = !statsLoading && (stats?.total_watched ?? 0) === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>credits.</Text>

        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Welcome to credits.</Text>
            <Text style={styles.emptyText}>
              Search for a movie or actor to get started
            </Text>
          </View>
        ) : (
          <>
            {/* Your Crew — top actors */}
            <HorizontalScrollRow
              title="Your Crew"
              data={actors}
              loading={actorsLoading}
              keyExtractor={(a) => String(a.id)}
              renderItem={(actor) => (
                <ActorPortraitCard
                  id={actor.id}
                  name={actor.name}
                  profilePath={actor.profile_path}
                  subtitle={formatSeenSubtitle(actor)}
                  onPress={() => router.push({ pathname: '/actor/[id]', params: { id: actor.id } })}
                />
              )}
              renderSkeleton={() => <ActorPortraitCardSkeleton />}
            />

            {/* Recently Watched */}
            <HorizontalScrollRow
              title="Recently Watched"
              data={titles}
              loading={titlesLoading}
              keyExtractor={(t) => String(t.title_id)}
              renderItem={(title) => (
                <PosterCard
                  id={title.title_id}
                  title={title.title}
                  posterPath={title.poster_path}
                  onPress={() =>
                    router.push({
                      pathname: '/title/[id]',
                      params: { id: title.title_id, mediaType: title.media_type },
                    })
                  }
                />
              )}
              renderSkeleton={() => <PosterCardSkeleton />}
            />

            {/* Friends Are Watching */}
            {uniqueActivity.length > 0 && (
              <HorizontalScrollRow
                title="Friends Are Watching"
                data={uniqueActivity}
                loading={activityLoading}
                keyExtractor={(a) => `${a.title_id}`}
                renderItem={(item) => (
                  <View>
                    <PosterCard
                      id={item.title_id}
                      title={item.title_name}
                      posterPath={item.poster_path}
                      onPress={() =>
                        router.push({
                          pathname: '/title/[id]',
                          params: { id: item.title_id, mediaType: item.media_type },
                        })
                      }
                    />
                    <Text style={styles.friendActivityName} numberOfLines={1}>
                      {item.friend_name}
                    </Text>
                  </View>
                )}
                renderSkeleton={() => <PosterCardSkeleton />}
              />
            )}

            {/* Top Actor Hero */}
            {topActor && (
              <View style={styles.heroSection}>
                <Text style={styles.sectionTitle}>Most Watched Actor</Text>
                {actorsLoading ? (
                  <HeroCardSkeleton height={280} />
                ) : (
                  <HeroCard
                    imageUrl={topActorImageUrl}
                    name={topActor.name}
                    subtitle={formatSeenSubtitle(topActor)}
                    height={280}
                    onPress={() =>
                      router.push({ pathname: '/actor/[id]', params: { id: topActor.id } })
                    }
                    style={{ marginHorizontal: spacing.md }}
                  />
                )}
              </View>
            )}

            {/* Stats row */}
            <View style={styles.statsRow}>
              <AnimatedNumber value={stats?.total_watched ?? 0} label="Watched" />
              <AnimatedNumber value={stats?.unique_actors ?? 0} label="Actors" />
              <AnimatedNumber value={stats?.friends_count ?? 0} label="Friends" />
            </View>
          </>
        )}
      </ScrollView>
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
  logo: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.gray[400],
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  heroSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: surface.raised,
    borderRadius: 16,
    paddingVertical: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  friendActivityName: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },
});
