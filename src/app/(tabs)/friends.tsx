import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../../hooks/useFriends';
import { useStaggeredEntrance } from '../../lib/animations';
import { SearchBar } from '../../components/ui/SearchBar';
import { FriendRow } from '../../components/FriendRow';
import { Skeleton } from '../../components/ui/Skeleton';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
import type { User } from '../../types/database';

function StaggeredFriendRow({ index, children }: { index: number; children: React.ReactNode }) {
  const animatedStyle = useStaggeredEntrance(index);
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function FriendRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton.Circle width={44} />
      <View style={styles.skeletonText}>
        <Skeleton.Text width={140} height={16} />
        <Skeleton.Text width={90} height={14} />
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const { friends, pending, loading, searchUsers, sendRequest, acceptRequest, declineRequest, refresh } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(text.trim());
    setSearchResults(results);
    setSearching(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Friends</Text>

      <Pressable style={styles.contactsButton} onPress={() => router.push('/contacts-import')}>
        <Ionicons name="people-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.contactsButtonText}>Find from contacts</Text>
      </Pressable>

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Find friends by username..."
      />

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Search results */}
            {searchResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {searchResults.map((u) => (
                  <FriendRow
                    key={u.id}
                    user={u}
                    action={
                      <Pressable style={styles.addButton} onPress={() => sendRequest(u.id)}>
                        <Text style={styles.addButtonText}>Add</Text>
                      </Pressable>
                    }
                  />
                ))}
              </View>
            )}

            {/* Pending requests */}
            {pending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Pending Requests ({pending.length})
                </Text>
                {pending.map((f) => (
                  <FriendRow
                    key={f.id}
                    user={f.friend}
                    action={
                      <View style={styles.pendingActions}>
                        <Pressable
                          style={styles.acceptButton}
                          onPress={() => acceptRequest(f.id)}
                        >
                          <Text style={styles.acceptText}>Accept</Text>
                        </Pressable>
                        <Pressable
                          style={styles.declineButton}
                          onPress={() => declineRequest(f.id)}
                        >
                          <Text style={styles.declineText}>Decline</Text>
                        </Pressable>
                      </View>
                    }
                  />
                ))}
              </View>
            )}

            {/* Friends list */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Friends ({friends.length})
              </Text>
              {loading ? (
                <View style={styles.skeletonList}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FriendRowSkeleton key={i} />
                  ))}
                </View>
              ) : friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={colors.gray[600]} />
                  <Text style={styles.emptyTitle}>No friends yet</Text>
                  <Text style={styles.emptyText}>
                    Search for friends by username to get started
                  </Text>
                </View>
              ) : (
                friends.map((f, index) => (
                  <StaggeredFriendRow key={f.id} index={index}>
                    <FriendRow
                      user={f.friend}
                      onPress={() =>
                        router.push({ pathname: '/friend/[id]', params: { id: f.friend.id } })
                      }
                    />
                  </StaggeredFriendRow>
                ))
              )}
            </View>
          </>
        }
        refreshing={loading}
        onRefresh={refresh}
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
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[400],
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  skeletonList: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  skeletonText: {
    gap: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  acceptText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  declineButton: {
    backgroundColor: surface.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  declineText: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  contactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  contactsButtonText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
