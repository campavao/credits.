import { View, Text, TextInput, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useActorSearch } from '../hooks/useActorSearch';
import { getProfileUrl } from '../lib/tmdb';
import { Skeleton } from '../components/ui/Skeleton';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface } from '../lib/theme';

export default function ActorSearchScreen() {
  const { query, setQuery, results, loading } = useActorSearch();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Actor Mode</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[500]} />
        <TextInput
          style={styles.input}
          placeholder="Search for an actor..."
          placeholderTextColor={colors.gray[500]}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray[500]} />
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton.Circle width={48} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Skeleton.Text width={140} height={16} />
                <Skeleton.Text width={80} height={14} />
              </View>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const imageUrl = getProfileUrl(item.profile_path, 'small');
          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/actor/[id]/swipe', params: { id: String(item.id) } })
              }
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person-outline" size={24} color={colors.gray[500]} />
                </View>
              )}
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.dept}>{item.known_for_department}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[500]} />
            </Pressable>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && query.length > 0 ? (
            <Text style={styles.empty}>No actors found</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  header: {
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
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  spacer: {
    width: 60,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surface.raised,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
  skeletonList: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: surface.overlay,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  dept: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  empty: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
