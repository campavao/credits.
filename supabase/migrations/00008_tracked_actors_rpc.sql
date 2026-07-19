-- Server-side aggregation for the "Most Watched Actor" / tracked-actors list.
--
-- Previously the client (useTrackedActors) fetched raw rows and grouped them in
-- JS. That path silently truncated the data twice: it only looked at the first
-- 200 seen titles (`titleIds.slice(0, 200)`) and the un-limited appearances
-- select hit PostgREST's default 1000-row cap. For anyone with a sizeable
-- history that undercounted every actor and scrambled the ranking, so the top
-- actor and its count were both wrong. Doing the GROUP BY in SQL removes both
-- limits and only ships the final top-N rows to the client.
CREATE OR REPLACE FUNCTION public.get_tracked_actors(
  user_id_input uuid,
  lim integer DEFAULT 10
)
RETURNS TABLE(
  id integer,
  name text,
  profile_path text,
  seen_count bigint,
  movie_count bigint,
  tv_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH watched AS (
    SELECT s.title_id, t.media_type
    FROM seen_titles s
    JOIN titles t ON t.id = s.title_id
    WHERE s.user_id = user_id_input
  )
  SELECT
    ac.id,
    ac.name,
    ac.profile_path,
    count(*)::bigint AS seen_count,
    count(*) FILTER (WHERE w.media_type = 'movie')::bigint AS movie_count,
    count(*) FILTER (WHERE w.media_type = 'tv')::bigint AS tv_count
  FROM appearances a
  JOIN watched w ON w.title_id = a.title_id
  JOIN actors ac ON ac.id = a.actor_id
  GROUP BY ac.id, ac.name, ac.profile_path
  ORDER BY seen_count DESC, ac.name
  LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
