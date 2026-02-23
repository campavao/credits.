import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';
import type { User } from '../types/database';

interface FriendRowProps {
  user: User;
  onPress?: () => void;
  action?: React.ReactNode;
}

export function FriendRow({ user, onPress, action }: FriendRowProps) {
  return (
    <Pressable style={styles.container} onPress={onPress} disabled={!onPress}>
      {user.avatar_url ? (
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {(user.display_name || user.username || '?')[0].toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{user.display_name || user.username || 'User'}</Text>
        {user.username && (
          <Text style={styles.username}>@{user.username}</Text>
        )}
      </View>
      {action}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[800],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  username: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
