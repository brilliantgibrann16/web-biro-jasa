begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select has_table('public', 'inquiries', 'inquiries table exists');
select has_column('public', 'inquiries', 'id', 'inquiries.id exists');
select has_column(
  'public',
  'inquiries',
  'handled_note',
  'internal handled_note column exists'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.inquiries'::regclass),
  'RLS is enabled on inquiries'
);
select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.inquiries'::regclass
      and tgname = 'inquiries_set_updated_at'
      and not tgisinternal
  ),
  'updated_at trigger exists'
);

set local role anon;

select lives_ok(
  $$
    insert into public.inquiries (
      full_name,
      phone,
      service_category,
      service_detail,
      region,
      notes
    ) values (
      'Anon RLS Test',
      '+628111111111',
      'dokumen-kendaraan',
      'Perpanjangan STNK',
      'Jakarta',
      'Fixture pengujian RLS'
    )
  $$,
  'anon can insert public inquiry fields'
);
select throws_ok(
  $$ select * from public.inquiries $$,
  '42501',
  null,
  'anon cannot select inquiries'
);
select throws_ok(
  $$ update public.inquiries set notes = 'forbidden' $$,
  '42501',
  null,
  'anon cannot update inquiries'
);
select throws_ok(
  $$ delete from public.inquiries $$,
  '42501',
  null,
  'anon cannot delete inquiries'
);
select throws_ok(
  $$
    insert into public.inquiries (
      full_name,
      phone,
      service_category,
      handled_note
    ) values (
      'Anon Internal Field Test',
      '+628122222222',
      'legalitas-teknis',
      'Tidak boleh masuk'
    )
  $$,
  '42501',
  null,
  'anon cannot write handled_note'
);
select throws_ok(
  $$
    insert into public.inquiries (
      full_name,
      phone,
      service_category,
      status
    ) values (
      'Anon Status Test',
      '+628133333333',
      'perizinan-bangunan',
      'selesai'
    )
  $$,
  '42501',
  null,
  'anon cannot choose status'
);

reset role;

select is(
  (
    select status
    from public.inquiries
    where phone = '+628111111111'
  ),
  'baru',
  'anon insert receives baru status'
);
select is(
  (
    select source
    from public.inquiries
    where phone = '+628111111111'
  ),
  'website-form',
  'anon insert receives website-form source'
);
select is(
  (
    select handled_note
    from public.inquiries
    where phone = '+628111111111'
  ),
  null,
  'anon insert never creates internal notes'
);
select throws_ok(
  $$
    insert into public.inquiries (
      full_name,
      phone,
      service_category
    ) values (
      'Invalid Category Test',
      '+628144444444',
      'kategori-tidak-valid'
    )
  $$,
  '23514',
  null,
  'database rejects unknown service categories'
);

set local role authenticated;

select lives_ok(
  $$ select * from public.inquiries $$,
  'authenticated admin can select inquiries'
);
select lives_ok(
  $$
    insert into public.inquiries (
      id,
      full_name,
      phone,
      service_category,
      status,
      source,
      handled_note
    ) values (
      '11111111-1111-4111-8111-111111111111',
      'Authenticated RLS Test',
      '+628155555555',
      'legalitas-teknis',
      'baru',
      'manual-admin',
      'Fixture internal'
    )
  $$,
  'authenticated admin can insert inquiries'
);
select lives_ok(
  $$
    update public.inquiries
    set
      status = 'diproses',
      updated_at = '2000-01-01 00:00:00+00'
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  'authenticated admin can update inquiries'
);
select ok(
  (
    select updated_at > '2026-01-01 00:00:00+00'
    from public.inquiries
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  'updated_at trigger overwrites stale timestamps'
);
select lives_ok(
  $$
    delete from public.inquiries
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  'authenticated admin can delete inquiries'
);

reset role;

select * from finish();

rollback;
