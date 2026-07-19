-- Widen the cast we store per title from the top 20 billed to the top 50.
--
-- "Most Watched Actor" / "Your Crew" (get_tracked_actors, get_user_stats) count
-- an actor only for seen titles where that actor is in the stored `appearances`
-- rows. fetch-credits previously stored just the top 20 billed cast, so an actor
-- billed lower — early-career roles, big ensembles, recurring TV — didn't count
-- toward them, even though the actor's own profile page (which intersects their
-- full TMDB filmography) did. That made heavily-watched actors undercounted or
-- missing from Crew (e.g. Jennifer Lawrence in Medium).
--
-- Raising the cap to 50 (see MAX_CAST in fetch-credits) captures those lower-
-- billed appearances. Relax the billing_order check to match; a backfill re-
-- fetches existing titles so their cast 20–49 is filled in too.
ALTER TABLE public.appearances DROP CONSTRAINT appearances_billing_order_check;
ALTER TABLE public.appearances ADD CONSTRAINT appearances_billing_order_check
  CHECK (billing_order >= 0 AND billing_order < 50);
