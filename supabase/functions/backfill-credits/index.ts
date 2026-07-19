// Supabase Edge Function: backfill-credits
//
// One-off/maintenance backfill for the top-20 -> top-50 cast expansion
// (migration 00009). fetch-credits only runs on new seen_titles and early-
// returns when a title's credits were already fetched, so existing titles keep
// their old top-20 cast. This re-fetches a batch of titles from TMDB and
// upserts the wider cast + appearances.
//
// Invoke with a JSON body { "limit": 200, "offset": 0 }. It processes titles
// ordered by id and returns { processed, upserted, failed, next_offset, done }
// so the caller can page through all titles by feeding next_offset back in.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const MAX_CAST = 50;
const CONCURRENCY = 8;

interface TitleRow {
  id: number;
  media_type: 'movie' | 'tv';
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 200, 1), 500);
    const offset = Math.max(Number(body.offset) || 0, 0);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY')!;

    const { data: titles, error } = await supabase
      .from('titles')
      .select('id, media_type')
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return json({ error: error.message }, 500);
    }
    if (!titles || titles.length === 0) {
      return json({ processed: 0, upserted: 0, failed: 0, next_offset: offset, done: true });
    }

    let upserted = 0;
    let failed = 0;

    // Process in small concurrent chunks to stay within the time budget while
    // being gentle on the TMDB rate limit.
    for (let i = 0; i < titles.length; i += CONCURRENCY) {
      const chunk = titles.slice(i, i + CONCURRENCY) as TitleRow[];
      const results = await Promise.all(
        chunk.map((t) => backfillOne(supabase, tmdbApiKey, t))
      );
      for (const ok of results) ok ? upserted++ : failed++;
    }

    const done = titles.length < limit;
    return json({
      processed: titles.length,
      upserted,
      failed,
      next_offset: offset + titles.length,
      done,
    });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

async function backfillOne(
  supabase: any,
  tmdbApiKey: string,
  title: TitleRow
): Promise<boolean> {
  try {
    const endpoint = title.media_type === 'tv' ? 'aggregate_credits' : 'credits';
    const url = `${TMDB_BASE}/${title.media_type}/${title.id}/${endpoint}?api_key=${tmdbApiKey}`;
    const res = await fetch(url);
    if (!res.ok) return false;

    const credits = await res.json();
    const rawCast = (credits.cast ?? []).slice(0, MAX_CAST);
    const topCast = title.media_type === 'tv'
      ? rawCast.map((c: any) => ({
          id: c.id,
          name: c.name,
          profile_path: c.profile_path,
          character: c.roles?.[0]?.character || null,
        }))
      : rawCast;

    if (topCast.length === 0) {
      await supabase
        .from('titles')
        .update({ credits_fetched_at: new Date().toISOString() })
        .eq('id', title.id);
      return true;
    }

    const actors = topCast.map((c: any) => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path,
    }));
    await supabase.from('actors').upsert(actors, { onConflict: 'id' });

    const appearances = topCast.map((c: any, index: number) => ({
      actor_id: c.id,
      title_id: title.id,
      character: c.character || null,
      billing_order: index,
    }));
    await supabase
      .from('appearances')
      .upsert(appearances, { onConflict: 'actor_id,title_id' });

    await supabase
      .from('titles')
      .update({ credits_fetched_at: new Date().toISOString() })
      .eq('id', title.id);

    return true;
  } catch {
    return false;
  }
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
