insert into storage.buckets (id, name, public) values ('documents','documents', true)
on conflict (id) do update set public = true;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='objects' and schemaname='storage' and policyname='documents_anon_all') then
    create policy "documents_anon_all" on storage.objects for all
      using (bucket_id = 'documents') with check (bucket_id = 'documents');
  end if;
end $$;
