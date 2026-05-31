-- Align Customers, Enquiries and Follow-Ups around one customer journey.
-- Customers hold the truth through customers.stage.

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'new_enquiry',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

UPDATE customers
SET tags = ARRAY(SELECT DISTINCT unnest(tags || ARRAY['Regular']))
WHERE status = 'regular'
  AND NOT ('Regular' = ANY(tags));

UPDATE customers
SET tags = ARRAY(SELECT DISTINCT unnest(tags || ARRAY['VIP']))
WHERE status = 'vip'
  AND NOT ('VIP' = ANY(tags));

UPDATE customers
SET tags = ARRAY(SELECT DISTINCT unnest(tags || ARRAY['Nurture later']))
WHERE status = 'lost'
  AND NOT ('Nurture later' = ANY(tags));

UPDATE customers
SET stage = CASE
  WHEN stage IN ('new_enquiry','followed_up','price_sent','booking_requested','booked','payment_pending','paid','completed','lost') THEN stage
  WHEN stage = 'quote_sent' THEN 'price_sent'
  WHEN stage = 'repeat_customer' THEN 'new_enquiry'
  WHEN status IN ('lead','new','interested') THEN 'new_enquiry'
  WHEN status IN ('replied','follow_up','followed_up') THEN 'followed_up'
  WHEN status IN ('quoted','quote_sent','price_sent') THEN 'price_sent'
  WHEN status IN ('waiting_payment','payment_pending') THEN 'payment_pending'
  WHEN status = 'booked' THEN 'booked'
  WHEN status = 'paid' THEN 'paid'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'lost' THEN 'lost'
  ELSE 'new_enquiry'
END;

-- Keep status as a legacy mirror for now, but use stage as the source of truth in the app.
UPDATE customers
SET status = stage
WHERE stage IN ('new_enquiry','followed_up','price_sent','booking_requested','booked','payment_pending','paid','completed','lost');

ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_stage_check;

ALTER TABLE customers
ADD CONSTRAINT customers_stage_check
CHECK (
  stage IN (
    'new_enquiry',
    'followed_up',
    'price_sent',
    'booking_requested',
    'booked',
    'payment_pending',
    'paid',
    'completed',
    'lost'
  )
);

CREATE INDEX IF NOT EXISTS idx_customers_business_stage
ON customers (business_id, stage);
