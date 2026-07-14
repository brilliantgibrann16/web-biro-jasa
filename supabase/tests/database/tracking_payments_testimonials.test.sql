begin;

create extension if not exists pgtap with schema extensions;

select no_plan();

select has_column(
  'public',
  'inquiries',
  'reference_code',
  'inquiries.reference_code exists'
);
select col_not_null(
  'public',
  'inquiries',
  'reference_code',
  'reference codes are always present'
);
select has_column(
  'public',
  'inquiries',
  'payment_required',
  'inquiries.payment_required exists'
);
select has_column(
  'public',
  'inquiries',
  'payment_amount',
  'inquiries.payment_amount exists'
);
select has_column(
  'public',
  'inquiries',
  'payment_timing',
  'inquiries.payment_timing exists'
);
select has_column(
  'public',
  'inquiries',
  'payment_status',
  'inquiries.payment_status exists'
);
select has_column(
  'public',
  'inquiries',
  'payment_confirmation_requested_at',
  'inquiries.payment_confirmation_requested_at exists'
);
select has_column(
  'public',
  'inquiries',
  'payment_verified_at',
  'inquiries.payment_verified_at exists'
);
select has_column(
  'public',
  'inquiries',
  'testimonial_eligible_at',
  'inquiries.testimonial_eligible_at exists'
);
select has_table(
  'public',
  'payment_settings',
  'payment settings singleton exists'
);
select has_table(
  'public',
  'testimonials',
  'testimonials table exists'
);
select ok(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.payment_settings'::pg_catalog.regclass
  ),
  'RLS is enabled on payment settings'
);
select ok(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.testimonials'::pg_catalog.regclass
  ),
  'RLS is enabled on testimonials'
);
select ok(
  exists (
    select 1
    from storage.buckets
    where id = 'payment-assets'
      and public = true
      and file_size_limit = 1572864
      and allowed_mime_types @> array['image/png', 'image/jpeg', 'image/webp']::text[]
  ),
  'payment-assets is a public image-only bucket capped at 1.5 MiB'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'admin claim can list payment assets',
        'admin claim can upload payment assets',
        'admin claim can update payment assets',
        'admin claim can delete payment assets'
      )
  ),
  4::bigint,
  'payment asset mutations are covered by four explicit admin policies'
);
select has_function(
  'public',
  'submit_public_inquiry',
  array['text', 'text', 'text', 'text', 'text', 'text'],
  'public inquiry submission RPC exists'
);
select has_function(
  'public',
  'get_inquiry_tracking',
  array['text'],
  'safe tracking lookup RPC exists'
);
select has_function(
  'public',
  'request_payment_verification',
  array['text'],
  'manual payment verification request RPC exists'
);
select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc
    where oid in (
      'public.submit_public_inquiry(text,text,text,text,text,text)'::pg_catalog.regprocedure,
      'public.get_inquiry_tracking(text)'::pg_catalog.regprocedure,
      'public.request_payment_verification(text)'::pg_catalog.regprocedure
    )
      and (
        prosecdef = false
        or not exists (
          select 1
          from pg_catalog.unnest(proconfig) as configuration(setting)
          where configuration.setting like 'search_path=%'
            and configuration.setting not like '%public%'
            and configuration.setting not like '%private%'
            and configuration.setting not like '%extensions%'
        )
      )
  ),
  'all public SECURITY DEFINER RPCs use an empty search_path'
);
select ok(
  not pg_catalog.has_schema_privilege('anon', 'private', 'USAGE'),
  'anon cannot access the private schema'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.inquiries', 'SELECT'),
  'anon has no direct inquiry SELECT privilege'
);
select ok(
  not pg_catalog.has_table_privilege('anon', 'public.inquiries', 'INSERT'),
  'anon has no direct inquiry INSERT privilege'
);
select ok(
  not pg_catalog.has_column_privilege(
    'anon',
    'public.inquiries',
    'full_name',
    'INSERT'
  )
  and not pg_catalog.has_column_privilege(
    'anon',
    'public.inquiries',
    'phone',
    'INSERT'
  )
  and not pg_catalog.has_column_privilege(
    'anon',
    'public.inquiries',
    'service_category',
    'INSERT'
  ),
  'legacy anon column INSERT grants are removed'
);
select ok(
  pg_catalog.has_function_privilege(
    'anon',
    'public.submit_public_inquiry(text,text,text,text,text,text)',
    'EXECUTE'
  )
  and pg_catalog.has_function_privilege(
    'anon',
    'public.get_inquiry_tracking(text)',
    'EXECUTE'
  )
  and pg_catalog.has_function_privilege(
    'anon',
    'public.request_payment_verification(text)',
    'EXECUTE'
  ),
  'anon can execute only the intended public workflow RPCs'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.get_inquiry_tracking(text)',
    'EXECUTE'
  ),
  'tracking RPC is not granted to unrelated authenticated sessions'
);
select ok(
  not pg_catalog.has_table_privilege(
    'anon',
    'public.payment_settings',
    'SELECT'
  ),
  'anon cannot select payment settings directly'
);
select ok(
  pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'id',
    'SELECT'
  )
  and pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'service_category',
    'SELECT'
  )
  and pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'rating',
    'SELECT'
  )
  and pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'display_name',
    'SELECT'
  )
  and pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'testimonial_text',
    'SELECT'
  )
  and pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'published_at',
    'SELECT'
  ),
  'anon can select the explicit public testimonial columns'
);
select ok(
  not pg_catalog.has_column_privilege(
    'anon',
    'public.testimonials',
    'inquiry_id',
    'SELECT'
  ),
  'anon cannot select the internal testimonial inquiry reference'
);
select ok(
  pg_catalog.strpos(
    pg_catalog.pg_get_function_result(
      'public.get_inquiry_tracking(text)'::pg_catalog.regprocedure
    ),
    'phone'
  ) = 0,
  'tracking RPC does not expose a phone field'
);
select ok(
  pg_catalog.strpos(
    pg_catalog.pg_get_function_result(
      'public.get_inquiry_tracking(text)'::pg_catalog.regprocedure
    ),
    'handled_note'
  ) = 0,
  'tracking RPC does not expose internal notes'
);
select ok(
  pg_catalog.strpos(
    pg_catalog.pg_get_function_result(
      'public.get_inquiry_tracking(text)'::pg_catalog.regprocedure
    ),
    'full_name'
  ) = 0,
  'tracking RPC does not expose the customer name'
);

