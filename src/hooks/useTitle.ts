import { useState, useEffect } from 'react';
import { getMovieDetails, getTVDetails, getTitleCredits } from '../lib/tmdb';
import type { TMDBMovieDetails, TMDBTVDetails, TMDBCastMember } from '../types/tmdb';
import { MAX_CAST_DEPTH } from '../lib/constants';

type TitleDetails = (TMDBMovieDetails | TMDBTVDetails) & { mediaType: 'movie' | 'tv' };

export function useTitle(id: number, mediaType: 'movie' | 'tv') {
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [cast, setCast] = useState<TMDBCastMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [detailsData, creditsData] = await Promise.all([
          mediaType === 'movie' ? getMovieDetails(id) : getTVDetails(id),
          getTitleCredits(id, mediaType),
        ]);

        if (cancelled) return;
        setDetails({ ...detailsData, mediaType });
        setCast(creditsData.cast.slice(0, MAX_CAST_DEPTH));
      } catch {
        // TODO: error state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, mediaType]);

  return { details, cast, loading };
}
