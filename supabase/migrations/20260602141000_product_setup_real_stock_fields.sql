-- VulaTrade product setup real-field sync
-- Run in Supabase after the Lead to Sale migration.
-- Purpose: future product saves must persist setup into real columns so stock deduction works reliably.

alter table public.products add column if not exists item_type text default 'standard_stock';
alter table public.products add column if not exists item_behaviour text default 'counter';
alter table public.products add column if not exists item_setup jsonb default '{}'::jsonb;
alter table public.products add column if not exists track_stock boolean default false;
alter table public.products add column if not exists stock_quantity numeric default null;
alter table public.products add column if not exists today_stock_quantity numeric default null;
alter table public.products add column if not exists today_stock_date date default current_date;
alter table public.products add column if not exists selling_today boolean default true;
alter table public.products add column if not exists show_when_sold_out boolean default true;
alter table public.products add column if not exists allow_preorders boolean default false;
alter table public.products add column if not exists duration_minutes numeric default null;
alter table public.products add column if not exists buffer_minutes numeric default null;
alter table public.products add column if not exists availability jsonb default null;
alter table public.products add column if not exists lead_time_days numeric default null;
alter table public.products add column if not exists max_orders_per_day numeric default null;
alter table public.products add column if not exists max_orders_per_week numeric default null;
alter table public.products add column if not exists deposit_required boolean default false;
alter table public.products add column if not exists deposit_amount numeric default null;
alter table public.products add column if not exists item_code text default null;
alter table public.products add column if not exists collection_available boolean default true;
alter table public.products add column if not exists delivery_available boolean default false;
alter table public.products add column if not exists customer_details_needed text default null;
alter table public.products add column if not exists is_sold_out boolean default false;
alter table public.products add column if not exists updated_at timestamptz default now();

create or replace function public.vula_item_behaviour(input_item_type text)
returns text
language sql
immutable
as $$
  select case
    when input_item_type in ('standard_stock', 'daily_stock') then 'counter'
    when input_item_type in ('service', 'made_to_order') then 'agreement'
    else 'counter'
  end;
$$;

create or replace function public.vula_setup_numeric(input_value text)
returns numeric
language plpgsql
immutable
as $$
begin
  if input_value is null or btrim(input_value) = '' then
    return null;
  end if;
  if btrim(input_value) ~ '^-?[0-9]+(\.[0-9]+)?$' then
    return btrim(input_value)::numeric;
  end if;
  return null;
end;
$$;

