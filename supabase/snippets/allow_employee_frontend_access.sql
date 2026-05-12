-- Exercise-only access policy for the React frontend.
-- Run this in the Supabase SQL Editor if SQL Editor can see rows in
-- public."Employee" but the browser/anon key receives an empty array.

grant select, update, delete on table public."Employee" to anon;

alter table public."Employee" enable row level security;

drop policy if exists "Allow anon read employees" on public."Employee";
create policy "Allow anon read employees"
on public."Employee"
for select
to anon
using (true);

drop policy if exists "Allow anon rename employees" on public."Employee";
create policy "Allow anon rename employees"
on public."Employee"
for update
to anon
using (true)
with check (true);

drop policy if exists "Allow anon delete employees" on public."Employee";
create policy "Allow anon delete employees"
on public."Employee"
for delete
to anon
using (true);
