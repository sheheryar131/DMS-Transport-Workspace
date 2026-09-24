-- Profile data (first/last name, avatar) linked 1:1 to Supabase Auth users.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_select_authenticated') then
    create policy "profiles_select_authenticated" on profiles for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_update_own') then
    create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='profiles_insert_own') then
    create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
  end if;
end $$;

-- Auto-create a profile row the moment someone signs up, using the
-- first_name/last_name passed in at signup time.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Hard cap of 5 total accounts. Fires BEFORE the row is inserted, so going
-- over the limit blocks the signup entirely (and the profile-creation
-- trigger above never runs for the rejected attempt).
create or replace function public.enforce_user_limit()
returns trigger as $$
begin
  if (select count(*) from auth.users) >= 5 then
    raise exception 'DMS Workspace is limited to 5 users. Contact your administrator to free up a seat.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists enforce_user_limit_trigger on auth.users;
create trigger enforce_user_limit_trigger
  before insert on auth.users
  for each row execute function public.enforce_user_limit();

-- Storage bucket for profile pictures.
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
on conflict (id) do update set public = true;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and schemaname='storage' and policyname='avatars_authenticated_all') then
    create policy "avatars_authenticated_all" on storage.objects for all
      using (bucket_id = 'avatars' and auth.uid() is not null)
      with check (bucket_id = 'avatars' and auth.uid() is not null);
  end if;
end $$;
