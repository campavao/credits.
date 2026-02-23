import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useComparison } from '../../hooks/useComparison';
import { ComparisonBar } from '../../components/ComparisonBar';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
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
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function load() {
      // Load friend profile
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      setFriend(data);
      setLoadingProfile(false);

      // Get overlap score
      const score = await getOverlapScore(id);
      setOverlap(score);
    }
    load();
  }, [id]);

  if (loadingProfile || !friend) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(friend.display_name || friend.username || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>
            {friend.display_name || friend.username || 'User'}
          </Text>
        </View>

        {/* Overlap Score */}
        <View style={styles.scoreCard}>
          {loading ? (
            <ActivityIndicator color={colors.accent} />
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
      </ScrollView>
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
  header: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[800],
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
  scoreCard: {
    backgroundColor: colors.gray[900],
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
});
