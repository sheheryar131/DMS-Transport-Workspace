create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'new_signup' | 'vehicle_expiry' | 'incident'
  title text not null,
  body text,
  related_id text,
  read_at timestamptz,
  cleared boolean not null default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='authenticated_full_access') then
    create policy "authenticated_full_access" on notifications for all using (auth.uid() is not null) with check (auth.uid() is not null);
  end if;
end $$;
