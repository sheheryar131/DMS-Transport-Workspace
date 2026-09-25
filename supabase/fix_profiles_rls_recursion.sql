create or replace function public.is_approved(uid uuid)
returns boolean as $$
  select exists(select 1 from public.profiles where id = uid and approved = true);
$$ language sql security definer stable set search_path = public;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (
  auth.uid() = id or public.is_approved(auth.uid())
);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (
  auth.uid() = id or public.is_approved(auth.uid())
) with check (
  auth.uid() = id or public.is_approved(auth.uid())
);
