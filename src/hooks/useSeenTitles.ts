import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

// Module-level cache (per user) so screens that mount useSeenTitles — e.g. the
// actor detail screen then the swipe screen — don't each block on a fresh
// network fetch. The detail screen warms it, so swipe loads instantly.
const seenCache = new Map<string, Set<number>>();

export function useSeenTitles() {
  const { user } = useAuth();
  const cached = user ? seenCache.get(user.id) : undefined;
  const [seenIds, setSeenIds] = useState<Set<number>>(cached ?? new Set());
  // Only show the blocking loading state when we have nothing cached yet.
  const [loading, setLoading] = useState(!cached);

  const fetchSeen = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('seen_titles')
      .select('title_id')
      .eq('user_id', user.id);
    const set = new Set(data?.map((d) => d.title_id) || []);
    seenCache.set(user.id, set);
    setSeenIds(set);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // If we have a cached set, render from it immediately and refresh quietly.
    const hit = user ? seenCache.get(user.id) : undefined;
    if (hit) {
      setSeenIds(hit);
      setLoading(false);
    }
    fetchSeen();
  }, [fetchSeen]);

  const setSeen = (titleId: number, seen: boolean) => {
    if (!user) return;
    setSeenIds((prev) => {
      const next = new Set(prev);
      if (seen) next.add(titleId);
      else next.delete(titleId);
      seenCache.set(user.id, next);
      return next;
    });
  };

  const markAsSeen = async (
    titleId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath: string | null,
    releaseYear: number | null
  ): Promise<boolean> => {
    if (!user) return false;

    // Optimistically reflect the swipe immediately so the UI never lags behind
    // a rapid deck. We roll back below if the write doesn't land.
    setSeen(titleId, true);

    // Ensure the title row exists (the seen_titles FK target) and refresh its
    // cached metadata. This has to succeed before the seen insert, or the FK
    // fails — which previously dropped swipes silently.
    const { error: titleError } = await supabase.from('titles').upsert({
      id: titleId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      release_year: releaseYear,
    });

    if (titleError) {
      setSeen(titleId, false);
      return false;
    }

    const { error } = await supabase.from('seen_titles').upsert({
      user_id: user.id,
      title_id: titleId,
    });

    if (error) {
      // Write failed (session expired, network, RLS) — undo the optimistic mark
      // so local state matches the DB instead of showing a phantom "seen".
      setSeen(titleId, false);
      return false;
    }
    return true;
  };

  const markAsUnseen = async (titleId: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('seen_titles')
      .delete()
      .eq('user_id', user.id)
      .eq('title_id', titleId);

    if (!error) {
      setSeenIds((prev) => {
        const next = new Set(prev);
        next.delete(titleId);
        seenCache.set(user.id, next);
        return next;
      });
    }
  };

  const isSeen = (titleId: number) => seenIds.has(titleId);

  return { seenIds, loading, markAsSeen, markAsUnseen, isSeen, refresh: fetchSeen };
}
