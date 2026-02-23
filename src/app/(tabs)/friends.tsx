import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFriends } from '../../hooks/useFriends';
import { SearchBar } from '../../components/ui/SearchBar';
import { FriendRow } from '../../components/FriendRow';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
import type { User } from '../../types/database';

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
                <ActivityIndicator color={colors.accent} style={styles.loader} />
              ) : friends.length === 0 ? (
                <Text style={styles.emptyText}>
                  Search for friends by username to get started
                </Text>
              ) : (
                friends.map((f) => (
                  <FriendRow
                    key={f.id}
                    user={f.friend}
                    onPress={() =>
                      router.push({ pathname: '/friend/[id]', params: { id: f.friend.id } })
                    }
                  />
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
    backgroundColor: colors.black,
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
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  loader: {
    paddingVertical: spacing.xl,
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
    backgroundColor: colors.gray[800],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  declineText: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
});
