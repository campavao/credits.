import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrackedActors, formatSeenSubtitle } from '../hooks/useTrackedActors';
import { ActorRow } from '../components/ActorRow';
import { Skeleton } from '../components/ui/Skeleton';
import { goBack } from '../lib/navigation';
import { colors, spacing, fontSize, fontWeight, surface } from '../lib/theme';

// Full ranked crew — everyone the user has watched, not just the top 10 shown
// on Home. Lets heavily-watched-but-not-top-10 actors surface.
const MAX_CREW = 100;

export default function ActorsScreen() {
  const { actors, loading, refresh } = useTrackedActors(MAX_CREW);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable style={styles.backButton} onPress={() => goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.accent} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.header}>Your Crew</Text>

      <FlatList
        data={actors}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.rowCard}>
              <ActorRow
                id={item.id}
                name={item.name}
                profilePath={item.profile_path}
                character={formatSeenSubtitle(item)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={styles.skeletonRow}>
                  <Skeleton.Rect width={48} height={48} />
                  <View style={styles.skeletonText}>
                    <Skeleton.Text width="60%" height={16} />
                    <Skeleton.Text width="35%" height={14} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.gray[600]} />
              <Text style={styles.emptyTitle}>No crew yet</Text>
              <Text style={styles.emptyText}>
                Mark movies and shows as watched to start building your crew.
              </Text>
            </View>
          )
        }
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
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    width: 32,
    textAlign: 'center',
  },
  rowCard: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  skeletonText: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    color: colors.gray[400],
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
