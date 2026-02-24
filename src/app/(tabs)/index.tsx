import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { useStats } from '../../hooks/useStats';
import { useRecentlyWatched } from '../../hooks/useRecentlyWatched';
import { HorizontalScrollRow } from '../../components/HorizontalScrollRow';
import { PosterCard, PosterCardSkeleton } from '../../components/PosterCard';
import { HeroCard, HeroCardSkeleton } from '../../components/HeroCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { stats, loading } = useStats();
  const { titles, loading: titlesLoading } = useRecentlyWatched();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name || profile?.username || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {profile?.display_name || profile?.username || 'User'}
          </Text>
          {profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
        </View>

        {/* Stats cards */}
        {loading ? (
          <View style={styles.statsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton.Rect key={i} width={100} height={80} borderRadius={borderRadius.lg} />
            ))}
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.total_watched ?? 0}</Text>
              <Text style={styles.statLabel}>Watched</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.unique_actors ?? 0}</Text>
              <Text style={styles.statLabel}>Actors</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.friends_count ?? 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>
        )}

        {/* Top actor highlight */}
        {stats?.most_completed_actor_name && (
          <View style={styles.actorHighlight}>
            <Text style={styles.highlightLabel}>Most Completed Actor</Text>
            <HeroCard
              imageUrl={null}
              name={stats.most_completed_actor_name}
              subtitle={stats.most_completed_pct ? `${stats.most_completed_pct}% complete` : undefined}
              height={200}
              onPress={
                stats.most_completed_actor_id
                  ? () =>
                      router.push({
                        pathname: '/actor/[id]',
                        params: { id: stats.most_completed_actor_id! },
                      })
                  : undefined
              }
            />
          </View>
        )}

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

        {/* Sign Out */}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.attribution}>
          Film data provided by TMDB
        </Text>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  username: {
    color: colors.gray[400],
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: surface.raised,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actorHighlight: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  highlightLabel: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signOutButton: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  attribution: {
    color: colors.gray[600],
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
