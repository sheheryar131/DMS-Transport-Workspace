-- Backfills structured columns from already-stored raw payload for rows that
-- were inserted before the webhook correctly recognized this form's field
-- naming convention (camelCase, e.g. "fullName" / "silLocation") rather than
-- the opaque naming used by the Transport forms ("typeA" / "typeA63").
-- Only fills columns that are currently blank — never overwrites existing data.

-- Orientation
update orientation_checklists
set participant_name = coalesce(nullif(participant_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'fullname' limit 1))
where participant_name is null or participant_name = '';

update orientation_checklists
set support_worker_name = coalesce(nullif(support_worker_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'supportworker' limit 1))
where support_worker_name is null or support_worker_name = '';

update orientation_checklists
set trainer_name = coalesce(nullif(trainer_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'trainer' limit 1))
where trainer_name is null or trainer_name = '';

update orientation_checklists
set sil_location = coalesce(nullif(sil_location,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'sillocation' limit 1))
where sil_location is null or sil_location = '';

-- First Aid
update first_aid_checks
set full_name = coalesce(nullif(full_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'fullname' limit 1))
where full_name is null or full_name = '';

update first_aid_checks
set sil_location = coalesce(nullif(sil_location,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'sillocation' limit 1))
where sil_location is null or sil_location = '';

update first_aid_checks
set items_used = coalesce(nullif(items_used,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'stock' limit 1))
where items_used is null or items_used = '';

-- SIL / Office Maintenance
update sil_maintenance_checks
set sil_location = coalesce(nullif(sil_location,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'sillocation' limit 1))
where sil_location is null or sil_location = '';

update sil_maintenance_checks
set support_worker_name = coalesce(nullif(support_worker_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'supportworker' limit 1))
where support_worker_name is null or support_worker_name = '';

-- SIL Visitor
update sil_visitor_checkins
set visitor_name = coalesce(nullif(visitor_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'fullname' limit 1))
where visitor_name is null or visitor_name = '';

update sil_visitor_checkins
set sil_location = coalesce(nullif(sil_location,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'sillocation' limit 1))
where sil_location is null or sil_location = '';

update sil_visitor_checkins
set support_worker_name = coalesce(nullif(support_worker_name,''), (
  select payload->>k from jsonb_object_keys(payload) as k
  where lower(regexp_replace(k, '^q[0-9]+_', '')) = 'supportworker' limit 1))
where support_worker_name is null or support_worker_name = '';
