import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'magic' | 'password'>('password');
  const [isSignUp, setIsSignUp] = useState(true);
  const { signInWithEmail, signUpWithPassword, signInWithPassword } = useAuth();

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await signInWithEmail(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim() } });
    }
  };

  const handlePasswordAuth = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);

    const { error } = isSignUp
      ? await signUpWithPassword(email.trim(), password)
      : await signInWithPassword(email.trim(), password);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>credits.</Text>
        <Text style={styles.tagline}>track actors, not just movies</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={colors.gray[500]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {mode === 'password' && (
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.gray[500]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={mode === 'magic' ? handleMagicLink : handlePasswordAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Loading...'
                : mode === 'magic'
                  ? 'Send Magic Link'
                  : isSignUp
                    ? 'Sign Up'
                    : 'Sign In'}
            </Text>
          </Pressable>

          {mode === 'password' && (
            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.socialButton}
            onPress={() => setMode(mode === 'magic' ? 'password' : 'magic')}
          >
            <Text style={styles.socialButtonText}>
              {mode === 'magic' ? 'Use Email & Password' : 'Use Magic Link'}
            </Text>
          </Pressable>

          <Pressable style={styles.socialButton} onPress={() => {}}>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable style={styles.socialButton} onPress={() => {}}>
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.lg,
  },
  logo: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.gray[900],
    color: colors.white,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  switchText: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[800],
  },
  dividerText: {
    color: colors.gray[500],
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  socialButton: {
    backgroundColor: colors.gray[900],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  socialButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
