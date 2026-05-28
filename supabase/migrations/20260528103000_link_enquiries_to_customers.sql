alter table public.enquiries
add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists enquiries_customer_id_idx on public.enquiries(customer_id);
