import { useState, useEffect } from 'react';
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

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_id_input: user.id,
    });
    if (!error && data && data.length > 0) {
      setStats(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, loading, refresh: fetchStats };
}
