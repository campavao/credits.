import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearch } from '../../hooks/useSearch';
import { useSeenTitles } from '../../hooks/useSeenTitles';
import { SearchBar } from '../../components/ui/SearchBar';
import { TitleCard } from '../../components/TitleCard';
import { colors, spacing, fontSize, fontWeight } from '../../lib/theme';
import type { TMDBSearchResult } from '../../types/tmdb';

export default function HomeScreen() {
  const { query, setQuery, results, loading } = useSearch();
  const { isSeen } = useSeenTitles();

  const getReleaseYear = (item: TMDBSearchResult) => {
    const date = item.release_date || item.first_air_date;
    return date ? date.substring(0, 4) : undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>credits.</Text>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search movies & TV shows..."
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
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
    backgroundColor: colors.black,
  },
  header: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
  list: {
    paddingBottom: spacing.xxl,
  },
});
