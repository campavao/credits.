import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import type { TMDBSearchResult } from '../types/tmdb';

export function useSeenTitles() {
  const { user } = useAuth();
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchSeen = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('seen_titles')
      .select('title_id')
      .eq('user_id', user.id);
    setSeenIds(new Set(data?.map((d) => d.title_id) || []));
    setLoading(false);
  }, [user]);

  useEffect(() => {
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
      setSeenIds((prev) => new Set(prev).add(titleId));
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
        return next;
      });
    }
  };

  const isSeen = (titleId: number) => seenIds.has(titleId);

  return { seenIds, loading, markAsSeen, markAsUnseen, isSeen, refresh: fetchSeen };
}
