-- Add avatar_actor_ids column to store user-selected actor IDs for profile mosaic
alter table public.users
  add column if not exists avatar_actor_ids integer[] default '{}';
