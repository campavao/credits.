// Supabase Edge Function: fetch-credits
// Triggered by DB webhook on seen_titles INSERT
// Fetches TMDB credits and upserts top 20 actors + appearances

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const MAX_CAST = 20;

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    user_id: string;
    title_id: number;
    watched_at: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== 'INSERT' || payload.table !== 'seen_titles') {
      return new Response('Ignored', { status: 200 });
    }

    const titleId = payload.record.title_id;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const tmdbApiKey = Deno.env.get('TMDB_API_KEY')!;

    // Check if credits already fetched
    const { data: title } = await supabase
      .from('titles')
      .select('media_type, credits_fetched_at')
      .eq('id', titleId)
      .single();

    if (!title) {
      return new Response('Title not found', { status: 404 });
    }

    if (title.credits_fetched_at) {
      return new Response('Credits already fetched', { status: 200 });
    }

    // Fetch credits from TMDB (use aggregate_credits for TV to get full cast)
    const creditsEndpoint = title.media_type === 'tv' ? 'aggregate_credits' : 'credits';
    const creditsUrl = `${TMDB_BASE}/${title.media_type}/${titleId}/${creditsEndpoint}?api_key=${tmdbApiKey}`;
    const creditsRes = await fetch(creditsUrl);

    if (!creditsRes.ok) {
      return new Response(`TMDB error: ${creditsRes.status}`, { status: 500 });
    }

    const credits = await creditsRes.json();
    // aggregate_credits nests roles differently — normalize to same shape
    const rawCast = credits.cast.slice(0, MAX_CAST);
    const topCast = title.media_type === 'tv'
      ? rawCast.map((c: any) => ({
          id: c.id,
          name: c.name,
          profile_path: c.profile_path,
          character: c.roles?.[0]?.character || null,
        }))
      : rawCast;

    if (topCast.length === 0) {
      // Mark as fetched even if no cast
      await supabase
        .from('titles')
        .update({ credits_fetched_at: new Date().toISOString() })
        .eq('id', titleId);
      return new Response('No cast found', { status: 200 });
    }

    // Upsert actors
    const actors = topCast.map((c: any) => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path,
    }));

    await supabase.from('actors').upsert(actors, { onConflict: 'id' });

    // Upsert appearances
    const appearances = topCast.map((c: any, index: number) => ({
      actor_id: c.id,
      title_id: titleId,
      character: c.character || null,
      billing_order: index,
    }));

    await supabase
      .from('appearances')
      .upsert(appearances, { onConflict: 'actor_id,title_id' });

    // Mark credits as fetched
    await supabase
      .from('titles')
      .update({ credits_fetched_at: new Date().toISOString() })
      .eq('id', titleId);

    return new Response(
      JSON.stringify({ success: true, actors_count: actors.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
