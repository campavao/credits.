import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProfileUrl } from '../lib/tmdb';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

interface ActorRowProps {
  id: number;
  name: string;
  profilePath: string | null;
  character?: string;
}

export function ActorRow({ id, name, profilePath, character }: ActorRowProps) {
  const imageUrl = getProfileUrl(profilePath, 'small');

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push({ pathname: '/actor/[id]', params: { id } })}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Ionicons name="person-outline" size={20} color={colors.gray[500]} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {character ? <Text style={styles.character}>{character}</Text> : null}
      </View>
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
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[800],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  character: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
