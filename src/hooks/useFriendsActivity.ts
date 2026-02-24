import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface FriendActivity {
  friend_id: string;
  friend_name: string;
  friend_username: string | null;
  title_id: number;
  title_name: string;
  poster_path: string | null;
  media_type: string;
  watched_at: string;
}

export function useFriendsActivity() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('get_friends_recent_activity', {
      user_id_input: user.id,
    });

    if (!error && data) {
      setActivity(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activity, loading, refresh: fetchActivity };
}
