begin;

create extension if not exists pg_cron with schema pg_catalog;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table private.inquiry_retention_policy (
  id boolean primary key default true
    constraint inquiry_retention_policy_singleton
    check (id),
  retention_months smallint not null
    constraint inquiry_retention_policy_months_valid
    check (retention_months between 1 and 120),
  updated_at timestamptz not null default now()
);

comment on table private.inquiry_retention_policy is
  'Satu sumber konfigurasi masa retensi inquiry sebelum penghapusan permanen.';

insert into private.inquiry_retention_policy (id, retention_months)
values (true, 12)
on conflict (id) do nothing;

create or replace function private.purge_expired_inquiries()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  retention_months_value integer;
  deleted_count integer;
begin
  select retention_months
  into retention_months_value
  from private.inquiry_retention_policy
  where id = true;

  if retention_months_value is null then
    raise exception 'Inquiry retention policy is not configured';
  end if;

  delete from public.inquiries
  where created_at < (
    now() - make_interval(months => retention_months_value)
  );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all
on function private.purge_expired_inquiries()
from public, anon, authenticated;

grant execute
on function private.purge_expired_inquiries()
to service_role;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'purge-expired-inquiries-daily';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'purge-expired-inquiries-daily',
    '30 2 * * *',
    'select private.purge_expired_inquiries();'
  );
end;
$$;

commit;
