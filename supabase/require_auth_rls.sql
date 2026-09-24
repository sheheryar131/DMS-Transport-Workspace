-- Tightens every table from fully-open (anon) access to "must be logged in".
-- The Jotform webhook uses the SERVICE ROLE key, which always bypasses RLS,
-- so this does not affect form ingestion in any way — only the workspace UI,
-- which now requires a real logged-in session to read or write anything.

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
      execute format('drop policy if exists "anon_full_access" on public.%I', t);
      execute format('create policy "authenticated_full_access" on public.%I for all using (auth.uid() is not null) with check (auth.uid() is not null)', t);
    end if;
  end loop;
end $$;

-- Same tightening for the documents storage bucket (Fleet/ASTP file uploads).
drop policy if exists "documents_anon_all" on storage.objects;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and schemaname='storage' and policyname='documents_authenticated_all') then
    create policy "documents_authenticated_all" on storage.objects for all
      using (bucket_id = 'documents' and auth.uid() is not null)
      with check (bucket_id = 'documents' and auth.uid() is not null);
  end if;
end $$;
