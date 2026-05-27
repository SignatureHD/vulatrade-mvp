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

create policy "Users can read their own consent records"
  on public.user_consents
  for select
  to authenticated
  using (auth.uid() = user_id);

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
-- 4) Public page safety notes
-- ─────────────────────────────────────────────────────────────
-- This migration intentionally removes anon table access from private tables.
-- If VulaTrade public business pages need anonymous reads, expose only safe public
-- fields through a dedicated view or RPC. Do not grant anon access to raw
-- businesses/products/customers/bookings/sales/expenses/reviews tables.
-- Keep precise latitude/longitude private; show area/location_label publicly only.
