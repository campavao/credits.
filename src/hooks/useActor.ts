import { useState, useEffect } from 'react';
import { getPersonDetails, getPersonCredits } from '../lib/tmdb';
import type { TMDBPersonDetails, TMDBPersonCreditEntry } from '../types/tmdb';

interface ActorData {
  details: TMDBPersonDetails;
  filmography: TMDBPersonCreditEntry[];
}

// Module-level cache so navigating actor detail -> swipe (both call useActor)
// reuses the already-fetched data instead of refetching the whole filmography.
const actorCache = new Map<number, ActorData>();

export function useActor(id: number) {
  const cached = actorCache.get(id);
  const [details, setDetails] = useState<TMDBPersonDetails | null>(cached?.details ?? null);
  const [filmography, setFilmography] = useState<TMDBPersonCreditEntry[]>(cached?.filmography ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Serve from cache instantly when we've already loaded this actor.
    const hit = actorCache.get(id);
    if (hit) {
      setDetails(hit.details);
      setFilmography(hit.filmography);
      setLoading(false);
      setError(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [person, credits] = await Promise.all([
          getPersonDetails(id),
          getPersonCredits(id),
        ]);

        if (cancelled) return;

        // Deduplicate and sort by popularity (vote_count)
        const seen = new Set<number>();
        const filtered = credits.cast
          .filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          })
          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

        actorCache.set(id, { details: person, filmography: filtered });
        setDetails(person);
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
