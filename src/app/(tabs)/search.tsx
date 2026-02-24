import { useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSearch } from '../../hooks/useSearch';
import { useActorSearch } from '../../hooks/useActorSearch';
import { useTrending } from '../../hooks/useTrending';
import { useTrackedActors, formatSeenSubtitle } from '../../hooks/useTrackedActors';
import { SearchBar } from '../../components/ui/SearchBar';
import { HeroCard, HeroCardSkeleton } from '../../components/HeroCard';
import { HorizontalScrollRow } from '../../components/HorizontalScrollRow';
import { ActorPortraitCard, ActorPortraitCardSkeleton } from '../../components/ActorPortraitCard';
import { PosterCard, PosterCardSkeleton } from '../../components/PosterCard';
import { TitleCard } from '../../components/TitleCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { getProfileUrl } from '../../lib/tmdb';
import { surface, colors, spacing, fontSize, fontWeight } from '../../lib/theme';
import type { TMDBSearchResult } from '../../types/tmdb';

export default function SearchTabScreen() {
  const { query, setQuery, results: titleResults, loading: titleLoading } = useSearch();
  const { query: actorQuery, setQuery: setActorQuery, results: actorResults, loading: actorLoading } = useActorSearch();
  const { results: trending, loading: trendingLoading } = useTrending();
  const { actors: trackedActors, refresh: refreshActors } = useTrackedActors();
  const topActor = trackedActors.length > 0 ? trackedActors[0] : null;

  useFocusEffect(
    useCallback(() => {
      refreshActors();
    }, [])
  );

  const isSearching = query.trim().length > 0;

  const handleSearchChange = (text: string) => {
    setQuery(text);
    setActorQuery(text);
  };

  const getReleaseYear = (item: TMDBSearchResult) => {
    const date = item.release_date || item.first_air_date;
    return date ? date.substring(0, 4) : undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Discover</Text>
      <SearchBar
        value={query}
        onChangeText={handleSearchChange}
        placeholder="Search titles and actors..."
      />

      {isSearching ? (
        <FlatList
          data={titleResults}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          ListHeaderComponent={
            actorResults.length > 0 ? (
              <HorizontalScrollRow
                title="Actors"
                data={actorResults.slice(0, 10)}
                loading={actorLoading}
                keyExtractor={(a) => String(a.id)}
                renderItem={(actor) => (
                  <ActorPortraitCard
                    id={actor.id}
                    name={actor.name}
                    profilePath={actor.profile_path}
                    width={100}
                    onPress={() =>
                      router.push({ pathname: '/actor/[id]', params: { id: actor.id } })
                    }
                  />
                )}
                renderSkeleton={() => <ActorPortraitCardSkeleton width={100} />}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <TitleCard
              id={item.id}
              title={item.title || item.name || ''}
              mediaType={item.media_type as 'movie' | 'tv'}
              posterPath={item.poster_path}
              releaseYear={getReleaseYear(item)}
            />
          )}
          ListEmptyComponent={
            titleLoading ? (
              <View style={styles.loadingContainer}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} style={styles.skeletonRow}>
                    <Skeleton.Rect width={80} height={120} />
                    <View style={styles.skeletonText}>
                      <Skeleton.Text width="80%" height={16} />
                      <Skeleton.Text width="40%" height={14} />
                    </View>
                  </View>
                ))}
              </View>
            ) : query.trim().length > 0 ? (
              <Text style={styles.emptyText}>No results found</Text>
            ) : null
          }
          contentContainerStyle={styles.list}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.defaultContent} showsVerticalScrollIndicator={false}>
          {/* Featured actor hero — user's top actor */}
          {topActor ? (
            <View style={styles.heroSection}>
              <HeroCard
                imageUrl={getProfileUrl(topActor.profile_path, 'original')}
                name={topActor.name}
                subtitle={formatSeenSubtitle(topActor)}
                height={240}
                onPress={() =>
                  router.push({
                    pathname: '/actor/[id]',
                    params: { id: topActor.id },
                  })
                }
                style={{ marginHorizontal: spacing.md }}
              />
            </View>
          ) : null}

          {/* Trending */}
          <HorizontalScrollRow
            title="Trending This Week"
            data={trending.slice(0, 15)}
            loading={trendingLoading}
            keyExtractor={(t) => `${t.media_type}-${t.id}`}
            renderItem={(item) => (
              <PosterCard
                id={item.id}
                title={item.title || item.name}
                posterPath={item.poster_path}
                onPress={() =>
                  router.push({
                    pathname: '/title/[id]',
                    params: { id: item.id, mediaType: item.media_type },
                  })
                }
              />
            )}
            renderSkeleton={() => <PosterCardSkeleton />}
            skeletonCount={5}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroSection: {
    marginTop: spacing.sm,
  },
  defaultContent: {
    paddingBottom: spacing.xxl,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skeletonText: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
