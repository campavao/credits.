import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../lib/theme';

interface StarRatingProps {
  /** Rating on a 0-10 scale (TMDB). Displayed as 0-5 stars. */
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 18 }: StarRatingProps) {
  const stars = rating / 2; // Convert 0-10 to 0-5
  const fullStars = Math.floor(stars);
  const hasHalf = stars - fullStars >= 0.25 && stars - fullStars < 0.75;
  const adjustedFull = stars - fullStars >= 0.75 ? fullStars + 1 : fullStars;
  const emptyStars = 5 - adjustedFull - (hasHalf ? 1 : 0);

  return (
    <View style={styles.container}>
      {Array.from({ length: adjustedFull }).map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color={colors.gold} />
      ))}
      {hasHalf && <Ionicons name="star-half" size={size} color={colors.gold} />}
      {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color={colors.gold} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
