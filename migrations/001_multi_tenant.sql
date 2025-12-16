-- =====================================================
-- FOOD SAAS - FASE 1: MODELO MULTI-TENANT
-- Execute este script em um NOVO projeto Supabase
-- =====================================================

-- 1. TABELA DE TENANTS (RESTAURANTES)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    cor_primaria VARCHAR(7) DEFAULT '#D4AF37',
    cor_secundaria VARCHAR(7) DEFAULT '#1a1a1a',
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    email VARCHAR(200),
    ativo BOOLEAN DEFAULT true,
    plano VARCHAR(50) DEFAULT 'trial',
    plano_valido_ate TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
    horario_abertura TIME DEFAULT '10:00',
    horario_fechamento TIME DEFAULT '23:00',
    taxa_entrega_padrao DECIMAL(10,2) DEFAULT 5.00,
    pedido_minimo DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- 2. TABELA DE USUÁRIOS POR TENANT
CREATE TABLE IF NOT EXISTS usuarios_tenant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin',
    nome VARCHAR(200),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_tenant ON usuarios_tenant(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_user ON usuarios_tenant(user_id);

-- 3. ADICIONAR tenant_id NAS TABELAS EXISTENTES

-- Categorias
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON categorias(tenant_id);

-- Produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_produtos_tenant ON produtos(tenant_id);

-- Pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pedidos_tenant ON pedidos(tenant_id);

-- Mesas
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_mesas_tenant ON mesas(tenant_id);

-- Comandas
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comandas_tenant ON comandas(tenant_id);

-- Itens Comanda
ALTER TABLE itens_comanda ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_itens_comanda_tenant ON itens_comanda(tenant_id);

-- Caixa
ALTER TABLE caixa ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_caixa_tenant ON caixa(tenant_id);

-- Vendas PDV
ALTER TABLE vendas_pdv ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_vendas_pdv_tenant ON vendas_pdv(tenant_id);

-- Movimentações Caixa
ALTER TABLE movimentacoes_caixa ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_tenant ON movimentacoes_caixa(tenant_id);

-- Clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id);

-- Configurações
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_configuracoes_tenant ON configuracoes(tenant_id);

-- 4. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tenant ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS PARA TENANTS
DROP POLICY IF EXISTS "Tenants visíveis para usuários autenticados" ON tenants;
DROP POLICY IF EXISTS "Tenants públicos por slug" ON tenants;

CREATE POLICY "Tenants visíveis para usuários autenticados" ON tenants 
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM usuarios_tenant WHERE tenant_id = tenants.id
        )
    );

CREATE POLICY "Tenants públicos por slug" ON tenants 
    FOR SELECT USING (ativo = true);

-- 6. POLÍTICAS RLS PARA USUARIOS_TENANT
DROP POLICY IF EXISTS "Usuários podem ver seus próprios registros" ON usuarios_tenant;

CREATE POLICY "Usuários podem ver seus próprios registros" ON usuarios_tenant 
    FOR SELECT USING (user_id = auth.uid());

-- 7. FUNÇÃO PARA OBTER TENANT_ID DO USUÁRIO LOGADO
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM usuarios_tenant 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRIAR TENANT DE EXEMPLO PARA TESTES
INSERT INTO tenants (nome, slug, telefone, whatsapp, endereco, cidade, estado, email)
VALUES (
    'Restaurante Demo',
    'demo',
    '(11) 99999-9999',
    '11999999999',
    'Rua Exemplo, 123 - Centro',
    'São Paulo',
    'SP',
    'contato@demo.com'
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- Próximo passo: Criar um usuário e associar ao tenant
-- =====================================================
