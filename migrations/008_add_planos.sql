-- =====================================================
-- MIGRAÇÃO: Adicionar sistema de planos aos tenants
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Adicionar colunas de plano
DO $$ 
BEGIN
    -- Plano atual (trial, basico, pro)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'plano') THEN
        ALTER TABLE tenants ADD COLUMN plano VARCHAR(20) DEFAULT 'trial';
    END IF;

    -- Data de início do trial
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'trial_inicio') THEN
        ALTER TABLE tenants ADD COLUMN trial_inicio TIMESTAMP DEFAULT NOW();
    END IF;

    -- Data de fim do trial (14 dias após início)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'trial_fim') THEN
        ALTER TABLE tenants ADD COLUMN trial_fim TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days');
    END IF;

    -- Assinatura ativa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'assinatura_ativa') THEN
        ALTER TABLE tenants ADD COLUMN assinatura_ativa BOOLEAN DEFAULT false;
    END IF;

    -- Limite de produtos por plano
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'limite_produtos') THEN
        ALTER TABLE tenants ADD COLUMN limite_produtos INTEGER DEFAULT 20;
    END IF;

    -- Data próximo pagamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'proxima_cobranca') THEN
        ALTER TABLE tenants ADD COLUMN proxima_cobranca TIMESTAMP;
    END IF;
END $$;

-- Atualizar tenants existentes para trial
UPDATE tenants 
SET plano = 'trial', 
    trial_inicio = COALESCE(created_at, NOW()),
    trial_fim = COALESCE(created_at, NOW()) + INTERVAL '14 days'
WHERE plano IS NULL;

-- Verificar
SELECT id, nome, plano, trial_inicio, trial_fim, assinatura_ativa 
FROM tenants;
