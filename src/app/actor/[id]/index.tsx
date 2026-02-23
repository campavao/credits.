import { View, Text, Image, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useActor } from '../../../hooks/useActor';
import { useSeenTitles } from '../../../hooks/useSeenTitles';
import { TitleCard } from '../../../components/TitleCard';
import { getProfileUrl } from '../../../lib/tmdb';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../lib/theme';

export default function ActorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const actorId = Number(id);
  const { details, filmography, loading } = useActor(actorId);
  const { isSeen } = useSeenTitles();

  if (loading || !details) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const seenCount = filmography.filter((f) => isSeen(f.id)).length;
  const totalCount = filmography.length;
  const completionPct = totalCount > 0 ? Math.round((seenCount / totalCount) * 100) : 0;
  const profileUrl = getProfileUrl(details.profile_path, 'medium');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={colors.accent} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.header}>
              {profileUrl ? (
                <Image source={{ uri: profileUrl }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Ionicons name="person-outline" size={48} color={colors.gray[500]} />
                </View>
              )}
              <Text style={styles.name}>{details.name}</Text>

              <View style={styles.completion}>
                <Text style={styles.completionText}>
                  {seenCount} / {totalCount} seen
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
                </View>
                <Text style={styles.completionPct}>{completionPct}%</Text>
              </View>

              <Pressable
                style={styles.swipeButton}
                onPress={() =>
                  router.push({ pathname: '/actor/[id]/swipe', params: { id: actorId } })
                }
              >
                <Text style={styles.swipeButtonText}>Start Swiping</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Filmography</Text>
          </>
        }
        data={filmography}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const releaseDate = item.release_date || item.first_air_date;
          const year = releaseDate ? releaseDate.substring(0, 4) : undefined;
          const seen = isSeen(item.id);

          return (
            <View style={seen ? styles.seenItem : undefined}>
              <TitleCard
                id={item.id}
                title={item.title || item.name || ''}
                mediaType={item.media_type}
                posterPath={item.poster_path}
                releaseYear={year}
              />
              {seen && (
                <View style={styles.seenBadge}>
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                </View>
              )}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loader: {
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
  header: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[800],
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 48,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  completion: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completionText: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  completionPct: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  swipeButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  swipeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  sectionTitle: {
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
  seenItem: {
    position: 'relative',
  },
  seenBadge: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    backgroundColor: colors.success,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seenBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
});
