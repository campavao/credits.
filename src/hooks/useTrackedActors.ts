import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface TrackedActor {
  id: number;
  name: string;
  profile_path: string | null;
  seen_count: number;
  movie_count: number;
  tv_count: number;
}

export function formatSeenSubtitle(actor: TrackedActor): string {
  const parts: string[] = [];
  if (actor.movie_count > 0) parts.push(`${actor.movie_count} film${actor.movie_count !== 1 ? 's' : ''}`);
  if (actor.tv_count > 0) parts.push(`${actor.tv_count} show${actor.tv_count !== 1 ? 's' : ''}`);
  return parts.length > 0 ? `${parts.join(', ')} seen` : `${actor.seen_count} seen`;
}

export function useTrackedActors(limit = 10) {
  const { user } = useAuth();
  const [actors, setActors] = useState<TrackedActor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActors = useCallback(async () => {
    if (!user) return;
    try {
      // Aggregate server-side. Grouping in the DB covers the user's entire seen
      // history and avoids fetching every appearance row — the old client-side
      // path capped titles at 200 and tripped PostgREST's 1000-row limit, which
      // silently undercounted actors and produced a wrong "most watched" actor.
      const { data, error } = await supabase.rpc('get_tracked_actors', {
        user_id_input: user.id,
        lim: limit,
      });

      if (error || !data) {
        return;
      }

      // Counts come back as bigint (strings over the wire) — coerce to number.
      setActors(
        data.map((a: any) => ({
          id: a.id,
          name: a.name,
          profile_path: a.profile_path,
          seen_count: Number(a.seen_count),
          movie_count: Number(a.movie_count),
          tv_count: Number(a.tv_count),
        }))
      );
    } catch {
      // Network/unexpected error — keep prior actors; spinner clears below.
    } finally {
      // Initial-load-only spinner + can't strand on a failed/stuck request.
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  return { actors, loading, refresh: fetchActors };
}
