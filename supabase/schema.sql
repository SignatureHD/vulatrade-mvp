-- VulaTrade MVP Supabase schema
-- Run this inside Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  owner text,
  category text,
  area text,
  whatsapp text,
  description text,
  payment text,
  slug text not null,
  theme text default 'Lime',
  background_style text default 'Gradient',
  font text default 'Clean',
  catalogue text,
  created_at timestamptz default now(),
  unique(slug)
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  price numeric default 0,
  image text default '🛍️',
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  interest text,
  status text default 'New Lead',
  value numeric default 0,
  notes text,
  next_follow_up date,
  created_at timestamptz default now()
);

create table if not exists public.message_templates (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  amount numeric default 0,
  status text default 'Unpaid',
  method text,
  reference text,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  rating int default 5 check (rating >= 1 and rating <= 5),
  review_text text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.message_templates enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

create policy "businesses public read" on public.businesses for select using (true);
create policy "businesses insert own" on public.businesses for insert with check (auth.uid() = user_id);
create policy "businesses update own" on public.businesses for update using (auth.uid() = user_id);
create policy "businesses delete own" on public.businesses for delete using (auth.uid() = user_id);

create policy "products public read active" on public.products for select using (is_active = true);
create policy "products owner insert" on public.products for insert with check (exists (select 1 from public.businesses b where b.id = products.business_id and b.user_id = auth.uid()));
create policy "products owner update" on public.products for update using (exists (select 1 from public.businesses b where b.id = products.business_id and b.user_id = auth.uid()));
create policy "products owner delete" on public.products for delete using (exists (select 1 from public.businesses b where b.id = products.business_id and b.user_id = auth.uid()));

create policy "customers owner select" on public.customers for select using (exists (select 1 from public.businesses b where b.id = customers.business_id and b.user_id = auth.uid()));
create policy "customers owner insert" on public.customers for insert with check (exists (select 1 from public.businesses b where b.id = customers.business_id and b.user_id = auth.uid()));
create policy "customers owner update" on public.customers for update using (exists (select 1 from public.businesses b where b.id = customers.business_id and b.user_id = auth.uid()));
create policy "customers owner delete" on public.customers for delete using (exists (select 1 from public.businesses b where b.id = customers.business_id and b.user_id = auth.uid()));

create policy "message templates owner select" on public.message_templates for select using (exists (select 1 from public.businesses b where b.id = message_templates.business_id and b.user_id = auth.uid()));
create policy "message templates owner insert" on public.message_templates for insert with check (exists (select 1 from public.businesses b where b.id = message_templates.business_id and b.user_id = auth.uid()));
create policy "message templates owner update" on public.message_templates for update using (exists (select 1 from public.businesses b where b.id = message_templates.business_id and b.user_id = auth.uid()));
create policy "message templates owner delete" on public.message_templates for delete using (exists (select 1 from public.businesses b where b.id = message_templates.business_id and b.user_id = auth.uid()));

create policy "payments owner select" on public.payments for select using (exists (select 1 from public.businesses b where b.id = payments.business_id and b.user_id = auth.uid()));
create policy "payments owner insert" on public.payments for insert with check (exists (select 1 from public.businesses b where b.id = payments.business_id and b.user_id = auth.uid()));
create policy "payments owner update" on public.payments for update using (exists (select 1 from public.businesses b where b.id = payments.business_id and b.user_id = auth.uid()));
create policy "payments owner delete" on public.payments for delete using (exists (select 1 from public.businesses b where b.id = payments.business_id and b.user_id = auth.uid()));

create policy "reviews public approved" on public.reviews for select using (approved = true);
create policy "reviews owner insert" on public.reviews for insert with check (exists (select 1 from public.businesses b where b.id = reviews.business_id and b.user_id = auth.uid()));
create policy "reviews owner update" on public.reviews for update using (exists (select 1 from public.businesses b where b.id = reviews.business_id and b.user_id = auth.uid()));
create policy "reviews owner delete" on public.reviews for delete using (exists (select 1 from public.businesses b where b.id = reviews.business_id and b.user_id = auth.uid()));
