create table if not exists notification_settings (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null default 'vehicle_expiry',
  threshold_days int[] not null default '{30,14}',
  recipient_email text not null default 'transport@dmscare.com.au',
  enabled boolean not null default true,
  updated_at timestamptz default now()
);
insert into notification_settings (entity_type, threshold_days, recipient_email, enabled)
  select 'vehicle_expiry', '{30,14}', 'transport@dmscare.com.au', true
  where not exists (select 1 from notification_settings where entity_type = 'vehicle_expiry');

create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  field text not null,
  expiry_date date not null,
  threshold_days int not null,
  sent_at timestamptz default now(),
  unique (vehicle_id, field, threshold_days, expiry_date)
);
alter table notification_settings enable row level security;
alter table notification_log enable row level security;
create policy "anon_full_access" on notification_settings for all using (true) with check (true);
create policy "anon_full_access" on notification_log for all using (true) with check (true);
