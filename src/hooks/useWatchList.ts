import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

// Module-level cache (per user), same pattern as useSeenTitles, so the toggle
// button renders its correct state instantly when navigating between screens
// instead of blocking on a fresh network fetch each time.
const watchlistCache = new Map<string, Set<number>>();

export function useWatchList() {
  const { user } = useAuth();
  const cached = user ? watchlistCache.get(user.id) : undefined;
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(cached ?? new Set());
  // Only show the blocking loading state when we have nothing cached yet.
  const [loading, setLoading] = useState(!cached);

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('watchlist')
      .select('title_id')
      .eq('user_id', user.id);
    const set = new Set(data?.map((d) => d.title_id) || []);
    watchlistCache.set(user.id, set);
    setWatchlistIds(set);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // If we have a cached set, render from it immediately and refresh quietly.
    const hit = user ? watchlistCache.get(user.id) : undefined;
    if (hit) {
      setWatchlistIds(hit);
      setLoading(false);
    }
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchList = async (
    titleId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath: string | null,
    releaseYear: number | null
  ) => {
    if (!user) return;

    // Upsert title cache so the watchlist screen has poster/title to display.
    await supabase.from('titles').upsert({
      id: titleId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      release_year: releaseYear,
    });

    const { error } = await supabase.from('watchlist').upsert({
      user_id: user.id,
      title_id: titleId,
    });

    if (!error) {
      setWatchlistIds((prev) => {
        const next = new Set(prev).add(titleId);
        watchlistCache.set(user.id, next);
        return next;
      });
    }
  };

  const removeFromWatchList = async (titleId: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('title_id', titleId);

    if (!error) {
      setWatchlistIds((prev) => {
        const next = new Set(prev);
        next.delete(titleId);
        watchlistCache.set(user.id, next);
        return next;
      });
    }
  };

  const isInWatchList = (titleId: number) => watchlistIds.has(titleId);

  return {
    watchlistIds,
    loading,
    addToWatchList,
    removeFromWatchList,
    isInWatchList,
    refresh: fetchWatchlist,
  };
}
