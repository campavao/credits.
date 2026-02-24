import { View, Text, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useSearch } from '../hooks/useSearch';
import { SearchBar } from '../components/ui/SearchBar';
import { TitleCard } from '../components/TitleCard';
import { Skeleton } from '../components/ui/Skeleton';
import { surface, colors, spacing, fontSize, fontWeight } from '../lib/theme';
import type { TMDBSearchResult } from '../types/tmdb';

export default function SearchScreen() {
  const { query, setQuery, results, loading } = useSearch();

  const getReleaseYear = (item: TMDBSearchResult) => {
    const date = item.release_date || item.first_air_date;
    return date ? date.substring(0, 4) : undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.header}>Search</Text>
        <View style={styles.spacer} />
      </View>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search movies & TV shows..."
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton.Rect width={80} height={120} />
              <View style={styles.skeletonText}>
                <Skeleton.Text width="80%" height={16} />
                <Skeleton.Text width="40%" height={14} />
              </View>
            </View>
          ))}
        </View>
      ) : !query.trim() ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Search for movies and TV shows to track</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          renderItem={({ item }) => (
            <TitleCard
              id={item.id}
              title={item.title || item.name || ''}
              mediaType={item.media_type as 'movie' | 'tv'}
              posterPath={item.poster_path}
              releaseYear={getReleaseYear(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  header: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  spacer: {
    width: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.md,
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
  list: {
    paddingBottom: spacing.xxl,
  },
});
