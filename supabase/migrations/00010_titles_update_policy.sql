-- Allow authenticated users to UPDATE the shared titles cache.
--
-- markAsSeen upserts into `titles` to make sure the row exists (and to refresh
-- poster/title/year) before inserting into seen_titles. `titles` only had
-- SELECT + INSERT policies, so for any title already cached the upsert's
-- ON CONFLICT DO UPDATE branch was denied by RLS ("violates row-level security
-- policy (USING expression) for table titles"). That spammed errors on every
-- swipe of an existing title and, in the FK edge case, dropped the swipe.
--
-- titles is a shared TMDB cache (INSERT is already WITH CHECK (true)), so a
-- matching open UPDATE policy keeps the same trust model. credits_fetched_at is
-- never sent in the client payload, so it is preserved across these updates.
CREATE POLICY "Titles updatable by authenticated" ON public.titles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