create or replace function public.vula_product_setup_meta(input_item_setup jsonb, input_variants jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  variant_meta jsonb := '{}'::jsonb;
begin
  if input_item_setup is not null and jsonb_typeof(input_item_setup) = 'object' and input_item_setup <> '{}'::jsonb then
    return input_item_setup;
  end if;

  select coalesce(variant->'meta', '{}'::jsonb)
  into variant_meta
  from jsonb_array_elements(coalesce(input_variants, '[]'::jsonb)) as variant
  where coalesce(variant->>'__vula_meta', 'false') = 'true'
  limit 1;

  return coalesce(variant_meta, '{}'::jsonb);
end;
$$;

create or replace function public.sync_product_setup_fields()
returns trigger
language plpgsql
as $$
declare
  setup jsonb := '{}'::jsonb;
  item_type_value text;
  bool_text text;
  numeric_value numeric;
begin
  setup := public.vula_product_setup_meta(new.item_setup, new.variants);

  if setup is not null and setup <> '{}'::jsonb then
    new.item_setup := setup;
  else
    setup := coalesce(new.item_setup, '{}'::jsonb);
  end if;

  item_type_value := coalesce(nullif(setup->>'item_type', ''), nullif(new.item_type, ''), 'standard_stock');
  if item_type_value not in ('standard_stock', 'daily_stock', 'service', 'made_to_order') then
    item_type_value := 'standard_stock';
  end if;

  new.item_type := item_type_value;
  new.item_behaviour := public.vula_item_behaviour(item_type_value);

  bool_text := setup->>'track_stock';
  if bool_text in ('true', 'false') then new.track_stock := bool_text::boolean; end if;
  if item_type_value = 'daily_stock' then new.track_stock := true; end if;
  if item_type_value in ('service', 'made_to_order') then new.track_stock := false; end if;

  numeric_value := public.vula_setup_numeric(setup->>'stock_quantity');
  if numeric_value is not null then new.stock_quantity := numeric_value; end if;

  numeric_value := public.vula_setup_numeric(setup->>'today_stock_quantity');
  if numeric_value is not null then new.today_stock_quantity := numeric_value; end if;

  if coalesce(setup->>'today_stock_date', '') ~ '^\d{4}-\d{2}-\d{2}$' then
    new.today_stock_date := (setup->>'today_stock_date')::date;
  elsif item_type_value = 'daily_stock' and new.today_stock_date is null then
    new.today_stock_date := current_date;
  end if;

  bool_text := setup->>'selling_today';
  if bool_text in ('true', 'false') then new.selling_today := bool_text::boolean; end if;

  bool_text := setup->>'show_when_sold_out';
  if bool_text in ('true', 'false') then new.show_when_sold_out := bool_text::boolean; end if;

  bool_text := setup->>'allow_preorders';
  if bool_text in ('true', 'false') then new.allow_preorders := bool_text::boolean; end if;

  numeric_value := public.vula_setup_numeric(setup->>'duration_minutes');
  if numeric_value is not null then new.duration_minutes := numeric_value; end if;

  numeric_value := public.vula_setup_numeric(setup->>'buffer_minutes');
  if numeric_value is not null then new.buffer_minutes := numeric_value; end if;

  if setup ? 'availability' then new.availability := setup->'availability'; end if;

  numeric_value := public.vula_setup_numeric(setup->>'lead_time_days');
  if numeric_value is not null then new.lead_time_days := numeric_value; end if;

  numeric_value := public.vula_setup_numeric(setup->>'max_orders_per_day');
  if numeric_value is not null then new.max_orders_per_day := numeric_value; end if;

  numeric_value := public.vula_setup_numeric(setup->>'max_orders_per_week');
  if numeric_value is not null then new.max_orders_per_week := numeric_value; end if;

  bool_text := setup->>'deposit_required';
  if bool_text in ('true', 'false') then new.deposit_required := bool_text::boolean; end if;

  numeric_value := public.vula_setup_numeric(setup->>'deposit_amount');
  if numeric_value is not null then new.deposit_amount := numeric_value; end if;

  if setup ? 'item_code' then new.item_code := nullif(setup->>'item_code', ''); end if;

  bool_text := setup->>'collection_available';
  if bool_text in ('true', 'false') then new.collection_available := bool_text::boolean; end if;

  bool_text := setup->>'delivery_available';
  if bool_text in ('true', 'false') then new.delivery_available := bool_text::boolean; end if;

  if setup ? 'customer_details_needed' then new.customer_details_needed := nullif(setup->>'customer_details_needed', ''); end if;

  if item_type_value = 'standard_stock' and coalesce(new.track_stock, false) and coalesce(new.stock_quantity, 0) <= 0 then
    new.is_sold_out := true;
  elsif item_type_value = 'daily_stock' and coalesce(new.today_stock_quantity, 0) <= 0 then
    new.is_sold_out := true;
  elsif item_type_value in ('standard_stock', 'daily_stock') then
    new.is_sold_out := false;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_product_setup_fields on public.products;
create trigger trg_sync_product_setup_fields
  before insert or update of item_setup, variants, description, item_type on public.products
  for each row
  execute function public.sync_product_setup_fields();

-- Backfill existing products from item_setup or the hidden meta variant.
update public.products
set item_setup = public.vula_product_setup_meta(item_setup, variants)
where public.vula_product_setup_meta(item_setup, variants) <> '{}'::jsonb;

-- Keep sale stock updates in sync with item_setup so UI fallback metadata does not show old stock.
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
  ) returning * into sale_row;

  if found and item_type_value = 'standard_stock' and coalesce(p.track_stock, false) then
    new_stock := greatest(coalesce(p.stock_quantity, 0) - qty, 0);
    sold_out := new_stock <= 0;
    update public.products
      set stock_quantity = new_stock,
          item_setup = jsonb_set(coalesce(item_setup, '{}'::jsonb), '{stock_quantity}', to_jsonb(new_stock), true),
          is_sold_out = sold_out,
          updated_at = now()
      where id = p.id;
  elsif found and item_type_value = 'daily_stock' then
    new_stock := greatest(coalesce(p.today_stock_quantity, 0) - qty, 0);
    sold_out := new_stock <= 0;
    update public.products
      set today_stock_quantity = new_stock,
          today_stock_date = current_date,
          item_setup = jsonb_set(jsonb_set(coalesce(item_setup, '{}'::jsonb), '{today_stock_quantity}', to_jsonb(new_stock), true), '{today_stock_date}', to_jsonb(current_date::text), true),
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
