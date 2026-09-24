alter table profiles add column if not exists approved boolean not null default false;

-- The very first person to ever sign up is auto-approved (they're the one
-- setting this system up). Everyone after that starts unapproved.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, approved)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (select count(*) from auth.users) = 1
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Update RLS: unapproved users can only see/edit their own row (so they can
-- check their own pending status); approved users can see everyone and
-- approve others.
drop policy if exists "profiles_select_authenticated" on profiles;
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select using (
  auth.uid() = id or exists(select 1 from profiles p where p.id = auth.uid() and p.approved = true)
);

drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles for update using (
  auth.uid() = id or exists(select 1 from profiles p where p.id = auth.uid() and p.approved = true)
) with check (
  auth.uid() = id or exists(select 1 from profiles p where p.id = auth.uid() and p.approved = true)
);

-- Safety net: even though the policy above lets someone update their own
-- row, this trigger blocks an unapproved user from flipping their OWN
-- approved flag to true themselves — only an already-approved user can
-- approve someone (including, technically, themselves, which is harmless).
create or replace function public.prevent_self_approval()
returns trigger as $$
begin
  if new.approved is distinct from old.approved and auth.uid() = old.id then
    if not exists (select 1 from profiles where id = auth.uid() and approved = true) then
      new.approved := old.approved;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists prevent_self_approval_trigger on profiles;
create trigger prevent_self_approval_trigger
  before update on profiles
  for each row execute function public.prevent_self_approval();
