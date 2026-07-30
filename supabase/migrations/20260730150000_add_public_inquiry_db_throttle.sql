-- APEX-1 H-1/H-2: submit_public_inquiry is callable by anon directly via
-- PostgREST, bypassing application-level rate limiting, the honeypot field,
-- and payload validation. Enforce validation and throttling inside the
-- database so every path is covered, giving the app-level limiter a durable
-- backstop that works across serverless instances and cold starts.

begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table if not exists private.inquiry_submission_throttle (
  bucket text primary key,
  window_started_at timestamptz not null,
  submission_count integer not null
);

revoke all on table private.inquiry_submission_throttle
from public, anon, authenticated;

create or replace function private.check_inquiry_throttle(p_phone text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  now_ts timestamptz := pg_catalog.now();
  window_length constant interval := interval '1 hour';
  global_limit constant integer := 120;
  phone_limit constant integer := 5;
  current_count integer;
begin
  -- Opportunistically clear stale per-phone buckets to keep the table small.
  delete from private.inquiry_submission_throttle
  where bucket like 'phone:%'
    and window_started_at < now_ts - (window_length * 2);

  -- Global fixed window: caps total anonymous submissions per hour.
  insert into private.inquiry_submission_throttle as t (
    bucket, window_started_at, submission_count
  )
  values ('global', now_ts, 1)
  on conflict (bucket) do update
  set
    submission_count = case
      when t.window_started_at < now_ts - window_length then 1
      else t.submission_count + 1
    end,
    window_started_at = case
      when t.window_started_at < now_ts - window_length then now_ts
      else t.window_started_at
    end
  returning t.submission_count into current_count;

  if current_count > global_limit then
    return false;
  end if;

  -- Per-phone fixed window: caps repeat submissions from one number.
  insert into private.inquiry_submission_throttle as t (
    bucket, window_started_at, submission_count
  )
  values ('phone:' || p_phone, now_ts, 1)
  on conflict (bucket) do update
  set
    submission_count = case
      when t.window_started_at < now_ts - window_length then 1
      else t.submission_count + 1
    end,
    window_started_at = case
      when t.window_started_at < now_ts - window_length then now_ts
      else t.window_started_at
    end
  returning t.submission_count into current_count;

  return current_count <= phone_limit;
end;
$$;

revoke all
on function private.check_inquiry_throttle(text)
from public, anon, authenticated;

create or replace function public.submit_public_inquiry(
  p_full_name text,
  p_phone text,
  p_service_category text,
  p_service_detail text default null,
  p_region text default null,
  p_notes text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_reference_code text;
  normalized_full_name text;
  normalized_phone text;
  normalized_detail text;
  normalized_region text;
  normalized_notes text;
begin
  normalized_full_name := pg_catalog.btrim(coalesce(p_full_name, ''));
  normalized_phone := pg_catalog.btrim(coalesce(p_phone, ''));
  normalized_detail := nullif(pg_catalog.btrim(coalesce(p_service_detail, '')), '');
  normalized_region := nullif(pg_catalog.btrim(coalesce(p_region, '')), '');
  normalized_notes := nullif(pg_catalog.btrim(coalesce(p_notes, '')), '');

  -- Mirror the application-level validation contract so direct RPC calls
  -- cannot store payloads the website form would reject.
  if pg_catalog.char_length(normalized_full_name) not between 2 and 120
    or normalized_phone !~ '^\+[0-9]{8,15}$'
    or p_service_category is null
    or p_service_category not in (
      'dokumen-kendaraan',
      'perizinan-bangunan',
      'legalitas-teknis'
    )
    or (
      normalized_detail is not null
      and pg_catalog.char_length(normalized_detail) > 160
    )
    or (
      normalized_region is not null
      and pg_catalog.char_length(normalized_region) > 120
    )
    or (
      normalized_notes is not null
      and pg_catalog.char_length(normalized_notes) > 2000
    )
  then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry payload';
  end if;

  if not private.check_inquiry_throttle(normalized_phone) then
    raise exception using
      errcode = '54000',
      message = 'Inquiry submission rate limit exceeded';
  end if;

  insert into public.inquiries (
    full_name,
    phone,
    service_category,
    service_detail,
    region,
    notes,
    status,
    source,
    handled_note
  )
  values (
    normalized_full_name,
    normalized_phone,
    p_service_category,
    normalized_detail,
    normalized_region,
    normalized_notes,
    'baru',
    'website-form',
    null
  )
  returning inquiries.reference_code
  into generated_reference_code;

  return generated_reference_code;
end;
$$;

revoke all
on function public.submit_public_inquiry(text, text, text, text, text, text)
from public, anon, authenticated;

grant execute
on function public.submit_public_inquiry(text, text, text, text, text, text)
to anon;

commit;
