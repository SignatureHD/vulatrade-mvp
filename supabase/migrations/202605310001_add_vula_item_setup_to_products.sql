-- VulaTrade MVP item setup fields
-- This gives product/service type changes a proper home instead of hiding setup data in text.

alter table public.products
  add column if not exists item_type text not null default 'standard_stock',
  add column if not exists item_behaviour text not null default 'counter',
  add column if not exists item_setup jsonb not null default '{}'::jsonb;

alter table public.products
  drop constraint if exists products_item_type_check;

alter table public.products
  add constraint products_item_type_check
  check (item_type in ('standard_stock', 'daily_stock', 'service', 'made_to_order'));

alter table public.products
  drop constraint if exists products_item_behaviour_check;

alter table public.products
  add constraint products_item_behaviour_check
  check (item_behaviour in ('counter', 'agreement'));

create index if not exists products_item_type_idx on public.products (business_id, item_type);

update public.products
set item_behaviour = case
  when item_type in ('standard_stock', 'daily_stock') then 'counter'
  else 'agreement'
end;
