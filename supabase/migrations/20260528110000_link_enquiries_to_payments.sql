alter table public.enquiries
add column if not exists sale_payment_id uuid references public.payments(id) on delete set null;

create index if not exists enquiries_sale_payment_id_idx on public.enquiries(sale_payment_id);
