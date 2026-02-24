import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface RecentTitle {
  title_id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  watched_at: string;
}

export function useRecentlyWatched() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<RecentTitle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('seen_titles')
      .select('title_id, watched_at, titles(id, title, poster_path, media_type)')
      .eq('user_id', user.id)
      .order('watched_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      const mapped = data
        .filter((d: any) => d.titles)
        .map((d: any) => ({
          title_id: d.title_id,
          title: d.titles.title,
          poster_path: d.titles.poster_path,
          media_type: d.titles.media_type,
          watched_at: d.watched_at,
        }));
      setTitles(mapped);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { titles, loading, refresh: fetchRecent };
}