create temporary table tracking_test_context (
  fixture_name text primary key,
  inquiry_id uuid not null,
  reference_code text not null,
  request_timestamp timestamptz
);

with inserted as (
  insert into public.inquiries (
    full_name,
    phone,
    service_category,
    service_detail,
    region,
    notes
  )
  values (
    'Tracking Security Fixture',
    '+628177770001',
    'dokumen-kendaraan',
    'Perpanjangan STNK',
    'Jakarta',
    'Fixture utama tracking'
  )
  returning id, reference_code
)
insert into tracking_test_context (
  fixture_name,
  inquiry_id,
  reference_code
)
select 'eligible', id, reference_code
from inserted;

with inserted as (
  insert into public.inquiries (
    full_name,
    phone,
    service_category,
    service_detail,
    region,
    notes
  )
  values (
    'Ineligible Testimonial Fixture',
    '+628177770002',
    'perizinan-bangunan',
    'PBG',
    'Bogor',
    'Fixture tanpa eligibility'
  )
  returning id, reference_code
)
insert into tracking_test_context (
  fixture_name,
  inquiry_id,
  reference_code
)
select 'ineligible', id, reference_code
from inserted;

grant select on tracking_test_context to anon, authenticated;

select ok(
  (
    select reference_code ~ '^TS-[0-9]{4}-[0-9A-F]{10}$'
    from tracking_test_context
    where fixture_name = 'eligible'
  ),
  'reference code has a 10-hex-character suffix'
);
select is(
  (
    select count(distinct reference_code)
    from tracking_test_context
  ),
  2::bigint,
  'separate inquiries receive distinct reference codes'
);
select throws_ok(
  $$
    update public.inquiries
    set reference_code = 'TS-0000-0000000000'
    where id = (
      select inquiry_id
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  $$,
  '23514',
  null,
  'reference code is immutable'
);
select throws_ok(
  $$
    update public.inquiries
    set
      payment_required = true,
      payment_amount = null,
      payment_timing = 'sebelum-proses',
      payment_status = 'menunggu-pembayaran'
    where id = (
      select inquiry_id
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  $$,
  '23514',
  null,
  'database rejects an incomplete payment configuration'
);

update public.payment_settings
set
  bank_name = 'Bank Uji',
  bank_account_number = '1234 5678 90',
  bank_account_holder = 'Pemilik Uji',
  qris_storage_path = 'qris/fixture-test.webp',
  instructions = 'Transfer sesuai nominal lalu minta verifikasi manual.'
where id = true;

update public.inquiries
set
  status = 'diproses',
  payment_required = true,
  payment_amount = 275000,
  payment_timing = 'sebelum-proses',
  payment_status = 'menunggu-pembayaran',
  testimonial_eligible_at = pg_catalog.now()
where id = (
  select inquiry_id
  from tracking_test_context
  where fixture_name = 'eligible'
);

set local role anon;

select is(
  (
    select count(*)
    from public.get_inquiry_tracking(
      (
        select reference_code
        from tracking_test_context
        where fixture_name = 'eligible'
      )
    )
  ),
  1::bigint,
  'a valid code returns exactly one safe tracking row'
);
select is(
  (
    select inquiry_status
    from public.get_inquiry_tracking(
      (
        select pg_catalog.lower(reference_code)
        from tracking_test_context
        where fixture_name = 'eligible'
      )
    )
  ),
  'diproses',
  'tracking lookup normalizes code casing'
);
select is(
  (
    select payment_amount
    from public.get_inquiry_tracking(
      (
        select reference_code
        from tracking_test_context
        where fixture_name = 'eligible'
      )
    )
  ),
  275000::bigint,
  'tracking returns the configured payment amount'
);
select is(
  (
    select bank_account_number
    from public.get_inquiry_tracking(
      (
        select reference_code
        from tracking_test_context
        where fixture_name = 'eligible'
      )
    )
  ),
  '1234 5678 90',
  'tracking RPC exposes payment instructions only through the safe result'
);
select is(
  (
    select count(*)
    from public.get_inquiry_tracking('not-a-reference-code')
  ),
  0::bigint,
  'malformed tracking code returns no rows and no error detail'
);
select is(
  (
    select count(*)
    from public.get_inquiry_tracking('TS-0000-0000000000')
  ),
  0::bigint,
  'unknown well-formed tracking code returns no rows'
);
select throws_ok(
  $$ select * from public.inquiries $$,
  '42501',
  null,
  'tracking access does not open direct inquiry SELECT'
);
select throws_ok(
  $$ select * from public.payment_settings $$,
  '42501',
  null,
  'tracking access does not open payment settings SELECT'
);
select is(
  public.request_payment_verification(
    (
      select reference_code
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  ),
  true,
  'customer can request manual verification for an awaiting payment'
);

reset role;

select is(
  (
    select payment_status
    from public.inquiries
    where id = (
      select inquiry_id
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  ),
  'menunggu-verifikasi',
  'verification request moves payment into manual verification state'
);
select ok(
  (
    select
      payment_confirmation_requested_at is not null
      and payment_verified_at is null
    from public.inquiries
    where id = (
      select inquiry_id
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  ),
  'customer report records a timestamp but never marks payment as paid'
);

update tracking_test_context
set request_timestamp = (
  select payment_confirmation_requested_at
  from public.inquiries
  where id = tracking_test_context.inquiry_id
)
where fixture_name = 'eligible';

set local role anon;

select is(
  public.request_payment_verification(
    (
      select reference_code
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  ),
  true,
  'repeated verification request is idempotently accepted'
);
select is(
  public.request_payment_verification('TS-0000-0000000000'),
  false,
  'unknown code cannot create a verification request'
);

reset role;

select is(
  (
    select inquiries.payment_confirmation_requested_at
    from public.inquiries as inquiries
    join tracking_test_context as context
      on context.inquiry_id = inquiries.id
    where context.fixture_name = 'eligible'
  ),
  (
    select request_timestamp
    from tracking_test_context
    where fixture_name = 'eligible'
  ),
  'idempotent request preserves the original report timestamp'
);

set local role authenticated;
set local request.jwt.claims =
  '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated","app_metadata":{"role":"admin"}}';

select throws_ok(
  $$
    insert into public.testimonials (
      inquiry_id,
      rating,
      display_name,
      testimonial_text
    )
    values (
      (
        select inquiry_id
        from tracking_test_context
        where fixture_name = 'ineligible'
      ),
      5,
      'Pelanggan Uji',
      'Pelayanan ini tidak boleh menjadi testimoni karena belum layak.'
    )
  $$,
  '23514',
  null,
  'testimonial cannot be created before an explicit eligibility decision'
);
select throws_ok(
  $$
    insert into public.testimonials (
      inquiry_id,
      rating,
      display_name,
      testimonial_text,
      published
    )
    values (
      (
        select inquiry_id
        from tracking_test_context
        where fixture_name = 'eligible'
      ),
      5,
      'Pelanggan Uji',
      'Testimoni harus disimpan sebagai draf sebelum dipublikasikan.',
      true
    )
  $$,
  '23514',
  null,
  'eligible testimonial cannot bypass the draft review step'
);
select lives_ok(
  $$
    insert into public.testimonials (
      inquiry_id,
      rating,
      display_name,
      testimonial_text
    )
    values (
      (
        select inquiry_id
        from tracking_test_context
        where fixture_name = 'eligible'
      ),
      5,
      'Pelanggan dari Jakarta',
      'Dokumen diperiksa dengan jelas dan prosesnya mudah dipantau.'
    )
  $$,
  'admin can save an eligible testimonial as an unpublished draft'
);

reset role;

select is(
  (
    select testimonials.service_category
    from public.testimonials as testimonials
    join tracking_test_context as context
      on context.inquiry_id = testimonials.inquiry_id
    where context.fixture_name = 'eligible'
  ),
  'dokumen-kendaraan',
  'testimonial category is copied from its inquiry'
);

set local role anon;

select is(
  (
    select count(*)
    from public.testimonials
  ),
  0::bigint,
  'anon cannot see an unpublished testimonial'
);

reset role;
set local role authenticated;
set local request.jwt.claims =
  '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated","app_metadata":{"role":"admin"}}';

select lives_ok(
  $$
    update public.testimonials
    set published = true
    where inquiry_id = (
      select inquiry_id
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  $$,
  'admin can separately publish a reviewed testimonial'
);

reset role;

select ok(
  (
    select published and published_at is not null
    from public.testimonials
    where inquiry_id = (
      select inquiry_id
      from tracking_test_context
      where fixture_name = 'eligible'
    )
  ),
  'publication trigger records published_at'
);

set local role anon;

select is(
  (
    select count(*)
    from public.testimonials
  ),
  1::bigint,
  'anon sees the published testimonial'
);
select is(
  (
    select display_name
    from public.testimonials
  ),
  'Pelanggan dari Jakarta',
  'public display name is exactly the explicit admin input'
);
select throws_ok(
  $$ select inquiry_id from public.testimonials $$,
  '42501',
  null,
  'anon cannot request the testimonial inquiry reference'
);
select throws_ok(
  $$ select published from public.testimonials $$,
  '42501',
  null,
  'anon cannot inspect internal testimonial publication fields'
);

reset role;
set local role authenticated;
set local request.jwt.claims =
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated","app_metadata":{"role":"viewer"}}';

select is(
  (
    select count(*)
    from public.testimonials
  ),
  0::bigint,
  'authenticated non-admin cannot read testimonials'
);

reset role;

delete from public.inquiries
where id = (
  select inquiry_id
  from tracking_test_context
  where fixture_name = 'eligible'
);

select ok(
  exists (
    select 1
    from public.testimonials
    where inquiry_id is null
  ),
  'testimonial survives inquiry retention with a null internal reference'
);
select is(
  (
    select count(*)
    from public.testimonials
  ),
  1::bigint,
  'inquiry retention does not delete published testimonial content'
);

select * from finish();

rollback;
