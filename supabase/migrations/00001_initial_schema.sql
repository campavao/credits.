-- Users table (synced from auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Titles (TMDB cache)
CREATE TABLE public.titles (
  id integer PRIMARY KEY,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title text NOT NULL,
  poster_path text,
  release_year integer,
  credits_fetched_at timestamptz,
  cached_at timestamptz DEFAULT now()
);

-- Actors (TMDB cache)
CREATE TABLE public.actors (
  id integer PRIMARY KEY,
  name text NOT NULL,
  profile_path text,
  cached_at timestamptz DEFAULT now()
);

-- Appearances (actor <-> title)
CREATE TABLE public.appearances (
  actor_id integer REFERENCES actors(id) ON DELETE CASCADE,
  title_id integer REFERENCES titles(id) ON DELETE CASCADE,
  character text,
  billing_order integer CHECK (billing_order >= 0 AND billing_order < 20),
  PRIMARY KEY (actor_id, title_id)
);

CREATE INDEX idx_appearances_actor ON appearances(actor_id);
CREATE INDEX idx_appearances_title ON appearances(title_id);

-- Seen titles (user watched history)
CREATE TABLE public.seen_titles (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title_id integer REFERENCES titles(id) ON DELETE CASCADE,
  watched_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, title_id)
);

CREATE INDEX idx_seen_titles_user ON seen_titles(user_id);
CREATE INDEX idx_seen_titles_title ON seen_titles(title_id);

-- Friendships
CREATE TABLE public.friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Push tokens
CREATE TABLE public.push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

-------------------------------
-- Row Level Security
-------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seen_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users: read all, update own
CREATE POLICY "Users are viewable by authenticated users" ON public.users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Titles, actors, appearances: read-only for authenticated
CREATE POLICY "Titles readable by authenticated" ON public.titles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Titles insertable by authenticated" ON public.titles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Actors readable by authenticated" ON public.actors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Appearances readable by authenticated" ON public.appearances
  FOR SELECT TO authenticated USING (true);

-- Seen titles: own read/write + friends can read
CREATE POLICY "Users can read own seen titles" ON public.seen_titles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = seen_titles.user_id)
        OR (addressee_id = auth.uid() AND requester_id = seen_titles.user_id)
      )
    )
  );

CREATE POLICY "Users can insert own seen titles" ON public.seen_titles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own seen titles" ON public.seen_titles
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Friendships
CREATE POLICY "Users can see own friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can send friend requests" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Addressee can update friendship" ON public.friendships
  FOR UPDATE TO authenticated USING (addressee_id = auth.uid());

CREATE POLICY "Either party can delete friendship" ON public.friendships
  FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Push tokens: own only
CREATE POLICY "Users manage own push tokens" ON public.push_tokens
  FOR ALL TO authenticated USING (user_id = auth.uid());

-------------------------------
-- RPC Functions
-------------------------------

-- Overlap score between two users
CREATE OR REPLACE FUNCTION public.get_overlap_score(user_a uuid, user_b uuid)
RETURNS TABLE(shared_count bigint, total_unique bigint, score numeric) AS $$
BEGIN
  RETURN QUERY
  WITH a_titles AS (SELECT title_id FROM seen_titles WHERE user_id = user_a),
       b_titles AS (SELECT title_id FROM seen_titles WHERE user_id = user_b),
       shared AS (SELECT title_id FROM a_titles INTERSECT SELECT title_id FROM b_titles),
       combined AS (SELECT title_id FROM a_titles UNION SELECT title_id FROM b_titles)
  SELECT
    (SELECT count(*) FROM shared)::bigint,
    (SELECT count(*) FROM combined)::bigint,
    CASE
      WHEN (SELECT count(*) FROM combined) = 0 THEN 0
      ELSE ROUND((SELECT count(*) FROM shared)::numeric / (SELECT count(*) FROM combined)::numeric * 100, 1)
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actor completion comparison
CREATE OR REPLACE FUNCTION public.get_actor_comparison(actor_id_input integer, user_a uuid, user_b uuid)
RETURNS TABLE(total_titles bigint, user_a_seen bigint, user_b_seen bigint) AS $$
BEGIN
  RETURN QUERY
  WITH actor_titles AS (
    SELECT title_id FROM appearances WHERE actor_id = actor_id_input
  )
  SELECT
    (SELECT count(*) FROM actor_titles)::bigint,
    (SELECT count(*) FROM actor_titles at2
     JOIN seen_titles st ON st.title_id = at2.title_id AND st.user_id = user_a)::bigint,
    (SELECT count(*) FROM actor_titles at3
     JOIN seen_titles st ON st.title_id = at3.title_id AND st.user_id = user_b)::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id_input uuid)
RETURNS TABLE(
  total_watched bigint,
  unique_actors bigint,
  most_completed_actor_id integer,
  most_completed_actor_name text,
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
      count(*) AS total,
      count(*) FILTER (WHERE w.title_id IS NOT NULL) AS seen,
      ROUND(count(*) FILTER (WHERE w.title_id IS NOT NULL)::numeric / GREATEST(count(*), 1) * 100, 1) AS pct
    FROM appearances a
    JOIN actors ac ON ac.id = a.actor_id
    LEFT JOIN watched w ON w.title_id = a.title_id
    GROUP BY a.actor_id, ac.name
    HAVING count(*) FILTER (WHERE w.title_id IS NOT NULL) > 0
    ORDER BY pct DESC, seen DESC
    LIMIT 1
  )
  SELECT
    (SELECT count(*) FROM watched)::bigint,
    (SELECT count(DISTINCT a.actor_id) FROM appearances a JOIN watched w ON w.title_id = a.title_id)::bigint,
    (SELECT as2.actor_id FROM actor_stats as2 LIMIT 1),
    (SELECT as2.name FROM actor_stats as2 LIMIT 1),
    COALESCE((SELECT as2.pct FROM actor_stats as2 LIMIT 1), 0),
    (SELECT count(*) FROM friendships
     WHERE status = 'accepted'
     AND (requester_id = user_id_input OR addressee_id = user_id_input))::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
