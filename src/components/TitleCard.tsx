import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPosterUrl } from '../lib/tmdb';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

interface TitleCardProps {
  id: number;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string | null;
  releaseYear?: string;
  onPress?: () => void;
}

export function TitleCard({ id, title, mediaType, posterPath, releaseYear, onPress }: TitleCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({ pathname: '/title/[id]', params: { id, mediaType } });
    }
  };

  const posterUrl = getPosterUrl(posterPath, 'medium');

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.placeholder]}>
          <Ionicons name="film-outline" size={28} color={colors.gray[500]} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.meta}>
          <Text style={styles.year}>{releaseYear || 'N/A'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{mediaType === 'movie' ? 'Movie' : 'TV'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[800],
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {},
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  year: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  badge: {
    backgroundColor: colors.gray[800],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.gray[400],
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
