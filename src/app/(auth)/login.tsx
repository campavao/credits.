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
import { PosterWall } from '../../components/PosterWall';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<'phone' | 'email'>(
    isWeb ? 'email' : 'phone'
  );
  const [isSignUp, setIsSignUp] = useState(true);
  const { signInWithPhone, signUpWithPassword, signInWithPassword, resetPassword } = useAuth();

  // Web: "Forgot password?" — emails a reset link to whatever's in the email field.
  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Enter your email above first, then tap "Forgot password".');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(cleanEmail);
    setLoading(false);
    if (error) setError(error.message);
    else setNotice('Reset link sent! Check your email, then come back and sign in with your new password.');
  };

  // Web: one button that signs in if the account exists, or creates it if not —
  // so non-technical friends never have to choose "sign up" vs "sign in".
  const handleWebAuth = async () => {
    setError(null);
    setNotice(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Enter your email and a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);

    // Try signing in first.
    const signIn = await signInWithPassword(cleanEmail, password);
    if (!signIn.error) {
      setLoading(false);
      router.replace('/');
      return;
    }

    // Account exists but the email hasn't been verified yet.
    if (/confirm/i.test(signIn.error.message)) {
      setLoading(false);
      setNotice('Almost there! Check your email and click the confirmation link to finish signing up.');
      return;
    }

    // Sign-in failed — either it's a new account, or the password is wrong.
    const signUp = await signUpWithPassword(cleanEmail, password);
    setLoading(false);

    if (signUp.error) {
      // Account exists but sign-in failed above → the password was wrong.
      if (/already|registered|exists/i.test(signUp.error.message)) {
        setError('That email is already in use. Check your password and try again.');
      } else {
        setError(signUp.error.message);
      }
      return;
    }

    if (signUp.needsConfirmation) {
      setNotice("Account created! Check your email for a confirmation link, then come back and enter the same details.");
      return;
    }

    router.replace('/');
  };

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
      <PosterWall />
      <View style={styles.content}>
        <Text style={styles.logo}>creditz.</Text>
        <Text style={styles.tagline}>track actors, not just movies</Text>

        <View style={styles.form}>
          {isWeb ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.gray[500]}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(null); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray[500]}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(null); }}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleWebAuth}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}
              {notice && <Text style={styles.noticeText}>{notice}</Text>}

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleWebAuth}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'One sec…' : 'Continue'}
                </Text>
              </Pressable>

              <Pressable onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.switchText}>Forgot password?</Text>
              </Pressable>

              <Text style={styles.hintText}>
                New here? Just enter your email and pick a password — we'll create your account automatically.
              </Text>
            </>
          ) : mode === 'phone' ? (
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
  errorText: {
    color: '#F87171',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  noticeText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintText: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
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
