import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { colors, surface } from '../lib/theme';

export default function Index() {
  const { session, profile, loading, passwordRecovery } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Arrived via a password-reset email link — go set a new password.
  if (passwordRecovery) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (profile && !profile.display_name) {
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
