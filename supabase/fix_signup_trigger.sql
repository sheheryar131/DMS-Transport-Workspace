-- Makes profile-creation fully defensive: if anything unexpected goes wrong
-- while creating the profiles row, the actual auth.users account still gets
-- created successfully (a "database error" during signup/user-creation is
-- Supabase's generic wrapper around a trigger failing — this stops that
-- from ever blocking account creation itself).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  begin
    insert into public.profiles (id, first_name, last_name, approved)
    values (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      (select count(*) from auth.users) = 1
    )
    on conflict (id) do nothing;
  exception when others then
    -- Swallow any error here; the auth user still gets created either way.
    null;
  end;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
