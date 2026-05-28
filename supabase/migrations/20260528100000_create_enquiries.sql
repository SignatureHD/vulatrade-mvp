create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  customer_name text,
  customer_phone text,
  product_name text not null,
  product_price numeric,
  message text,
  source text default 'public_page',
  status text default 'new',
  notes text,
  last_follow_up_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists enquiries_business_id_idx on public.enquiries(business_id);
create index if not exists enquiries_product_id_idx on public.enquiries(product_id);
create index if not exists enquiries_status_idx on public.enquiries(status);
create index if not exists enquiries_created_at_idx on public.enquiries(created_at desc);

alter table public.enquiries enable row level security;

create policy "Public can create enquiries"
on public.enquiries
for insert
with check (true);

create policy "Business owners can view their enquiries"
on public.enquiries
for select
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = enquiries.business_id
    and businesses.user_id = auth.uid()
  )
);

create policy "Business owners can update their enquiries"
on public.enquiries
for update
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = enquiries.business_id
    and businesses.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = enquiries.business_id
    and businesses.user_id = auth.uid()
  )
);

create policy "Business owners can delete their enquiries"
on public.enquiries
for delete
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = enquiries.business_id
    and businesses.user_id = auth.uid()
  )
);

create or replace function public.set_enquiries_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_enquiries_updated_at on public.enquiries;
create trigger set_enquiries_updated_at
before update on public.enquiries
for each row
execute function public.set_enquiries_updated_at();
