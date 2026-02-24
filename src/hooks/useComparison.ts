import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

interface OverlapScore {
  shared_count: number;
  total_unique: number;
  score: number;
}

interface ActorComparison {
  total_titles: number;
  user_a_seen: number;
  user_b_seen: number;
}

interface ComparisonStats {
  user_a_count: number;
  user_b_count: number;
  shared_count: number;
  overlap_pct: number;
}

interface SharedActorComparison {
  actor_id: number;
  actor_name: string;
  profile_path: string | null;
  user_a_seen: number;
  user_b_seen: number;
  total_titles: number;
}

export function useComparison() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getOverlapScore = async (friendId: string): Promise<OverlapScore | null> => {
    if (!user) return null;
    setLoading(true);
    const { data, error } = await supabase.rpc('get_overlap_score', {
      user_a: user.id,
      user_b: friendId,
    });
    setLoading(false);
    if (error || !data) return null;
    return data[0] || null;
  };

  const getActorComparison = async (
    actorId: number,
    friendId: string
  ): Promise<ActorComparison | null> => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('get_actor_comparison', {
      actor_id_input: actorId,
      user_a: user.id,
      user_b: friendId,
    });
    if (error || !data) return null;
    return data[0] || null;
  };

  const getSharedActors = async (friendId: string) => {
    if (!user) return [];

    // Get actors both users have seen titles from
    const { data: myActors } = await supabase
      .from('seen_titles')
      .select('title_id')
      .eq('user_id', user.id);

    const { data: friendActors } = await supabase
      .from('seen_titles')
      .select('title_id')
      .eq('user_id', friendId);

    if (!myActors || !friendActors) return [];

    const myTitleIds = new Set(myActors.map((s) => s.title_id));
    const friendTitleIds = new Set(friendActors.map((s) => s.title_id));

    // Get actors from shared titles
    const allTitleIds = [...new Set([...myTitleIds, ...friendTitleIds])];
    if (allTitleIds.length === 0) return [];

    const { data: appearances } = await supabase
      .from('appearances')
      .select('actor_id, title_id, actors(id, name, profile_path)')
      .in('title_id', allTitleIds.slice(0, 100)); // limit for performance

    return appearances || [];
  };

  const getComparisonStats = async (friendId: string): Promise<ComparisonStats | null> => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('get_friend_comparison_stats', {
      user_a: user.id,
      user_b: friendId,
    });
    if (error || !data) return null;
    return data[0] || null;
  };

  const getSharedActorsComparison = async (friendId: string): Promise<SharedActorComparison[]> => {
    if (!user) return [];
    const { data, error } = await supabase.rpc('get_shared_actors_with_comparison', {
      user_a: user.id,
      user_b: friendId,
    });
    if (error || !data) return [];
    return data;
  };

  return { getOverlapScore, getActorComparison, getSharedActors, getComparisonStats, getSharedActorsComparison, loading };
}
