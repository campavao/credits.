import { View, Text, Image, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTitle } from '../../hooks/useTitle';
import { useSeenTitles } from '../../hooks/useSeenTitles';
import { ActorRow } from '../../components/ActorRow';
import { getPosterUrl } from '../../lib/tmdb';
import { Skeleton } from '../../components/ui/Skeleton';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface } from '../../lib/theme';
import type { TMDBMovieDetails, TMDBTVDetails } from '../../types/tmdb';

export default function TitleDetailScreen() {
  const { id, mediaType } = useLocalSearchParams<{ id: string; mediaType: 'movie' | 'tv' }>();
  const titleId = Number(id);
  const { details, cast, loading, error } = useTitle(titleId, mediaType as 'movie' | 'tv');
  const { isSeen, markAsSeen, markAsUnseen } = useSeenTitles();

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.gray[500]} />
          <Text style={styles.errorText}>Couldn't load this title</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !details) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.skeletonContent}>
          <Skeleton.Rect width="100%" height={350} borderRadius={0} />
          <View style={{ padding: spacing.md, gap: spacing.sm }}>
            <Skeleton.Text width="70%" height={24} />
            <Skeleton.Text width="30%" height={16} />
            <Skeleton.Text width="100%" height={14} />
            <Skeleton.Text width="90%" height={14} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const titleText = 'title' in details ? details.title : (details as TMDBTVDetails).name;
  const releaseDate = 'release_date' in details
    ? (details as TMDBMovieDetails).release_date
    : (details as TMDBTVDetails).first_air_date;
  const releaseYear = releaseDate ? parseInt(releaseDate.substring(0, 4)) : null;
  const seen = isSeen(titleId);
  const posterUrl = getPosterUrl(details.poster_path, 'large');

  const handleToggleSeen = () => {
    if (seen) {
      markAsUnseen(titleId);
    } else {
      markAsSeen(titleId, mediaType as 'movie' | 'tv', titleText, details.poster_path, releaseYear);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={colors.accent} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            {posterUrl && (
              <Image source={{ uri: posterUrl }} style={styles.poster} />
            )}

            <View style={styles.info}>
              <Text style={styles.title}>{titleText}</Text>
              <View style={styles.meta}>
                <Text style={styles.year}>{releaseYear || 'N/A'}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {mediaType === 'movie' ? 'Movie' : 'TV'}
                  </Text>
                </View>
              </View>

              {details.overview ? (
                <Text style={styles.overview}>{details.overview}</Text>
              ) : null}

              <Pressable
                style={[styles.watchButton, seen && styles.watchButtonSeen]}
                onPress={handleToggleSeen}
              >
                <Text style={[styles.watchButtonText, seen && styles.watchButtonTextSeen]}>
                  {seen ? (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />{' Watched'}
                    </>
                  ) : 'Mark as Watched'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.castHeader}>Cast</Text>
          </>
        }
        data={cast}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ActorRow
            id={item.id}
            name={item.name}
            profilePath={item.profile_path}
            character={item.character}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  skeletonContent: {
    flex: 1,
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
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    maxHeight: 350,
    resizeMode: 'cover',
  },
  info: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  year: {
    color: colors.gray[400],
    fontSize: fontSize.md,
  },
  badge: {
    backgroundColor: surface.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  overview: {
    color: colors.gray[300],
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  watchButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  watchButtonSeen: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.success,
  },
  watchButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  watchButtonTextSeen: {
    color: colors.success,
  },
  castHeader: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xxl,
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
