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

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateDisplayName } = useAuth();

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    const { error } = await updateDisplayName(trimmed);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>credits.</Text>
        <Text style={styles.title}>What should we call you?</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.gray[500]}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
            maxLength={50}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          <Pressable
            style={[styles.button, (!name.trim() || loading) && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!name.trim() || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </Pressable>
        </View>
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
  title: {
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
});
