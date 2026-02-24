import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { surface, colors, spacing, fontSize, fontWeight } from '../lib/theme';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: February 23, 2026</Text>

        <Text style={styles.body}>
          By using credits. ("the App"), you agree to these Terms of Service. If you do not agree, please do not use the App.
        </Text>

        <Text style={styles.heading}>Acceptable Use</Text>
        <Text style={styles.body}>
          You agree to use the App only for its intended purpose — tracking movies, TV shows, and actors, and connecting with friends. You will not:{'\n\n'}
          • Impersonate other users or create misleading accounts{'\n'}
          • Use automated tools to scrape data from the App{'\n'}
          • Attempt to interfere with or disrupt the App's infrastructure{'\n'}
          • Use the App for any unlawful purpose
        </Text>

        <Text style={styles.heading}>Your Account</Text>
        <Text style={styles.body}>
          You are responsible for maintaining the security of your account credentials. We reserve the right to suspend or terminate accounts that violate these terms or are inactive for an extended period.
        </Text>

        <Text style={styles.heading}>Content Attribution</Text>
        <Text style={styles.body}>
          Film and actor data displayed in the App is provided by TMDB (The Movie Database). This product uses the TMDB API but is not endorsed or certified by TMDB. All film metadata, images, and related content are the property of their respective owners.
        </Text>

        <Text style={styles.heading}>Limitation of Liability</Text>
        <Text style={styles.body}>
          The App is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the App, including but not limited to data loss, service interruptions, or inaccuracies in film data.
        </Text>

        <Text style={styles.heading}>Changes to These Terms</Text>
        <Text style={styles.body}>
          We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated terms. We will make reasonable efforts to notify users of significant changes.
        </Text>

        <Text style={styles.heading}>Contact Us</Text>
        <Text style={styles.body}>
          If you have questions about these Terms of Service, contact us at:{'\n\n'}support@credits.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  updated: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.gray[300],
    lineHeight: 24,
  },
});
