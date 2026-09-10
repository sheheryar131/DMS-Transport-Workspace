alter table bookings add column if not exists payload jsonb not null default '{}'::jsonb;
