import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a magic link to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.hint}>
          Tap the link in the email to sign in. You can close this screen.
        </Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  backButtonText: {
    color: colors.gray[300],
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
