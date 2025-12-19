-- =====================================================
-- MIGRAÇÃO: Campos para integração com Stripe
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Adicionar campos de Stripe na tabela tenants
DO $$ 
BEGIN
    -- ID do cliente no Stripe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE tenants ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- ID da assinatura ativa no Stripe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE tenants ADD COLUMN stripe_subscription_id TEXT;
    END IF;

    -- ID do preço/plano no Stripe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'stripe_price_id') THEN
        ALTER TABLE tenants ADD COLUMN stripe_price_id TEXT;
    END IF;

    -- Data do último pagamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'ultimo_pagamento') THEN
        ALTER TABLE tenants ADD COLUMN ultimo_pagamento TIMESTAMP;
    END IF;

    -- Status da assinatura (active, canceled, past_due, etc)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'subscription_status') THEN
        ALTER TABLE tenants ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;
END $$;

-- Criar índice para busca por stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);

-- Verificar
SELECT id, nome, plano, stripe_customer_id, stripe_subscription_id, subscription_status 
FROM tenants LIMIT 5;
