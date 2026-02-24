import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing, fontSize, fontWeight, borderRadius, surface } from '../../lib/theme';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, signInWithPhone } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6 || !phone) return;
    setLoading(true);
    const { error } = await verifyOtp(phone, code);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    const { error } = await signInWithPhone(phone);
    setResending(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Code Sent', 'A new verification code has been sent.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="chatbubble" size={48} color={colors.accent} style={styles.icon} />
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor={colors.gray[600]}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          textAlign="center"
        />

        <Pressable
          style={[styles.verifyButton, (loading || code.length !== 6) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </Pressable>

        <Pressable onPress={handleResend} disabled={resending}>
          <Text style={styles.resendText}>
            {resending ? 'Sending...' : 'Resend code'}
          </Text>
        </Pressable>

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
    backgroundColor: surface.base,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  icon: {
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
  phone: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  codeInput: {
    backgroundColor: surface.raised,
    color: colors.white,
    fontSize: 32,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: surface.border,
    width: '100%',
    marginTop: spacing.xl,
    letterSpacing: 12,
  },
  verifyButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  resendText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xl,
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
