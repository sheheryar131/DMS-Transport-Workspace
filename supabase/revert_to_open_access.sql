-- Reverts every table back to fully-open (no login required) access,
-- undoing require_auth_rls.sql while we pause on the authentication feature.
do $$
declare
  t text;
  tables text[] := array[
    'bookings','staff','vehicles','vehicle_checks','transfer_logs','incidents',
    'stock_items','astp_compliance','orientation_checklists','sil_maintenance_checks',
    'first_aid_checks','sil_visitor_checkins','notification_settings','notification_log',
    'support_workers','sil_archive','feedback_submissions','medication_checks',
    'maintenance_register','jotform_submissions'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.'||t) is not null then
      execute format('drop policy if exists "authenticated_full_access" on public.%I', t);
      execute format('drop policy if exists "anon_full_access" on public.%I', t);
      execute format('create policy "anon_full_access" on public.%I for all using (true) with check (true)', t);
    end if;
  end loop;
end $$;

drop policy if exists "documents_authenticated_all" on storage.objects;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and schemaname='storage' and policyname='documents_anon_all') then
    create policy "documents_anon_all" on storage.objects for all
      using (bucket_id = 'documents') with check (bucket_id = 'documents');
  end if;
end $$;
