-- VulaTrade POPIA consent + Supabase RLS/API hardening
-- Apply this in Supabase SQL editor, or through the Supabase CLI migration flow.
-- Consent version used by the app: 2026-05-v1

-- ─────────────────────────────────────────────────────────────
-- 1) Consent audit table
-- ─────────────────────────────────────────────────────────────
create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_accepted boolean not null default false,
  privacy_accepted boolean not null default false,
  popia_accepted boolean not null default false,
  marketing_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  consent_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint user_consents_required_acceptances check (
    terms_accepted = true
    and privacy_accepted = true
    and popia_accepted = true
  )
);

create index if not exists user_consents_user_version_idx
  on public.user_consents (user_id, consent_version, accepted_at desc);

alter table public.user_consents enable row level security;

revoke all on table public.user_consents from anon;
revoke all on table public.user_consents from public;
grant select, insert on table public.user_consents to authenticated;

drop policy if exists "Users can read their own consent records" on public.user_consents;
create policy "Users can read their own consent records"
  on public.user_consents
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own consent records" on public.user_consents;
create policy "Users can insert their own consent records"
  on public.user_consents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2) Enable RLS and authenticated API grants for private app tables
-- ─────────────────────────────────────────────────────────────
-- These DO blocks let the migration run safely even if a table is not present yet.

do $$
begin
  if to_regclass('public.businesses') is not null then
    alter table public.businesses enable row level security;
    revoke all on table public.businesses from anon;
    revoke all on table public.businesses from public;
    grant select, insert, update, delete on table public.businesses to authenticated;
  end if;

  if to_regclass('public.products') is not null then
    alter table public.products enable row level security;
    revoke all on table public.products from anon;
    revoke all on table public.products from public;
    grant select, insert, update, delete on table public.products to authenticated;
  end if;

  if to_regclass('public.customers') is not null then
    alter table public.customers enable row level security;
    revoke all on table public.customers from anon;
    revoke all on table public.customers from public;
    grant select, insert, update, delete on table public.customers to authenticated;
  end if;

  if to_regclass('public.bookings') is not null then
    alter table public.bookings enable row level security;
    revoke all on table public.bookings from anon;
    revoke all on table public.bookings from public;
    grant select, insert, update, delete on table public.bookings to authenticated;
  end if;

  if to_regclass('public.sales') is not null then
    alter table public.sales enable row level security;
    revoke all on table public.sales from anon;
    revoke all on table public.sales from public;
    grant select, insert, update, delete on table public.sales to authenticated;
  end if;

  if to_regclass('public.expenses') is not null then
    alter table public.expenses enable row level security;
    revoke all on table public.expenses from anon;
    revoke all on table public.expenses from public;
    grant select, insert, update, delete on table public.expenses to authenticated;
  end if;

  if to_regclass('public.reviews') is not null then
    alter table public.reviews enable row level security;
    revoke all on table public.reviews from anon;
    revoke all on table public.reviews from public;
    grant select, insert, update, delete on table public.reviews to authenticated;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 3) Owner-only policies
-- ─────────────────────────────────────────────────────────────
-- Drop/recreate policy names used here so future edits stay predictable.

do $$
begin
  if to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage their own businesses" on public.businesses;
    create policy "Users can manage their own businesses"
      on public.businesses
      for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if to_regclass('public.products') is not null and to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage products for their businesses" on public.products;
    create policy "Users can manage products for their businesses"
      on public.products
      for all
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = products.business_id
          and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = products.business_id
          and b.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.customers') is not null and to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage customers for their businesses" on public.customers;
    create policy "Users can manage customers for their businesses"
      on public.customers
      for all
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = customers.business_id
          and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = customers.business_id
          and b.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.bookings') is not null and to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage bookings for their businesses" on public.bookings;
    create policy "Users can manage bookings for their businesses"
      on public.bookings
      for all
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = bookings.business_id
          and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = bookings.business_id
          and b.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.sales') is not null and to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage sales for their businesses" on public.sales;
    create policy "Users can manage sales for their businesses"
      on public.sales
      for all
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = sales.business_id
          and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = sales.business_id
          and b.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.expenses') is not null and to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage expenses for their businesses" on public.expenses;
    create policy "Users can manage expenses for their businesses"
      on public.expenses
      for all
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = expenses.business_id
          and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = expenses.business_id
          and b.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.reviews') is not null and to_regclass('public.businesses') is not null then
    drop policy if exists "Users can manage reviews for their businesses" on public.reviews;
    create policy "Users can manage reviews for their businesses"
      on public.reviews
      for all
      to authenticated
      using (
        exists (
          select 1 from public.businesses b
          where b.id = reviews.business_id
          and b.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.businesses b
          where b.id = reviews.business_id
          and b.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 4) Safe anonymous public-page RPC
-- ─────────────────────────────────────────────────────────────
-- Public business pages need anonymous access, but not to raw private tables.
-- This function returns only safe public catalogue fields and keeps private
-- customer, sales, expense, booking and exact location data closed.

create or replace function public.get_public_business_page(input_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  found_business public.businesses%rowtype;
  safe_business jsonb;
  safe_products jsonb := '[]'::jsonb;
  safe_reviews jsonb := '[]'::jsonb;
begin
  if to_regclass('public.businesses') is null then
    return null;
  end if;

  select * into found_business
  from public.businesses
  where slug = input_slug
  limit 1;

  if not found then
    return null;
  end if;

  safe_business := jsonb_strip_nulls(jsonb_build_object(
    'id', found_business.id,
    'name', found_business.name,
    'slug', found_business.slug,
    'category', found_business.category,
    'area', found_business.area,
    'location_label', found_business.location_label,
    'delivery_radius_km', found_business.delivery_radius_km,
    'description', found_business.description,
    'whatsapp', found_business.whatsapp,
    'phone', found_business.phone,
    'catalogue', found_business.catalogue,
    'background_style', found_business.background_style,
    'theme', found_business.theme,
    'instagram', found_business.instagram,
    'instagram_url', found_business.instagram_url,
    'facebook', found_business.facebook,
    'facebook_url', found_business.facebook_url,
    'tiktok', found_business.tiktok,
    'tiktok_url', found_business.tiktok_url,
    'website', found_business.website,
    'website_url', found_business.website_url
  ));

  if to_regclass('public.products') is not null then
    select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at), '[]'::jsonb)
      into safe_products
    from public.products p
    where p.business_id = found_business.id
      and coalesce(p.is_active, true) = true;
  end if;

  if to_regclass('public.reviews') is not null then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'rating', r.rating,
          'review_text', r.review_text,
          'customer_name', r.customer_name,
          'created_at', r.created_at
        ) order by r.created_at desc
      ),
      '[]'::jsonb
    ) into safe_reviews
    from public.reviews r
    where r.business_id = found_business.id
      and coalesce(r.approved, false) = true;
  end if;

  return jsonb_build_object(
    'business', safe_business,
    'products', safe_products,
    'reviews', safe_reviews
  );
end;
$$;

revoke all on function public.get_public_business_page(text) from public;
grant execute on function public.get_public_business_page(text) to anon, authenticated;

-- Keep precise latitude/longitude private. Public pages should use area,
-- location_label and delivery_radius_km only.
