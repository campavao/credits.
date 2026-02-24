import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import { useTrackedActors } from '../hooks/useTrackedActors';
import { getProfileUrl } from '../lib/tmdb';
import { surface, colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';

const PREVIEW_SIZE = 96;

export default function ProfilePictureScreen() {
  const { profile, updateAvatarActors } = useAuth();
  const { actors, loading } = useTrackedActors();
  const [selectedId, setSelectedId] = useState<number | null>(
    () => profile?.avatar_actor_ids?.[0] ?? null
  );
  const [saving, setSaving] = useState(false);

  const handleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateAvatarActors(selectedId ? [selectedId] : []);
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.back();
    }
  };

  const selectedActor = selectedId ? actors.find((a) => a.id === selectedId) : null;
  const previewUrl = selectedActor?.profile_path
    ? getProfileUrl(selectedActor.profile_path, 'medium')
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile Picture</Text>
        <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
          <Text style={[styles.saveText, saving && styles.saveDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        {previewUrl ? (
          <Image source={{ uri: previewUrl }} style={styles.preview} />
        ) : (
          <View style={[styles.preview, styles.previewFallback]}>
            <Text style={styles.previewFallbackText}>
              {(profile?.display_name || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.previewHint}>
          {selectedActor ? selectedActor.name : 'Choose an actor'}
        </Text>
      </View>

      {/* Actor grid */}
      <FlatList
        data={actors}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Watch more movies to build your actor crew!
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const imageUrl = getProfileUrl(item.profile_path, 'small');
          const isSelected = item.id === selectedId;
          return (
            <Pressable
              style={[styles.actorCell, isSelected && styles.actorCellSelected]}
              onPress={() => handleSelect(item.id)}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.actorImage} />
              ) : (
                <View style={[styles.actorImage, styles.actorPlaceholder]}>
                  <Text style={styles.actorPlaceholderText}>
                    {item.name[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                </View>
              )}
              <Text style={styles.actorName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.actorCount}>{item.seen_count} seen</Text>
            </Pressable>
          );
        }}
      />
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
  saveText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: surface.overlay,
  },
  previewFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  previewFallbackText: {
    color: colors.white,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
  },
  previewHint: {
    color: colors.gray[400],
    fontSize: fontSize.sm,
  },
  gridContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actorCell: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actorCellSelected: {
    borderColor: colors.accent,
    backgroundColor: surface.raised,
  },
  actorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: surface.overlay,
  },
  actorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actorPlaceholderText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: surface.base,
    borderRadius: 11,
  },
  actorName: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actorCount: {
    color: colors.gray[500],
    fontSize: fontSize.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
