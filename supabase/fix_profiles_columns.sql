alter table profiles add column if not exists first_name text;
alter table profiles add column if not exists last_name text;
alter table profiles add column if not exists avatar_url text;

-- Backfill a profile row (approved, so you're not stuck again) for every
-- existing account that never got one due to the column mismatch above.
insert into public.profiles (id, first_name, last_name, approved)
select u.id, u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'last_name', true
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
