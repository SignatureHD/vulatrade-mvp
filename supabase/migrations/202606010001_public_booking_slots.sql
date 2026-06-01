-- Public-safe booking lookup for public profile availability.
-- Returns only slot-blocking booking information, not customer details.

create or replace function public.get_public_booking_slots(input_business_id uuid)
returns table (
  booking_date date,
  booking_time text,
  status text,
  service text
)
language sql
security definer
set search_path = public
as $$
  select b.booking_date, b.booking_time, b.status, b.service
  from public.bookings b
  where b.business_id = input_business_id
    and coalesce(b.status, 'confirmed') <> 'cancelled'
    and b.booking_date >= current_date;
$$;

grant execute on function public.get_public_booking_slots(uuid) to anon, authenticated;
