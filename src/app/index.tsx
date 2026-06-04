import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { colors, surface } from '../lib/theme';

export default function Index() {
  const { session, profile, loading, passwordRecovery } = useAuth();

  const spinner = (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  if (loading) {
    return spinner;
  }

  // Arrived via a password-reset email link — go set a new password.
  if (passwordRecovery) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Session exists but the profile row hasn't loaded yet (it's fetched in its
  // own effect now). Wait so a brand-new user routes to onboarding instead of
  // briefly flashing the home tab.
  if (!profile) {
    return spinner;
  }

  if (!profile.display_name) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: surface.base,
  },
});
