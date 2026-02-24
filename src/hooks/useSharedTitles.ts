import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface SharedTitle {
  title_id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}

export function useSharedTitles(friendId: string) {
  const { user } = useAuth();
  const [titles, setTitles] = useState<SharedTitle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);

      // Get both users' seen titles
      const [{ data: myData }, { data: friendData }] = await Promise.all([
        supabase
          .from('seen_titles')
          .select('title_id')
          .eq('user_id', user.id),
        supabase
          .from('seen_titles')
          .select('title_id')
          .eq('user_id', friendId),
      ]);

      if (!myData || !friendData) {
        setTitles([]);
        setLoading(false);
        return;
      }

      const friendTitleIds = new Set(friendData.map((d) => d.title_id));
      const sharedIds = myData
        .filter((d) => friendTitleIds.has(d.title_id))
        .map((d) => d.title_id);

      if (sharedIds.length === 0) {
        setTitles([]);
        setLoading(false);
        return;
      }

      // Fetch title details
      const { data: titleData } = await supabase
        .from('titles')
        .select('id, title, poster_path, media_type')
        .in('id', sharedIds.slice(0, 50));

      if (titleData) {
        setTitles(
          titleData.map((t) => ({
            title_id: t.id,
            title: t.title,
            poster_path: t.poster_path,
            media_type: t.media_type as 'movie' | 'tv',
          }))
        );
      }
      setLoading(false);
    }

    load();
  }, [user, friendId]);

  return { titles, loading };
}
