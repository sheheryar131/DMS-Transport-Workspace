create table if not exists feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  source_form_id text, source_submission_id text unique,
  type text, respondent_role text,
  overall_satisfaction text, communication_rating text, training_rating text,
  policy_clarity_rating text, support_rating text, recommend_rating text,
  improvement_suggestions text,
  name text, email text, phone text, submitted_date date,
  payload jsonb not null default '{}'::jsonb, extra jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists medication_checks (
  id uuid primary key default gen_random_uuid(),
  source_form_id text, source_submission_id text unique,
  participant_name text, participant_dob date, medication_name text,
  script_received_dr text, script_given_to_pharmacy text, dose text, frequency text,
  correct_on_pickup text, special_instructions text,
  pack_start_date date, pack_end_date date, comments text, pickup_date date,
  staff_signature_url text,
  payload jsonb not null default '{}'::jsonb, extra jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists maintenance_register (
  id uuid primary key default gen_random_uuid(),
  source_form_id text, source_submission_id text unique,
  responsible_person text, date_identified date, area_asset text,
  issue_identified text, risk_level text, temp_risk_control text,
  action_taken text, date_completed date, office_address text, signature_url text,
  payload jsonb not null default '{}'::jsonb, extra jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table feedback_submissions enable row level security;
alter table medication_checks enable row level security;
alter table maintenance_register enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='feedback_submissions' and policyname='anon_full_access') then
    create policy "anon_full_access" on feedback_submissions for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='medication_checks' and policyname='anon_full_access') then
    create policy "anon_full_access" on medication_checks for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='maintenance_register' and policyname='anon_full_access') then
    create policy "anon_full_access" on maintenance_register for all using (true) with check (true);
  end if;
end $$;
