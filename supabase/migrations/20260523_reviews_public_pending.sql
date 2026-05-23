-- Allow customers to submit pending reviews from public review links.
-- Reviews still require owner approval before they appear publicly.

create policy if not exists "reviews public pending insert"
on public.reviews
for insert
to anon, authenticated
with check (
  approved = false
  and exists (
    select 1
    from public.businesses b
    where b.id = reviews.business_id
  )
);
