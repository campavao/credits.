-- Drop old function (return type changed, can't use CREATE OR REPLACE)
DROP FUNCTION IF EXISTS public.get_user_stats(uuid);

-- Recreate with profile_path in return, sort by seen count instead of pct
CREATE FUNCTION public.get_user_stats(user_id_input uuid)
RETURNS TABLE(
  total_watched bigint,
  unique_actors bigint,
  most_completed_actor_id integer,
  most_completed_actor_name text,
  most_completed_actor_profile_path text,
  most_completed_pct numeric,
  friends_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH watched AS (
    SELECT title_id FROM seen_titles WHERE user_id = user_id_input
  ),
  actor_stats AS (
    SELECT
      a.actor_id,
      ac.name,
      ac.profile_path,
      count(*) AS total,
      count(*) FILTER (WHERE w.title_id IS NOT NULL) AS seen,
      ROUND(count(*) FILTER (WHERE w.title_id IS NOT NULL)::numeric / GREATEST(count(*), 1) * 100, 1) AS pct
    FROM appearances a
    JOIN actors ac ON ac.id = a.actor_id
    LEFT JOIN watched w ON w.title_id = a.title_id
    GROUP BY a.actor_id, ac.name, ac.profile_path
    HAVING count(*) FILTER (WHERE w.title_id IS NOT NULL) > 0
    ORDER BY seen DESC, pct DESC
    LIMIT 1
  )
  SELECT
    (SELECT count(*) FROM watched)::bigint,
    (SELECT count(DISTINCT a.actor_id) FROM appearances a JOIN watched w ON w.title_id = a.title_id)::bigint,
    (SELECT as2.actor_id FROM actor_stats as2 LIMIT 1),
    (SELECT as2.name FROM actor_stats as2 LIMIT 1),
    (SELECT as2.profile_path FROM actor_stats as2 LIMIT 1),
    COALESCE((SELECT as2.pct FROM actor_stats as2 LIMIT 1), 0),
    (SELECT count(*) FROM friendships
     WHERE status = 'accepted'
     AND (requester_id = user_id_input OR addressee_id = user_id_input))::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
