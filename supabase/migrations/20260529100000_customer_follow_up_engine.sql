-- VulaTrade Customer Follow-Up Engine
-- Adds lightweight customer journey fields and prepares future per-business integrations.

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'new_enquiry',
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Keep existing customer records usable in the new follow-up screen.
UPDATE customers
SET stage = CASE
  WHEN stage IS NOT NULL THEN stage
  WHEN status = 'lead' THEN 'new_enquiry'
  WHEN status = 'new' THEN 'new_enquiry'
  WHEN status IN ('regular', 'vip') THEN 'repeat_customer'
  ELSE 'new_enquiry'
END
WHERE stage IS NULL;

UPDATE customers
SET last_contacted_at = last_contacted
WHERE last_contacted_at IS NULL
  AND last_contacted IS NOT NULL;

ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_stage_check;

ALTER TABLE customers
ADD CONSTRAINT customers_stage_check
CHECK (
  stage IN (
    'new_enquiry',
    'followed_up',
    'quote_sent',
    'payment_pending',
    'paid',
    'completed',
    'repeat_customer',
    'lost'
  )
);

CREATE INDEX IF NOT EXISTS idx_customers_business_stage
ON customers (business_id, stage);

CREATE INDEX IF NOT EXISTS idx_customers_last_contacted_at
ON customers (last_contacted_at);

-- Future-ready integration foundation. No UI is exposed for this yet.
CREATE TABLE IF NOT EXISTS business_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  last_error TEXT,
  last_synced_at TIMESTAMPTZ,
  connected_by UUID,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_integrations_business_id
ON business_integrations(business_id);

CREATE INDEX IF NOT EXISTS idx_business_integrations_business_provider
ON business_integrations(business_id, provider);

CREATE INDEX IF NOT EXISTS idx_business_integrations_expiry
ON business_integrations(token_expires_at)
WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_integrations_unique_active
ON business_integrations(business_id, provider)
WHERE status = 'active';
