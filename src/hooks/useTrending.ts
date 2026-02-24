import { useState, useEffect, useCallback } from 'react';
import { getTrending } from '../lib/tmdb';
import type { TMDBSearchResult } from '../types/tmdb';

export function useTrending() {
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrending('all', 'week');
      // Filter to only movies and TV
      setResults(
        data.results.filter(
          (r) => r.media_type === 'movie' || r.media_type === 'tv'
        )
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { results, loading, refresh: fetchTrending };
}
