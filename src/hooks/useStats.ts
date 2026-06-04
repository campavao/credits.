import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface UserStats {
  total_watched: number;
  unique_actors: number;
  most_completed_actor_id: number | null;
  most_completed_actor_name: string | null;
  most_completed_actor_profile_path: string | null;
  most_completed_pct: number;
  friends_count: number;
}

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // `loading` is only ever true for the initial load (it starts true and the
  // first fetch's `finally` clears it). Refreshes — e.g. the on-focus refresh —
  // don't re-toggle it, so returning to a screen doesn't flash skeletons. The
  // `finally` also guarantees a stuck request can never strand the spinner.
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_id_input: user.id,
      });
      if (!error && data && data.length > 0) {
        setStats(data[0]);
      }
    } catch {
      // Network/unexpected error — keep prior stats; the spinner clears below.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}
