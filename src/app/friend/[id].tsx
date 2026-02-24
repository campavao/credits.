import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { useComparison } from '../../hooks/useComparison';
import { useSharedTitles } from '../../hooks/useSharedTitles';
import { ComparisonBar } from '../../components/ComparisonBar';
import { HorizontalScrollRow } from '../../components/HorizontalScrollRow';
import { PosterCard, PosterCardSkeleton } from '../../components/PosterCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { getProfileUrl } from '../../lib/tmdb';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
import type { User } from '../../types/database';

interface ComparisonStats {
  user_a_count: number;
  user_b_count: number;
  shared_count: number;
  overlap_pct: number;
}

interface SharedActor {
  actor_id: number;
  actor_name: string;
  profile_path: string | null;
  user_a_seen: number;
  user_b_seen: number;
  total_titles: number;
}

export default function FriendCompareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [friend, setFriend] = useState<User | null>(null);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [stats, setStats] = useState<ComparisonStats | null>(null);
  const [sharedActors, setSharedActors] = useState<SharedActor[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActors, setLoadingActors] = useState(true);
  const { getComparisonStats, getSharedActorsComparison } = useComparison();
  const { titles: sharedTitles, friendOnlyTitles, loading: sharedLoading } = useSharedTitles(id);

  useEffect(() => {
    async function load() {
      if (!user) return;

      // Load profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      setFriend(profile);
      setLoadingProfile(false);

      // Find friendship record
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .single();
      if (friendship) setFriendshipId(friendship.id);

      // Load comparison stats
      const compStats = await getComparisonStats(id);
      setStats(compStats);
      setLoadingStats(false);

      // Load shared actors
      const actors = await getSharedActorsComparison(id);
      setSharedActors(actors);
      setLoadingActors(false);
    }
    load();
  }, [id, user]);

  const handleRemoveFriend = () => {
    if (!friendshipId) return;
    Alert.alert(
      'Remove Friend',
      `Remove ${friend?.display_name || friend?.username || 'this friend'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('friendships').delete().eq('id', friendshipId);
            router.back();
          },
        },
      ]
    );
  };

  if (loadingProfile || !friend) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.skeletonHeader}>
          <Skeleton.Circle width={80} />
          <Skeleton.Text width={160} height={22} />
          <Skeleton.Text width={100} height={16} />
        </View>
      </SafeAreaView>
    );
  }

  const friendName = friend.display_name || friend.username || 'User';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {friendName[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{friendName}</Text>
          {friend.username && (
            <Text style={styles.username}>@{friend.username}</Text>
          )}
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          {loadingStats ? (
            <>
              <View style={styles.statCard}><Skeleton.Text width={40} height={24} /><Skeleton.Text width={30} height={12} /></View>
              <View style={styles.statCard}><Skeleton.Text width={40} height={24} /><Skeleton.Text width={30} height={12} /></View>
              <View style={styles.statCard}><Skeleton.Text width={40} height={24} /><Skeleton.Text width={30} height={12} /></View>
            </>
          ) : stats ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.user_a_count}</Text>
                <Text style={styles.statLabel}>You</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.user_b_count}</Text>
                <Text style={styles.statLabel}>Them</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{stats.shared_count}</Text>
                <Text style={styles.statLabel}>Shared</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Compatibility Score */}
        <View style={styles.scoreCard}>
          {loadingStats ? (
            <Skeleton.Text width={120} height={56} />
          ) : stats ? (
            <>
              <Text style={styles.scoreLabel}>Film Compatibility</Text>
              <Text style={styles.scoreValue}>{stats.overlap_pct}%</Text>
              <Text style={styles.scoreDetail}>
                {stats.shared_count} shared out of {stats.user_a_count + stats.user_b_count - stats.shared_count} combined
              </Text>
            </>
          ) : (
            <Text style={styles.scoreLabel}>No comparison data yet</Text>
          )}
        </View>

        {/* New from Friend — titles they've seen but you haven't */}
        {friendOnlyTitles.length > 0 && (
          <HorizontalScrollRow
            title={`New from ${friendName}`}
            data={friendOnlyTitles}
            loading={sharedLoading}
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
        )}

        {/* Shared Titles */}
        {sharedTitles.length > 0 && (
          <HorizontalScrollRow
            title="Shared Titles"
            data={sharedTitles}
            loading={sharedLoading}
            keyExtractor={(t) => String(t.title_id)}
            renderItem={(title) => (
              <PosterCard
                id={title.title_id}
                title={title.title}
                posterPath={title.poster_path}
                seen
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
        )}

        {/* Shared Actors with Comparison Bars */}
        {(loadingActors || sharedActors.length > 0) && (
          <View style={styles.actorsSection}>
            <Text style={styles.sectionTitle}>Shared Actors</Text>
            {loadingActors ? (
              <View style={styles.actorList}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <View key={i} style={styles.actorItem}>
                    <Skeleton.Rect width={56} height={56} borderRadius={28} />
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <Skeleton.Text width={120} height={16} />
                      <Skeleton.Text width={200} height={12} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.actorList}>
                {sharedActors.map((actor) => {
                  const thumbUrl = getProfileUrl(actor.profile_path, 'medium');
                  return (
                    <Pressable
                      key={actor.actor_id}
                      style={styles.actorItem}
                      onPress={() => router.push({ pathname: '/actor/[id]', params: { id: actor.actor_id } })}
                    >
                      {thumbUrl ? (
                        <Image source={{ uri: thumbUrl }} style={[styles.actorThumb, styles.actorImage]} />
                      ) : (
                        <View style={[styles.actorThumb, styles.actorImage]}>
                          <Ionicons name="person" size={20} color={colors.gray[500]} />
                        </View>
                      )}
                      <View style={styles.actorInfo}>
                        <Text style={styles.actorName} numberOfLines={1}>{actor.actor_name}</Text>
                        <ComparisonBar
                          label=""
                          valueA={actor.user_a_seen}
                          valueB={actor.user_b_seen}
                          total={actor.total_titles}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Remove Friend Button */}
        {friendshipId && (
          <Pressable style={styles.removeButton} onPress={handleRemoveFriend}>
            <Text style={styles.removeButtonText}>Remove Friend</Text>
          </Pressable>
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
  skeletonHeader: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  username: {
    color: colors.gray[400],
    fontSize: fontSize.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: surface.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreCard: {
    backgroundColor: surface.raised,
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreLabel: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: colors.accent,
    fontSize: 56,
    fontWeight: fontWeight.bold,
  },
  scoreDetail: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  actorsSection: {
    marginTop: spacing.lg,
  },
  actorList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surface.raised,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  actorThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  actorImage: {
    backgroundColor: surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actorInfo: {
    flex: 1,
  },
  actorName: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  removeButton: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
