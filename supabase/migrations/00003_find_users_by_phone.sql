-- Index on users.phone for contact lookup performance
create index if not exists idx_users_phone on public.users (phone) where phone is not null;

-- RPC: find existing users by phone numbers, excluding self and existing friendships
create or replace function public.find_users_by_phone(phone_numbers text[])
returns table (
  id uuid,
  display_name text,
  username text,
  avatar_url text,
  phone text
)
language sql
security definer
set search_path = public
as $$
  select u.id, u.display_name, u.username, u.avatar_url, u.phone
  from users u
  where u.phone = any(phone_numbers)
    and u.id != auth.uid()
    and not exists (
      select 1 from friendships f
      where (f.requester_id = auth.uid() and f.addressee_id = u.id)
         or (f.requester_id = u.id and f.addressee_id = auth.uid())
    );
$$;
