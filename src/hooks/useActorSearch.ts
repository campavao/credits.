import { useState, useEffect, useRef } from 'react';
import { searchPerson } from '../lib/tmdb';
import { SEARCH_DEBOUNCE_MS } from '../lib/constants';
import type { TMDBPersonSearchResult } from '../types/tmdb';

export function useActorSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBPersonSearchResult[]>([]);
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
        const data = await searchPerson(query.trim());
        setResults(data.results);
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
