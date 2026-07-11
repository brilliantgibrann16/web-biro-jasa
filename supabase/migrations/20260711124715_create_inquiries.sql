begin;

create extension if not exists pgcrypto;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null
    constraint inquiries_full_name_length
    check (char_length(btrim(full_name)) between 2 and 120),
  phone text not null
    constraint inquiries_phone_length
    check (char_length(btrim(phone)) between 8 and 30),
  service_category text not null
    constraint inquiries_service_category_valid
    check (
      service_category in (
        'dokumen-kendaraan',
        'perizinan-bangunan',
        'legalitas-teknis'
      )
    ),
  service_detail text
    constraint inquiries_service_detail_length
    check (
      service_detail is null
      or char_length(btrim(service_detail)) between 1 and 160
    ),
  region text
    constraint inquiries_region_length
    check (
      region is null
      or char_length(btrim(region)) between 1 and 120
    ),
  notes text
    constraint inquiries_notes_length
    check (
      notes is null
      or char_length(btrim(notes)) between 1 and 2000
    ),
  status text not null default 'baru'
    constraint inquiries_status_valid
    check (
      status in (
        'baru',
        'diproses',
        'menunggu-dokumen',
        'selesai',
        'dibatalkan'
      )
    ),
  source text not null default 'website-form'
    constraint inquiries_source_length
    check (char_length(btrim(source)) between 1 and 50),
  handled_note text
    constraint inquiries_handled_note_length
    check (
      handled_note is null
      or char_length(btrim(handled_note)) between 1 and 4000
    )
);

comment on table public.inquiries is
  'Jejak inquiry publik dan progres internal. Tidak untuk menyimpan foto atau nomor dokumen sensitif.';

comment on column public.inquiries.notes is
  'Catatan kebutuhan yang dikirim pengunjung.';

comment on column public.inquiries.handled_note is
  'Catatan progres internal admin; tidak pernah dapat ditulis atau dibaca role anon.';

create or replace function public.set_inquiries_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row
execute function public.set_inquiries_updated_at();

revoke all
on function public.set_inquiries_updated_at()
from public, anon, authenticated;

create index inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index inquiries_status_created_at_idx
  on public.inquiries (status, created_at desc);

create index inquiries_category_created_at_idx
  on public.inquiries (service_category, created_at desc);

alter table public.inquiries enable row level security;

revoke all on table public.inquiries from anon, authenticated;

grant insert (
  full_name,
  phone,
  service_category,
  service_detail,
  region,
  notes
)
on table public.inquiries
to anon;

grant select, insert, update, delete
on table public.inquiries
to authenticated;

create policy "anon can submit website inquiries"
on public.inquiries
for insert
to anon
with check (
  status = 'baru'
  and source = 'website-form'
  and handled_note is null
);

create policy "authenticated admins can read inquiries"
on public.inquiries
for select
to authenticated
using (true);

create policy "authenticated admins can create inquiries"
on public.inquiries
for insert
to authenticated
with check (true);

create policy "authenticated admins can update inquiries"
on public.inquiries
for update
to authenticated
using (true)
with check (true);

create policy "authenticated admins can delete inquiries"
on public.inquiries
for delete
to authenticated
using (true);

commit;
