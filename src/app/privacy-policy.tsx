import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { surface, colors, spacing, fontSize, fontWeight } from '../lib/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: February 23, 2026</Text>

        <Text style={styles.body}>
          credits. ("we", "our", "us") is a social film tracking app that lets you track actors, mark movies and TV shows as watched, and connect with friends. This Privacy Policy explains what data we collect, how we use it, and your rights.
        </Text>

        <Text style={styles.heading}>Data We Collect</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Account information:</Text> When you sign up we collect your email address or phone number, display name, and username.{'\n\n'}
          <Text style={styles.bold}>Contacts:</Text> If you choose to find friends, we temporarily access your device contacts to match phone numbers against existing users. Contact data is not stored on our servers beyond the matching process.{'\n\n'}
          <Text style={styles.bold}>Push notification tokens:</Text> If you enable notifications, we store your device push token to deliver friend request alerts.{'\n\n'}
          <Text style={styles.bold}>Usage data:</Text> We store the movies and TV shows you mark as watched, actors you track, and your friend connections.
        </Text>

        <Text style={styles.heading}>How We Store Your Data</Text>
        <Text style={styles.body}>
          All data is stored securely in Supabase, a hosted PostgreSQL platform with row-level security enabled. Data is encrypted in transit and at rest.
        </Text>

        <Text style={styles.heading}>Third-Party Services</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>TMDB (The Movie Database):</Text> We use TMDB's API to retrieve film and actor information. No personal data is shared with TMDB.{'\n\n'}
          <Text style={styles.bold}>Expo Push Notifications:</Text> We use Expo's push notification service to deliver notifications to your device. Only your push token and notification content are sent to Expo.
        </Text>

        <Text style={styles.heading}>Tracking & Advertising</Text>
        <Text style={styles.body}>
          We do not use any analytics trackers, advertising SDKs, or third-party tracking tools. We do not sell or share your personal data with advertisers.
        </Text>

        <Text style={styles.heading}>Data Deletion</Text>
        <Text style={styles.body}>
          You may request deletion of your account and all associated data at any time by contacting us. Upon request, we will permanently delete your account, watch history, friend connections, and any other personal data.
        </Text>

        <Text style={styles.heading}>Contact Us</Text>
        <Text style={styles.body}>
          If you have questions about this Privacy Policy or want to request data deletion, contact us at:{'\n\n'}privacy@credits.app
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
  bold: {
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
