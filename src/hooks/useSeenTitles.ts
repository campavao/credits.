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

  const markAsSeen = async (
    titleId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath: string | null,
    releaseYear: number | null
  ) => {
    if (!user) return;

    // Upsert title cache
    await supabase.from('titles').upsert({
      id: titleId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      release_year: releaseYear,
    });

    // Insert seen record
    const { error } = await supabase.from('seen_titles').upsert({
      user_id: user.id,
      title_id: titleId,
    });

    if (!error) {
      setSeenIds((prev) => {
        const next = new Set(prev).add(titleId);
        seenCache.set(user.id, next);
        return next;
      });
    }
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
