import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useComparison } from '../../hooks/useComparison';
import { useSharedTitles } from '../../hooks/useSharedTitles';
import { ComparisonBar } from '../../components/ComparisonBar';
import { HorizontalScrollRow } from '../../components/HorizontalScrollRow';
import { PosterCard, PosterCardSkeleton } from '../../components/PosterCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
import type { User } from '../../types/database';

export default function FriendCompareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<User | null>(null);
  const [overlap, setOverlap] = useState<{
    shared_count: number;
    total_unique: number;
    score: number;
  } | null>(null);
  const { getOverlapScore, loading } = useComparison();
  const { titles: sharedTitles, loading: sharedLoading } = useSharedTitles(id);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      setFriend(data);
      setLoadingProfile(false);

      const score = await getOverlapScore(id);
      setOverlap(score);
    }
    load();
  }, [id]);

  if (loadingProfile || !friend) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.skeletonHeader}>
          <Skeleton.Circle width={96} />
          <Skeleton.Text width={160} height={22} />
          <Skeleton.Text width={100} height={40} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Friend header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(friend.display_name || friend.username || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {friend.display_name || friend.username || 'User'}
          </Text>
          {friend.username && (
            <Text style={styles.username}>@{friend.username}</Text>
          )}
        </View>

        {/* Compatibility Score */}
        <View style={styles.scoreCard}>
          {loading ? (
            <Skeleton.Text width={120} height={56} />
          ) : overlap ? (
            <>
              <Text style={styles.scoreLabel}>Film Compatibility</Text>
              <Text style={styles.scoreValue}>{overlap.score}%</Text>
              <Text style={styles.scoreDetail}>
                {overlap.shared_count} shared titles out of {overlap.total_unique} combined
              </Text>
            </>
          ) : (
            <Text style={styles.scoreLabel}>No comparison data yet</Text>
          )}
        </View>

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

        {/* Comparison bars */}
        {overlap && (
          <View style={styles.comparisonSection}>
            <ComparisonBar
              label="Total Watched"
              valueA={overlap.shared_count}
              valueB={overlap.shared_count}
              total={overlap.total_unique}
              labelA="Shared"
              labelB="Total"
            />
          </View>
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
    padding: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.hero,
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
  comparisonSection: {
    marginTop: spacing.md,
  },
});
