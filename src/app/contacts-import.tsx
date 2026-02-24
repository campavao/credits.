import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  SectionList,
  ActivityIndicator,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import { useContactImport } from '../hooks/useContactImport';
import { useFriends } from '../hooks/useFriends';
import { FriendRow } from '../components/FriendRow';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';
import type { User } from '../types/database';

type SectionItem =
  | { type: 'matched'; user: User; name?: undefined; phone?: undefined }
  | { type: 'unmatched'; name: string; phone: string; user?: undefined };

export default function ContactsImportScreen() {
  const { permissionStatus, loading, matched, unmatched, ran, requestAndImport } = useContactImport();
  const { sendRequest } = useFriends();
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const handleAdd = async (userId: string) => {
    await sendRequest(userId);
    setSentIds((prev) => new Set(prev).add(userId));
  };

  const handleInvite = async (phone: string) => {
    const available = await SMS.isAvailableAsync();
    if (!available) {
      Alert.alert('SMS not available', 'This device cannot send text messages.');
      return;
    }
    await SMS.sendSMSAsync([phone], "I'm using credits. to track actors and movies — join me! https://credits.app");
  };

  const sections: { title: string; data: SectionItem[] }[] = [];
  if (matched.length > 0) {
    sections.push({ title: 'On credits.', data: matched.map((u): SectionItem => ({ type: 'matched', user: u })) });
  }
  if (unmatched.length > 0) {
    sections.push({
      title: 'Invite',
      data: unmatched.map((c): SectionItem => ({ type: 'unmatched', name: c.name, phone: c.phone })),
    });
  }

  const denied = permissionStatus === 'denied';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Find Friends</Text>
        <View style={{ width: 28 }} />
      </View>

      {!ran && !loading && !denied && (
        <View style={styles.ctaContainer}>
          <Ionicons name="people-circle-outline" size={64} color={colors.accent} />
          <Text style={styles.ctaTitle}>Find friends from contacts</Text>
          <Text style={styles.ctaDescription}>
            See which of your contacts are already on credits. and invite the rest.
          </Text>
          <Pressable style={styles.ctaButton} onPress={requestAndImport}>
            <Text style={styles.ctaButtonText}>Find Friends</Text>
          </Pressable>
        </View>
      )}

      {loading && (
        <View style={styles.ctaContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.ctaDescription}>Scanning contacts...</Text>
        </View>
      )}

      {denied && (
        <View style={styles.ctaContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.gray[500]} />
          <Text style={styles.ctaTitle}>Contacts access denied</Text>
          <Text style={styles.ctaDescription}>
            Enable contacts access in Settings to find friends.
          </Text>
          <Pressable style={styles.ctaButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.ctaButtonText}>Open Settings</Text>
          </Pressable>
        </View>
      )}

      {ran && !loading && sections.length === 0 && (
        <View style={styles.ctaContainer}>
          <Ionicons name="search-outline" size={64} color={colors.gray[500]} />
          <Text style={styles.ctaTitle}>No matches found</Text>
          <Text style={styles.ctaDescription}>
            None of your contacts are on credits. yet. Invite them!
          </Text>
        </View>
      )}

      {ran && !loading && sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) =>
            item.type === 'matched' ? item.user.id : `unmatched-${index}`
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            if (item.type === 'matched') {
              const sent = sentIds.has(item.user.id);
              return (
                <FriendRow
                  user={item.user}
                  action={
                    <Pressable
                      style={[styles.actionButton, sent && styles.actionButtonSent]}
                      onPress={() => handleAdd(item.user.id)}
                      disabled={sent}
                    >
                      <Text style={[styles.actionButtonText, sent && styles.actionButtonTextSent]}>
                        {sent ? 'Sent' : 'Add'}
                      </Text>
                    </Pressable>
                  }
                />
              );
            }
            return (
              <View style={styles.contactRow}>
                <View style={[styles.contactAvatar]}>
                  <Text style={styles.contactAvatarText}>
                    {item.name[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
                <Pressable style={styles.inviteButton} onPress={() => handleInvite(item.phone)}>
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </Pressable>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  ctaTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: fontSize.md,
    color: colors.gray[400],
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[400],
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: surface.base,
  },
  actionButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionButtonSent: {
    backgroundColor: surface.overlay,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actionButtonTextSent: {
    color: colors.gray[400],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  contactPhone: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  inviteButton: {
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  inviteButtonText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
