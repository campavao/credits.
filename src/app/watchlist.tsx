import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWatchlistTitles } from '../hooks/useWatchlistTitles';
import { useWatchList } from '../hooks/useWatchList';
import { TitleCard } from '../components/TitleCard';
import { Skeleton } from '../components/ui/Skeleton';
import { goBack } from '../lib/navigation';
import { colors, spacing, fontSize, fontWeight, surface } from '../lib/theme';

export default function WatchListScreen() {
  const { titles, loading, refresh } = useWatchlistTitles();
  const { removeFromWatchList } = useWatchList();

  // Refresh on focus so the list reflects titles added/removed elsewhere
  // (e.g. marked as watched from the detail screen).
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleRemove = async (titleId: number) => {
    await removeFromWatchList(titleId);
    refresh();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable style={styles.backButton} onPress={() => goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.accent} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.header}>Watch List</Text>

      <FlatList
        data={titles}
        keyExtractor={(item) => String(item.title_id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowCard}>
              <TitleCard
                id={item.title_id}
                title={item.title}
                mediaType={item.media_type}
                posterPath={item.poster_path}
                onPress={() =>
                  router.push({
                    pathname: '/title/[id]',
                    params: { id: item.title_id, mediaType: item.media_type },
                  })
                }
              />
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemove(item.title_id)}
              hitSlop={8}
            >
              <Ionicons name="bookmark" size={22} color={colors.accent} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
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
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color={colors.gray[600]} />
              <Text style={styles.emptyTitle}>Nothing to watch yet</Text>
              <Text style={styles.emptyText}>
                Tap the bookmark on any movie or show to save it here for later.
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
  rowCard: {
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
    justifyContent: 'center',
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
