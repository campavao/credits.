import { useState, useEffect } from 'react';
import { getPersonDetails, getPersonCredits } from '../lib/tmdb';
import type { TMDBPersonDetails, TMDBPersonCreditEntry } from '../types/tmdb';

interface ActorData {
  details: TMDBPersonDetails;
  filmography: TMDBPersonCreditEntry[];
}

// TMDB's combined_credits cast includes talk shows, award shows, and news where
// the person appears as themselves (character "Self", "Herself", "Self - Guest",
// etc.). Those aren't acting roles, so we drop them from the filmography — they
// otherwise inflate completion stats and pad the swipe deck with non-films.
function isSelfAppearance(character: string | undefined): boolean {
  const ch = (character || '').trim().toLowerCase();
  return /^self\b/.test(ch) || /^(him|her|them)self\b/.test(ch);
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

        // Drop self-appearances, deduplicate, then sort by popularity.
        const seen = new Set<number>();
        const filtered = credits.cast
          .filter((c) => {
            if (isSelfAppearance(c.character)) return false;
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
