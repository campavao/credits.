import { useState, useEffect, useRef } from 'react';
import { searchMulti } from '../lib/tmdb';
import { SEARCH_DEBOUNCE_MS } from '../lib/constants';
import type { TMDBSearchResult } from '../types/tmdb';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(query.trim());
        // Filter to only movies and TV shows
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
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  return { query, setQuery, results, loading };
}
