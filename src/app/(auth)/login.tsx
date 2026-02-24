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
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [isSignUp, setIsSignUp] = useState(true);
  const { signInWithPhone, signUpWithPassword, signInWithPassword } = useAuth();

  const handlePhoneSubmit = async () => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return;
    const fullPhone = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
    setLoading(true);
    const { error } = await signInWithPhone(fullPhone);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.push({ pathname: '/(auth)/verify', params: { phone: fullPhone } });
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
          {mode === 'phone' ? (
            <>
              <View style={styles.phoneRow}>
                <Text style={styles.phonePrefix}>+1</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.gray[500]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoComplete="tel"
                />
              </View>

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePhoneSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending...' : 'Send Code'}
                </Text>
              </Pressable>

              <Pressable onPress={() => setMode('email')}>
                <Text style={styles.switchText}>Use email instead</Text>
              </Pressable>
            </>
          ) : (
            <>
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

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray[500]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePasswordAuth}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              </Pressable>

              <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchText}>
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Text>
              </Pressable>

              <Pressable onPress={() => setMode('phone')}>
                <Text style={styles.switchText}>Use phone number instead</Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => router.push('/terms-of-service')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.legalLink} onPress={() => router.push('/privacy-policy')}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
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
    backgroundColor: surface.raised,
    color: colors.white,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: surface.raised,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: surface.border,
  },
  phonePrefix: {
    color: colors.gray[400],
    fontSize: fontSize.md,
    paddingLeft: spacing.md,
    fontWeight: fontWeight.medium,
  },
  phoneInput: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
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
  legalText: {
    color: colors.gray[500],
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  legalLink: {
    color: colors.gray[400],
    textDecorationLine: 'underline',
  },
});
