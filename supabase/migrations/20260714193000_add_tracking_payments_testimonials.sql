begin;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

alter table public.inquiries
  add column if not exists reference_code text,
  add column if not exists payment_required boolean not null default false,
  add column if not exists payment_amount bigint,
  add column if not exists payment_timing text,
  add column if not exists payment_status text not null default 'belum-diperlukan',
  add column if not exists payment_confirmation_requested_at timestamptz,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists testimonial_eligible_at timestamptz;

create or replace function private.generate_inquiry_reference_code()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select pg_catalog.concat(
    'TS-',
    pg_catalog.to_char(
      pg_catalog.timezone('Asia/Jakarta', pg_catalog.now()),
      'YYMM'
    ),
    '-',
    pg_catalog.upper(
      pg_catalog.substr(
        pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''),
        1,
        10
      )
    )
  );
$$;

revoke all
on function private.generate_inquiry_reference_code()
from public, anon, authenticated;

update public.inquiries
set reference_code = private.generate_inquiry_reference_code()
where reference_code is null;

alter table public.inquiries
  alter column reference_code set not null;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_reference_code_format'
  ) then
    alter table public.inquiries
      add constraint inquiries_reference_code_format
      check (reference_code ~ '^TS-[0-9]{4}-[0-9A-F]{10}$');
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_reference_code_unique'
  ) then
    alter table public.inquiries
      add constraint inquiries_reference_code_unique unique (reference_code);
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_payment_amount_valid'
  ) then
    alter table public.inquiries
      add constraint inquiries_payment_amount_valid
      check (
        payment_amount is null
        or payment_amount between 1 and 1000000000000
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_payment_timing_valid'
  ) then
    alter table public.inquiries
      add constraint inquiries_payment_timing_valid
      check (
        payment_timing is null
        or payment_timing in ('sebelum-proses', 'setelah-selesai')
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_payment_status_valid'
  ) then
    alter table public.inquiries
      add constraint inquiries_payment_status_valid
      check (
        payment_status in (
          'belum-diperlukan',
          'menunggu-pembayaran',
          'menunggu-verifikasi',
          'sudah-dibayar'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_payment_configuration_consistent'
  ) then
    alter table public.inquiries
      add constraint inquiries_payment_configuration_consistent
      check (
        (
          payment_required = false
          and payment_amount is null
          and payment_timing is null
          and payment_status = 'belum-diperlukan'
          and payment_confirmation_requested_at is null
          and payment_verified_at is null
        )
        or
        (
          payment_required = true
          and payment_amount is not null
          and payment_timing is not null
        )
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.inquiries'::pg_catalog.regclass
      and conname = 'inquiries_payment_progress_consistent'
  ) then
    alter table public.inquiries
      add constraint inquiries_payment_progress_consistent
      check (
        (
          payment_status in ('belum-diperlukan', 'menunggu-pembayaran')
          and payment_confirmation_requested_at is null
          and payment_verified_at is null
        )
        or
        (
          payment_status = 'menunggu-verifikasi'
          and payment_confirmation_requested_at is not null
          and payment_verified_at is null
        )
        or
        (
          payment_status = 'sudah-dibayar'
          and payment_verified_at is not null
        )
      );
  end if;
end;
$$;

comment on column public.inquiries.reference_code is
  'Kode akses tracking publik. Bersifat bearer token; tidak menggantikan UUID internal.';

comment on column public.inquiries.payment_confirmation_requested_at is
  'Waktu pelanggan melaporkan transfer. Bukan bukti atau konfirmasi pembayaran otomatis.';

comment on column public.inquiries.payment_verified_at is
  'Waktu admin mengonfirmasi pembayaran secara manual.';

comment on column public.inquiries.testimonial_eligible_at is
  'Keputusan eksplisit admin bahwa inquiry boleh disiapkan sebagai kandidat testimoni.';

create or replace function private.guard_inquiry_reference_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.reference_code := private.generate_inquiry_reference_code();
  elsif new.reference_code is distinct from old.reference_code then
    raise exception using
      errcode = '23514',
      message = 'Inquiry reference code is immutable';
  end if;

  return new;
end;
$$;

revoke all
on function private.guard_inquiry_reference_code()
from public, anon, authenticated;

drop trigger if exists inquiries_guard_reference_code on public.inquiries;

create trigger inquiries_guard_reference_code
before insert or update on public.inquiries
for each row
execute function private.guard_inquiry_reference_code();

create index if not exists inquiries_payment_attention_idx
  on public.inquiries (payment_status, updated_at desc)
  where payment_status in ('menunggu-pembayaran', 'menunggu-verifikasi');

create index if not exists inquiries_testimonial_eligible_idx
  on public.inquiries (testimonial_eligible_at desc)
  where testimonial_eligible_at is not null;

create table if not exists public.payment_settings (
  id boolean primary key default true
    constraint payment_settings_singleton check (id),
  bank_name text
    constraint payment_settings_bank_name_length
    check (
      bank_name is null
      or pg_catalog.char_length(pg_catalog.btrim(bank_name)) between 2 and 80
    ),
  bank_account_number text
    constraint payment_settings_bank_account_number_valid
    check (
      bank_account_number is null
      or (
        pg_catalog.char_length(pg_catalog.btrim(bank_account_number)) between 4 and 64
        and bank_account_number ~ '^[0-9 .-]+$'
      )
    ),
  bank_account_holder text
    constraint payment_settings_bank_account_holder_length
    check (
      bank_account_holder is null
      or pg_catalog.char_length(pg_catalog.btrim(bank_account_holder)) between 2 and 120
    ),
  qris_storage_path text
    constraint payment_settings_qris_storage_path_valid
    check (
      qris_storage_path is null
      or (
        pg_catalog.char_length(qris_storage_path) between 6 and 240
        and qris_storage_path ~ '^qris/[A-Za-z0-9][A-Za-z0-9._/-]*$'
        and pg_catalog.strpos(qris_storage_path, '..') = 0
      )
    ),
  instructions text
    constraint payment_settings_instructions_length
    check (
      instructions is null
      or pg_catalog.char_length(pg_catalog.btrim(instructions)) between 1 and 1000
    ),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint payment_settings_bank_fields_complete
    check (
      (
        bank_name is null
        and bank_account_number is null
        and bank_account_holder is null
      )
      or
      (
        bank_name is not null
        and bank_account_number is not null
        and bank_account_holder is not null
      )
    )
);

comment on table public.payment_settings is
  'Konfigurasi instruksi pembayaran manual. Tidak memproses atau memverifikasi uang.';

insert into public.payment_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all
on function private.touch_updated_at()
from public, anon, authenticated;

drop trigger if exists payment_settings_set_updated_at
on public.payment_settings;

create trigger payment_settings_set_updated_at
before update on public.payment_settings
for each row
execute function private.touch_updated_at();

alter table public.payment_settings enable row level security;

revoke all on table public.payment_settings from anon, authenticated;

grant select, update
on table public.payment_settings
to authenticated;

drop policy if exists "admin claim can read payment settings"
on public.payment_settings;

create policy "admin claim can read payment settings"
on public.payment_settings
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can update payment settings"
on public.payment_settings;

create policy "admin claim can update payment settings"
on public.payment_settings
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  id = true
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'payment-assets',
  'payment-assets',
  true,
  1572864,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin claim can list payment assets"
on storage.objects;

create policy "admin claim can list payment assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-assets'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can upload payment assets"
on storage.objects;

create policy "admin claim can upload payment assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-assets'
  and name like 'qris/%'
  and pg_catalog.strpos(name, '..') = 0
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can update payment assets"
on storage.objects;

create policy "admin claim can update payment assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'payment-assets'
  and name like 'qris/%'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'payment-assets'
  and name like 'qris/%'
  and pg_catalog.strpos(name, '..') = 0
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can delete payment assets"
on storage.objects;

create policy "admin claim can delete payment assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'payment-assets'
  and name like 'qris/%'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create table if not exists public.testimonials (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  inquiry_id uuid unique
    references public.inquiries (id)
    on delete set null,
  service_category text not null
    constraint testimonials_service_category_valid
    check (
      service_category in (
        'dokumen-kendaraan',
        'perizinan-bangunan',
        'legalitas-teknis'
      )
    ),
  rating smallint not null
    constraint testimonials_rating_valid
    check (rating between 1 and 5),
  display_name text not null
    constraint testimonials_display_name_length
    check (pg_catalog.char_length(pg_catalog.btrim(display_name)) between 2 and 120),
  testimonial_text text not null
    constraint testimonials_text_length
    check (pg_catalog.char_length(pg_catalog.btrim(testimonial_text)) between 10 and 1500),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint testimonials_publication_consistent
    check (
      (published = false and published_at is null)
      or (published = true and published_at is not null)
    )
);

comment on table public.testimonials is
  'Testimoni yang ditulis dan dipublikasikan manual oleh admin dari inquiry yang sudah dinyatakan layak.';

comment on column public.testimonials.inquiry_id is
  'Referensi internal. Tidak diberikan kepada role anon dan menjadi null saat inquiry melewati masa retensi.';

create or replace function private.prepare_testimonial()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_category text;
begin
  if tg_op = 'INSERT' then
    if new.inquiry_id is null then
      raise exception using
        errcode = '23514',
        message = 'An eligible inquiry is required';
    end if;

    select inquiries.service_category
    into inquiry_category
    from public.inquiries
    where inquiries.id = new.inquiry_id
      and inquiries.testimonial_eligible_at is not null;

    if inquiry_category is null then
      raise exception using
        errcode = '23514',
        message = 'An eligible inquiry is required';
    end if;

    if new.published then
      raise exception using
        errcode = '23514',
        message = 'A testimonial must be saved as a draft before publication';
    end if;

    new.service_category := inquiry_category;
    new.published_at := null;
  else
    if old.inquiry_id is distinct from new.inquiry_id
      and new.inquiry_id is not null then
      raise exception using
        errcode = '23514',
        message = 'Testimonial inquiry reference is immutable';
    end if;

    new.service_category := old.service_category;

    if new.published and not old.published then
      if new.inquiry_id is null or not exists (
        select 1
        from public.inquiries
        where inquiries.id = new.inquiry_id
          and inquiries.testimonial_eligible_at is not null
      ) then
        raise exception using
          errcode = '23514',
          message = 'An eligible inquiry is required before publication';
      end if;

      new.published_at := pg_catalog.now();
    elsif not new.published then
      new.published_at := null;
    else
      new.published_at := old.published_at;
    end if;

    new.updated_at := pg_catalog.now();
  end if;

  return new;
end;
$$;

revoke all
on function private.prepare_testimonial()
from public, anon, authenticated;

drop trigger if exists testimonials_prepare_record
on public.testimonials;

create trigger testimonials_prepare_record
before insert or update on public.testimonials
for each row
execute function private.prepare_testimonial();

create index if not exists testimonials_published_category_idx
  on public.testimonials (service_category, published_at desc)
  where published = true;

alter table public.testimonials enable row level security;

revoke all on table public.testimonials from anon, authenticated;

grant select (
  id,
  service_category,
  rating,
  display_name,
  testimonial_text,
  published_at
)
on table public.testimonials
to anon;

grant select, insert, update, delete
on table public.testimonials
to authenticated;

drop policy if exists "anon can read published testimonials"
on public.testimonials;

create policy "anon can read published testimonials"
on public.testimonials
for select
to anon
using (published = true);

drop policy if exists "admin claim can read testimonials"
on public.testimonials;

create policy "admin claim can read testimonials"
on public.testimonials
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can create testimonials"
on public.testimonials;

create policy "admin claim can create testimonials"
on public.testimonials
for insert
to authenticated
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can update testimonials"
on public.testimonials;

create policy "admin claim can update testimonials"
on public.testimonials
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "admin claim can delete testimonials"
on public.testimonials;

create policy "admin claim can delete testimonials"
on public.testimonials
for delete
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

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
begin
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
    pg_catalog.btrim(p_full_name),
    pg_catalog.btrim(p_phone),
    p_service_category,
    nullif(pg_catalog.btrim(p_service_detail), ''),
    nullif(pg_catalog.btrim(p_region), ''),
    nullif(pg_catalog.btrim(p_notes), ''),
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

create or replace function public.get_inquiry_tracking(p_reference_code text)
returns table (
  reference_code text,
  inquiry_status text,
  service_category text,
  service_detail text,
  updated_at timestamptz,
  payment_required boolean,
  payment_amount bigint,
  payment_timing text,
  payment_status text,
  verification_requested boolean,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  qris_storage_path text,
  payment_instructions text
)
language plpgsql
stable
security definer
set search_path = ''
rows 1
as $$
declare
  normalized_reference_code text;
begin
  normalized_reference_code := pg_catalog.upper(
    pg_catalog.btrim(coalesce(p_reference_code, ''))
  );

  if normalized_reference_code !~ '^TS-[0-9]{4}-[0-9A-F]{10}$' then
    return;
  end if;

  return query
  select
    inquiries.reference_code,
    inquiries.status,
    inquiries.service_category,
    inquiries.service_detail,
    inquiries.updated_at,
    inquiries.payment_required,
    case
      when inquiries.payment_required then inquiries.payment_amount
      else null
    end,
    case
      when inquiries.payment_required then inquiries.payment_timing
      else null
    end,
    inquiries.payment_status,
    inquiries.payment_status = 'menunggu-verifikasi',
    case
      when inquiries.payment_status in ('menunggu-pembayaran', 'menunggu-verifikasi')
        then payment_settings.bank_name
      else null
    end,
    case
      when inquiries.payment_status in ('menunggu-pembayaran', 'menunggu-verifikasi')
        then payment_settings.bank_account_number
      else null
    end,
    case
      when inquiries.payment_status in ('menunggu-pembayaran', 'menunggu-verifikasi')
        then payment_settings.bank_account_holder
      else null
    end,
    case
      when inquiries.payment_status in ('menunggu-pembayaran', 'menunggu-verifikasi')
        then payment_settings.qris_storage_path
      else null
    end,
    case
      when inquiries.payment_status in ('menunggu-pembayaran', 'menunggu-verifikasi')
        then payment_settings.instructions
      else null
    end
  from public.inquiries
  left join public.payment_settings
    on payment_settings.id = true
  where inquiries.reference_code = normalized_reference_code
  limit 1;
end;
$$;

revoke all
on function public.get_inquiry_tracking(text)
from public, anon, authenticated;

grant execute
on function public.get_inquiry_tracking(text)
to anon;

create or replace function public.request_payment_verification(
  p_reference_code text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_reference_code text;
begin
  normalized_reference_code := pg_catalog.upper(
    pg_catalog.btrim(coalesce(p_reference_code, ''))
  );

  if normalized_reference_code !~ '^TS-[0-9]{4}-[0-9A-F]{10}$' then
    return false;
  end if;

  update public.inquiries
  set
    payment_status = 'menunggu-verifikasi',
    payment_confirmation_requested_at = pg_catalog.now()
  where inquiries.reference_code = normalized_reference_code
    and inquiries.payment_required = true
    and inquiries.payment_status = 'menunggu-pembayaran';

  if found then
    return true;
  end if;

  return exists (
    select 1
    from public.inquiries
    where inquiries.reference_code = normalized_reference_code
      and inquiries.payment_required = true
      and inquiries.payment_status = 'menunggu-verifikasi'
      and inquiries.payment_confirmation_requested_at is not null
  );
end;
$$;

revoke all
on function public.request_payment_verification(text)
from public, anon, authenticated;

grant execute
on function public.request_payment_verification(text)
to anon;

revoke insert on table public.inquiries from anon;

revoke insert (
  full_name,
  phone,
  service_category,
  service_detail,
  region,
  notes
)
on table public.inquiries
from anon;

drop policy if exists "anon can submit website inquiries"
on public.inquiries;

revoke update on table public.inquiries from authenticated;

grant update (
  status,
  handled_note,
  payment_required,
  payment_amount,
  payment_timing,
  payment_status,
  payment_confirmation_requested_at,
  payment_verified_at,
  testimonial_eligible_at
)
on table public.inquiries
to authenticated;

commit;
