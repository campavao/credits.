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
  const [friendOnlyTitles, setFriendOnlyTitles] = useState<SharedTitle[]>([]);
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
        setFriendOnlyTitles([]);
        setLoading(false);
        return;
      }

      const myTitleIds = new Set(myData.map((d) => d.title_id));
      const friendTitleIds = new Set(friendData.map((d) => d.title_id));

      const sharedIds = friendData
        .filter((d) => myTitleIds.has(d.title_id))
        .map((d) => d.title_id);

      const friendOnlyIds = friendData
        .filter((d) => !myTitleIds.has(d.title_id))
        .map((d) => d.title_id);

      // Fetch title details for both sets in parallel
      const allIds = [...new Set([...sharedIds, ...friendOnlyIds])].slice(0, 100);

      if (allIds.length === 0) {
        setTitles([]);
        setFriendOnlyTitles([]);
        setLoading(false);
        return;
      }

      const { data: titleData } = await supabase
        .from('titles')
        .select('id, title, poster_path, media_type')
        .in('id', allIds);

      if (titleData) {
        const titleMap = new Map(titleData.map((t) => [t.id, t]));

        const sharedSet = new Set(sharedIds);
        const friendOnlySet = new Set(friendOnlyIds);

        const toSharedTitle = (t: typeof titleData[0]): SharedTitle => ({
          title_id: t.id,
          title: t.title,
          poster_path: t.poster_path,
          media_type: t.media_type as 'movie' | 'tv',
        });

        setTitles(
          sharedIds
            .filter((id) => titleMap.has(id))
            .map((id) => toSharedTitle(titleMap.get(id)!))
        );
        setFriendOnlyTitles(
          friendOnlyIds
            .filter((id) => titleMap.has(id))
            .slice(0, 20)
            .map((id) => toSharedTitle(titleMap.get(id)!))
        );
      }
      setLoading(false);
    }

    load();
  }, [user, friendId]);

  return { titles, friendOnlyTitles, loading };
}
