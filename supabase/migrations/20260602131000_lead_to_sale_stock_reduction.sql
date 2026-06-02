-- VulaTrade Lead to Sale + Stock Reduction MVP
-- Run in Supabase SQL editor / migration flow before using the dashboard action.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Product stock fields used by the Vula item setup flow.
alter table public.products add column if not exists item_type text default 'standard_stock';
alter table public.products add column if not exists item_setup jsonb default '{}'::jsonb;
alter table public.products add column if not exists track_stock boolean default false;
alter table public.products add column if not exists stock_quantity numeric default null;
alter table public.products add column if not exists today_stock_quantity numeric default null;
alter table public.products add column if not exists today_stock_date date default current_date;
alter table public.products add column if not exists is_sold_out boolean default false;
alter table public.products add column if not exists updated_at timestamptz default now();

-- Enquiry fields used by current lead flow. Safe no-ops when already present.
alter table public.enquiries add column if not exists customer_id uuid;
alter table public.enquiries add column if not exists product_id uuid;
alter table public.enquiries add column if not exists is_archived boolean default false;
alter table public.enquiries add column if not exists archived_at timestamptz;
alter table public.enquiries add column if not exists updated_at timestamptz default now();

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid,
  lead_id uuid,
  product_id uuid,
  item_name text,
  item_type text default 'standard_stock',
  quantity numeric not null default 1 check (quantity > 0),
  unit_price numeric default 0,
  total_amount numeric default 0,
  payment_status text not null default 'paid' check (payment_status in ('paid', 'pending')),
  sale_status text not null default 'completed' check (sale_status in ('completed', 'cancelled', 'refunded')),
  sale_date timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_business_date_idx on public.sales (business_id, sale_date desc);
create index if not exists sales_customer_idx on public.sales (customer_id);
create index if not exists sales_lead_idx on public.sales (lead_id);
create index if not exists sales_product_idx on public.sales (product_id);

alter table public.sales enable row level security;
revoke all on table public.sales from anon;
revoke all on table public.sales from public;
grant select, insert, update, delete on table public.sales to authenticated;

drop policy if exists "Users can manage sales for their businesses" on public.sales;
create policy "Users can manage sales for their businesses"
  on public.sales
  for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = sales.business_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = sales.business_id and b.user_id = auth.uid()));

create or replace function public.confirm_lead_sale(
  input_enquiry_id uuid,
  input_quantity numeric default 1,
  input_total_amount numeric default null,
  input_payment_status text default 'paid',
  input_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e record;
  p record;
  sale_row public.sales%rowtype;
  qty numeric := greatest(coalesce(input_quantity, 1), 1);
  pay_status text := case when input_payment_status = 'pending' then 'pending' else 'paid' end;
  item_type_value text := 'standard_stock';
  amount numeric := coalesce(input_total_amount, 0);
  unit_amount numeric := 0;
  new_stock numeric;
  sold_out boolean := false;
  customer_note text;
begin
  select * into e
  from public.enquiries
  where id = input_enquiry_id;

  if not found then
    raise exception 'Lead not found';
  end if;

  if not exists (select 1 from public.businesses b where b.id = e.business_id and b.user_id = auth.uid()) then
    raise exception 'Not allowed';
  end if;

  select * into p
  from public.products
  where business_id = e.business_id
    and (
      id = e.product_id
      or (e.product_id is null and lower(name) = lower(coalesce(e.product_name, '')))
    )
  order by case when id = e.product_id then 0 else 1 end
  limit 1;

  if found then
    item_type_value := coalesce(p.item_setup->>'item_type', p.item_type, 'standard_stock');
  else
    item_type_value := 'made_to_order';
  end if;

  unit_amount := case when qty > 0 then coalesce(amount, 0) / qty else 0 end;
  if amount is null or amount <= 0 then
    amount := coalesce(e.product_price, 0) * qty;
    unit_amount := coalesce(e.product_price, 0);
  end if;

  insert into public.sales (
    business_id,
    customer_id,
    lead_id,
    product_id,
    item_name,
    item_type,
    quantity,
    unit_price,
    total_amount,
    payment_status,
    sale_status,
    notes
  ) values (
    e.business_id,
    e.customer_id,
    e.id,
    case when found then p.id else null end,
    coalesce(e.product_name, case when found then p.name else 'Sale' end),
    item_type_value,
    qty,
    unit_amount,
    amount,
    pay_status,
    'completed',
    input_notes
  )
  returning * into sale_row;

  if found and item_type_value = 'standard_stock' and coalesce(p.track_stock, false) then
    new_stock := greatest(coalesce(p.stock_quantity, 0) - qty, 0);
    sold_out := new_stock <= 0;
    update public.products
      set stock_quantity = new_stock,
          is_sold_out = sold_out,
          updated_at = now()
      where id = p.id;
  elsif found and item_type_value = 'daily_stock' then
    new_stock := greatest(coalesce(p.today_stock_quantity, 0) - qty, 0);
    sold_out := new_stock <= 0;
    update public.products
      set today_stock_quantity = new_stock,
          today_stock_date = current_date,
          is_sold_out = sold_out,
          updated_at = now()
      where id = p.id;
  end if;

  update public.enquiries
    set status = 'completed',
        is_archived = true,
        archived_at = now(),
        updated_at = now()
    where id = e.id;

  if e.customer_id is not null then
    customer_note := concat_ws(E'\n', nullif(input_notes, ''), concat('Sale recorded: ', coalesce(e.product_name, 'item'), ' x ', qty::text, ' = R', amount::text));
    update public.customers
      set status = 'completed',
          stage = 'completed',
          value = coalesce(value, 0) + coalesce(amount, 0),
          notes = trim(both E'\n' from concat_ws(E'\n', notes, customer_note)),
          last_contacted = now()
      where id = e.customer_id
        and business_id = e.business_id;
  end if;

  return jsonb_build_object(
    'sale_id', sale_row.id,
    'lead_id', e.id,
    'product_id', case when found then p.id else null end,
    'item_type', item_type_value,
    'quantity', qty,
    'total_amount', amount,
    'payment_status', pay_status,
    'new_stock', new_stock,
    'sold_out', sold_out
  );
end;
$$;

revoke all on function public.confirm_lead_sale(uuid, numeric, numeric, text, text) from public;
grant execute on function public.confirm_lead_sale(uuid, numeric, numeric, text, text) to authenticated;
