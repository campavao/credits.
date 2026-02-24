import { useState, useCallback } from 'react';
import { View, Text, TextInput, Image, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import { useStats } from '../../hooks/useStats';
import { useRecentlyWatched } from '../../hooks/useRecentlyWatched';
import { useTrackedActors } from '../../hooks/useTrackedActors';
import { getProfileUrl } from '../../lib/tmdb';
import { HorizontalScrollRow } from '../../components/HorizontalScrollRow';
import { PosterCard, PosterCardSkeleton } from '../../components/PosterCard';
import { HeroCard, HeroCardSkeleton } from '../../components/HeroCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

const AVATAR_SIZE = 88;

export default function ProfileScreen() {
  const { profile, signOut, updateDisplayName } = useAuth();
  const { stats, loading, refresh: refreshStats } = useStats();
  const { titles, loading: titlesLoading, refresh: refreshTitles } = useRecentlyWatched();
  const { actors: topActors, refresh: refreshActors } = useTrackedActors();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
      refreshActors();
      refreshTitles();
    }, [])
  );
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const startEditing = () => {
    setNameInput(profile?.display_name || '');
    setEditing(true);
  };

  const saveDisplayName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const { error } = await updateDisplayName(trimmed);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditing(false);
    }
  };

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
          <Pressable onPress={() => router.push('/profile-picture')}>
            {(() => {
              const savedId = profile?.avatar_actor_ids?.[0];
              const actor = savedId ? topActors.find((a) => a.id === savedId) : null;
              const imageUrl = actor?.profile_path ? getProfileUrl(actor.profile_path, 'small') : null;

              if (imageUrl) {
                return <Image source={{ uri: imageUrl }} style={styles.avatar} />;
              }
              return (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarText}>
                    {(profile?.display_name || profile?.username || '?')[0].toUpperCase()}
                  </Text>
                </View>
              );
            })()}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </Pressable>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                maxLength={50}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={saveDisplayName}
              />
              <Pressable onPress={saveDisplayName} hitSlop={8}>
                <Ionicons name="checkmark" size={22} color={colors.success} />
              </Pressable>
              <Pressable onPress={() => setEditing(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.gray[400]} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {profile?.display_name || profile?.username || 'User'}
              </Text>
              <Pressable onPress={startEditing} hitSlop={8}>
                <Ionicons name="pencil" size={16} color={colors.gray[400]} />
              </Pressable>
            </View>
          )}
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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  avatarFallback: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: -2,
    backgroundColor: colors.accent,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: surface.base,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editInput: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: spacing.xs,
    minWidth: 120,
    textAlign: 'center',
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
