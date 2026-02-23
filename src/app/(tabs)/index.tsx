import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/AuthProvider';
import { useStats } from '../../hooks/useStats';
import { StatCard } from '../../components/StatCard';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { stats, loading } = useStats();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
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

        <View style={styles.statsGrid}>
          <StatCard
            label="Watched"
            value={stats?.total_watched ?? 0}
            loading={loading}
          />
          <StatCard
            label="Actors"
            value={stats?.unique_actors ?? 0}
            loading={loading}
          />
          <StatCard
            label="Friends"
            value={stats?.friends_count ?? 0}
            loading={loading}
          />
          <StatCard
            label="Top Actor"
            value={stats?.most_completed_actor_name || '-'}
            subtitle={stats?.most_completed_pct ? `${stats.most_completed_pct}%` : undefined}
            loading={loading}
          />
        </View>

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
    backgroundColor: colors.black,
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
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
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
