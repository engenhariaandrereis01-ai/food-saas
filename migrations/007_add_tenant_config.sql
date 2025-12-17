-- =====================================================
-- MIGRAÇÃO: Adicionar colunas de configuração aos tenants
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Taxa de entrega padrão
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'taxa_entrega_padrao') THEN
        ALTER TABLE tenants ADD COLUMN taxa_entrega_padrao DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Pedido mínimo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'pedido_minimo') THEN
        ALTER TABLE tenants ADD COLUMN pedido_minimo DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Horário de abertura
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'horario_abertura') THEN
        ALTER TABLE tenants ADD COLUMN horario_abertura VARCHAR(10) DEFAULT '18:00';
    END IF;

    -- Horário de fechamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'horario_fechamento') THEN
        ALTER TABLE tenants ADD COLUMN horario_fechamento VARCHAR(10) DEFAULT '23:00';
    END IF;

    -- Endereço
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'endereco') THEN
        ALTER TABLE tenants ADD COLUMN endereco TEXT;
    END IF;
END $$;

-- Verificar colunas adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants'
ORDER BY ordinal_position;
