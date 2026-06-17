import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface WatchlistTitle {
  title_id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  release_year: number | null;
  added_at: string;
}

export function useWatchlistTitles() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<WatchlistTitle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('title_id, added_at, titles(id, title, poster_path, media_type, release_year)')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (!error && data) {
        const mapped = data
          .filter((d: any) => d.titles)
          .map((d: any) => ({
            title_id: d.title_id,
            title: d.titles.title,
            poster_path: d.titles.poster_path,
            media_type: d.titles.media_type,
            release_year: d.titles.release_year,
            added_at: d.added_at,
          }));
        setTitles(mapped);
      }
    } catch {
      // Network/unexpected error — keep prior titles; spinner clears below.
    } finally {
      // Initial-load-only spinner + can't strand on a failed/stuck request.
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return { titles, loading, refresh: fetchWatchlist };
}
