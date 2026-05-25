-- Stage 1: Where you sell
-- Optional social/selling channel links saved from Setup.

alter table public.businesses
  add column if not exists facebook_url text,
  add column if not exists facebook_marketplace_url text,
  add column if not exists tiktok_url text,
  add column if not exists instagram_url text,
  add column if not exists google_business_url text,
  add column if not exists website_url text;
