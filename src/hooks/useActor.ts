import { useState, useEffect } from 'react';
import { getPersonDetails, getPersonCredits } from '../lib/tmdb';
import type { TMDBPersonDetails, TMDBPersonCreditEntry } from '../types/tmdb';

export function useActor(id: number) {
  const [details, setDetails] = useState<TMDBPersonDetails | null>(null);
  const [filmography, setFilmography] = useState<TMDBPersonCreditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [person, credits] = await Promise.all([
          getPersonDetails(id),
          getPersonCredits(id),
        ]);

        if (cancelled) return;
        setDetails(person);

        // Deduplicate and sort by popularity (vote_count), filter out entries without posters
        const seen = new Set<number>();
        const filtered = credits.cast
          .filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          })
          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

        setFilmography(filtered);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { details, filmography, loading, error };
}
