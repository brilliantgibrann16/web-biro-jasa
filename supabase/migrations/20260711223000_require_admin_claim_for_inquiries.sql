begin;

drop policy if exists "authenticated admins can read inquiries"
on public.inquiries;

drop policy if exists "authenticated admins can create inquiries"
on public.inquiries;

drop policy if exists "authenticated admins can update inquiries"
on public.inquiries;

drop policy if exists "authenticated admins can delete inquiries"
on public.inquiries;

create policy "admin claim can read inquiries"
on public.inquiries
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin claim can create inquiries"
on public.inquiries
for insert
to authenticated
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin claim can update inquiries"
on public.inquiries
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin claim can delete inquiries"
on public.inquiries
for delete
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

commit;
