create table if not exists public.jotform_form_schemas (form_id text primary key, questions jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
alter table public.jotform_form_schemas enable row level security;
drop policy if exists schemas_read on public.jotform_form_schemas;
create policy schemas_read on public.jotform_form_schemas for select to authenticated using (true);
grant select on public.jotform_form_schemas to authenticated;
