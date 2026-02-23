import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

export default function AddModal() {
  const dismiss = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <Pressable style={styles.overlay} onPress={dismiss}>
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <View style={styles.handle} />
        <Text style={styles.title}>What do you want to do?</Text>

        <Pressable
          style={styles.card}
          onPress={() => {
            dismiss();
            setTimeout(() => router.push('/search'), 50);
          }}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="search" size={28} color={colors.accent} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Search</Text>
            <Text style={styles.cardDesc}>Find a movie or TV show</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[500]} />
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => {
            dismiss();
            setTimeout(() => router.push('/actor-search'), 50);
          }}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="people" size={28} color={colors.accent} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Actor Mode</Text>
            <Text style={styles.cardDesc}>Swipe through an actor's filmography</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[500]} />
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.gray[900],
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[600],
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  cardDesc: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
});
