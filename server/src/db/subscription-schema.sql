CREATE TABLE IF NOT EXISTS public.product_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_sub VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  plan VARCHAR(20) NOT NULL DEFAULT 'trial',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  trial_start TIMESTAMP DEFAULT NOW(),
  trial_end TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_start TIMESTAMP DEFAULT NOW(),
  current_period_end TIMESTAMP,
  documents_used INTEGER DEFAULT 0,
  documents_limit INTEGER DEFAULT 5,
  questions_used INTEGER DEFAULT 0,
  questions_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_sub_keycloak ON public.product_subscriptions(keycloak_sub);
