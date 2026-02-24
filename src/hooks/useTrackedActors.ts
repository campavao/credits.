import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface TrackedActor {
  id: number;
  name: string;
  profile_path: string | null;
  seen_count: number;
}

export function useTrackedActors() {
  const { user } = useAuth();
  const [actors, setActors] = useState<TrackedActor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActors = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get the user's seen title IDs
    const { data: seenData } = await supabase
      .from('seen_titles')
      .select('title_id')
      .eq('user_id', user.id);

    if (!seenData || seenData.length === 0) {
      setActors([]);
      setLoading(false);
      return;
    }

    const titleIds = seenData.map((s) => s.title_id);

    // Get appearances for those titles with actor info
    const { data: appearances } = await supabase
      .from('appearances')
      .select('actor_id, actors(id, name, profile_path)')
      .in('title_id', titleIds.slice(0, 200));

    if (!appearances) {
      setActors([]);
      setLoading(false);
      return;
    }

    // Group by actor and count
    const actorMap = new Map<number, TrackedActor>();
    for (const a of appearances) {
      const actor = (a as any).actors;
      if (!actor) continue;
      const existing = actorMap.get(actor.id);
      if (existing) {
        existing.seen_count++;
      } else {
        actorMap.set(actor.id, {
          id: actor.id,
          name: actor.name,
          profile_path: actor.profile_path,
          seen_count: 1,
        });
      }
    }

    // Sort by seen_count descending, take top 10
    const sorted = Array.from(actorMap.values())
      .sort((a, b) => b.seen_count - a.seen_count)
      .slice(0, 10);

    setActors(sorted);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  return { actors, loading, refresh: fetchActors };
}
