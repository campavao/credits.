-- Watchlist (titles a user wants to watch but hasn't seen yet)
CREATE TABLE public.watchlist (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title_id integer REFERENCES titles(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, title_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_title ON watchlist(title_id);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Watchlist: own read/write/delete + friends can read (mirrors seen_titles)
CREATE POLICY "Users can read own watchlist" ON public.watchlist
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = watchlist.user_id)
        OR (addressee_id = auth.uid() AND requester_id = watchlist.user_id)
      )
    )
  );

CREATE POLICY "Users can insert own watchlist" ON public.watchlist
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own watchlist" ON public.watchlist
  FOR DELETE TO authenticated USING (user_id = auth.uid());
