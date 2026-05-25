-- Stage 1 expense capture fields.
-- These fields let VulaTrade track who an expense was bought from,
-- which product/service it supported, and where a receipt/photo can be found.

alter table public.expenses
  add column if not exists supplier_name text,
  add column if not exists linked_product_id uuid references public.products(id) on delete set null,
  add column if not exists receipt_url text;

create index if not exists expenses_business_supplier_idx
  on public.expenses (business_id, supplier_name)
  where supplier_name is not null;

create index if not exists expenses_linked_product_idx
  on public.expenses (linked_product_id)
  where linked_product_id is not null;
