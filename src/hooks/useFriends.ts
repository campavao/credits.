import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import type { User, Friendship } from '../types/database';

interface FriendWithProfile extends Friendship {
  friend: User;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pending, setPending] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!friendships) {
      setLoading(false);
      return;
    }

    // Get all friend user IDs
    const friendIds = friendships.map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );

    const { data: profiles } = await supabase
      .from('users')
      .select('*')
      .in('id', friendIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const mapped = friendships.map((f) => ({
      ...f,
      friend: profileMap.get(
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      )!,
    })).filter((f) => f.friend);

    setFriends(mapped.filter((f) => f.status === 'accepted'));
    setPending(mapped.filter(
      (f) => f.status === 'pending' && f.addressee_id === user.id
    ));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const searchUsers = async (query: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .ilike('username', `%${query}%`)
      .neq('id', user?.id || '')
      .limit(20);
    return data || [];
  };

  const sendRequest = async (addresseeId: string) => {
    if (!user) return;
    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: addresseeId,
    });
    if (error) throw error;
    await fetchFriends();
  };

  const acceptRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    if (error) throw error;
    await fetchFriends();
  };

  const declineRequest = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) throw error;
    await fetchFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) throw error;
    await fetchFriends();
  };

  return {
    friends,
    pending,
    loading,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    refresh: fetchFriends,
  };
}
