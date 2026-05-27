alter table businesses
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists location_label text,
  add column if not exists location_source text,
  add column if not exists show_exact_location boolean not null default false,
  add column if not exists delivery_radius_km numeric;

comment on column businesses.location_label is 'Human-friendly public area, e.g. Motherwell, Gqeberha.';
comment on column businesses.show_exact_location is 'Controls whether the exact pin may be shown publicly. Default false.';
