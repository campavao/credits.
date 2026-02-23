// Supabase Edge Function: push
// Triggered by DB webhook on friendships INSERT
// Sends Expo push notification to addressee

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    requester_id: string;
    addressee_id: string;
    status: string;
    created_at: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== 'INSERT' || payload.table !== 'friendships') {
      return new Response('Ignored', { status: 200 });
    }

    const { requester_id, addressee_id } = payload.record;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get requester name
    const { data: requester } = await supabase
      .from('users')
      .select('display_name, username')
      .eq('id', requester_id)
      .single();

    const requesterName = requester?.display_name || requester?.username || 'Someone';

    // Get addressee push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', addressee_id);

    if (!tokens || tokens.length === 0) {
      return new Response('No push tokens', { status: 200 });
    }

    // Send Expo push notifications
    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title: 'New Friend Request',
      body: `${requesterName} wants to be friends on credits.`,
      data: { type: 'friend_request', friendshipId: payload.record.id },
    }));

    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const pushResult = await pushRes.json();

    return new Response(
      JSON.stringify({ success: true, result: pushResult }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
