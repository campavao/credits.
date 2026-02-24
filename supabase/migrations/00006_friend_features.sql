-- Friend comparison stats (per-user counts + overlap)
CREATE OR REPLACE FUNCTION public.get_friend_comparison_stats(user_a uuid, user_b uuid)
RETURNS TABLE(user_a_count bigint, user_b_count bigint, shared_count bigint, overlap_pct numeric) AS $$
BEGIN
  RETURN QUERY
  WITH a_titles AS (SELECT title_id FROM seen_titles WHERE user_id = user_a),
       b_titles AS (SELECT title_id FROM seen_titles WHERE user_id = user_b),
       shared AS (SELECT title_id FROM a_titles INTERSECT SELECT title_id FROM b_titles),
       combined AS (SELECT title_id FROM a_titles UNION SELECT title_id FROM b_titles)
  SELECT
    (SELECT count(*) FROM a_titles)::bigint,
    (SELECT count(*) FROM b_titles)::bigint,
    (SELECT count(*) FROM shared)::bigint,
    CASE
      WHEN (SELECT count(*) FROM combined) = 0 THEN 0
      ELSE ROUND((SELECT count(*) FROM shared)::numeric / (SELECT count(*) FROM combined)::numeric * 100, 1)
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Shared actors with per-user seen counts
CREATE OR REPLACE FUNCTION public.get_shared_actors_with_comparison(user_a uuid, user_b uuid, lim int DEFAULT 10)
RETURNS TABLE(actor_id integer, actor_name text, profile_path text, user_a_seen bigint, user_b_seen bigint, total_titles bigint) AS $$
BEGIN
  RETURN QUERY
  WITH a_seen AS (SELECT title_id FROM seen_titles WHERE user_id = user_a),
       b_seen AS (SELECT title_id FROM seen_titles WHERE user_id = user_b),
       actor_stats AS (
         SELECT
           ap.actor_id AS aid,
           ac.name AS aname,
           ac.profile_path AS apath,
           count(*) FILTER (WHERE a.title_id IS NOT NULL) AS a_count,
           count(*) FILTER (WHERE b.title_id IS NOT NULL) AS b_count,
           count(DISTINCT ap.title_id) AS total
         FROM appearances ap
         JOIN actors ac ON ac.id = ap.actor_id
         LEFT JOIN a_seen a ON a.title_id = ap.title_id
         LEFT JOIN b_seen b ON b.title_id = ap.title_id
         GROUP BY ap.actor_id, ac.name, ac.profile_path
         HAVING count(*) FILTER (WHERE a.title_id IS NOT NULL) > 0
            AND count(*) FILTER (WHERE b.title_id IS NOT NULL) > 0
       )
  SELECT
    s.aid,
    s.aname,
    s.apath,
    s.a_count::bigint,
    s.b_count::bigint,
    s.total::bigint
  FROM actor_stats s
  ORDER BY (s.a_count + s.b_count) DESC
  LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Friends' recent watch activity
CREATE OR REPLACE FUNCTION public.get_friends_recent_activity(user_id_input uuid, lim int DEFAULT 20)
RETURNS TABLE(friend_id uuid, friend_name text, friend_username text, title_id integer, title_name text, poster_path text, media_type text, watched_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    COALESCE(u.display_name, u.username, 'User'),
    u.username,
    t.id,
    t.title,
    t.poster_path,
    t.media_type,
    st.watched_at
  FROM seen_titles st
  JOIN friendships f ON f.status = 'accepted'
    AND (
      (f.requester_id = user_id_input AND f.addressee_id = st.user_id)
      OR (f.addressee_id = user_id_input AND f.requester_id = st.user_id)
    )
  JOIN users u ON u.id = st.user_id
  JOIN titles t ON t.id = st.title_id
  ORDER BY st.watched_at DESC
  LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
