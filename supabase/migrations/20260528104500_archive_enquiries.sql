alter table public.enquiries
add column if not exists is_archived boolean not null default false,
add column if not exists archived_at timestamptz;

create index if not exists enquiries_is_archived_idx on public.enquiries(is_archived);
