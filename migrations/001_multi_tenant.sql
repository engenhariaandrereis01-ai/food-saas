-- =====================================================
-- FOOD SAAS - CRIAÇÃO COMPLETA DO BANCO DE DADOS
-- Execute este script no novo projeto Supabase
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

CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_tenant ON usuarios_tenant(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant_user ON usuarios_tenant(user_id);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON categorias(tenant_id);

-- 4. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    preco_promocional DECIMAL(10,2),
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_tenant ON produtos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);

-- 5. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    nome VARCHAR(200),
    telefone VARCHAR(20),
    email VARCHAR(200),
    endereco TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    cep VARCHAR(9),
    complemento TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);

-- 6. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    nome_cliente VARCHAR(200),
    itens TEXT,
    valor_total DECIMAL(10,2),
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    endereco_entrega TEXT,
    bairro VARCHAR(100),
    forma_pagamento VARCHAR(50),
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    modalidade VARCHAR(50) DEFAULT 'delivery',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_tenant ON pedidos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);

-- 7. TABELA DE MESAS
CREATE TABLE IF NOT EXISTS mesas (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    capacidade INTEGER DEFAULT 4,
    status VARCHAR(50) DEFAULT 'livre',
    qr_code_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mesas_tenant ON mesas(tenant_id);

-- 8. TABELA DE COMANDAS
CREATE TABLE IF NOT EXISTS comandas (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    mesa_id INTEGER REFERENCES mesas(id) ON DELETE SET NULL,
    garcom VARCHAR(100),
    status VARCHAR(50) DEFAULT 'aberta',
    valor_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comandas_tenant ON comandas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comandas_mesa ON comandas(mesa_id);

-- 9. TABELA DE ITENS DA COMANDA
CREATE TABLE IF NOT EXISTS itens_comanda (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    comanda_id INTEGER REFERENCES comandas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    nome_produto VARCHAR(200),
    quantidade INTEGER DEFAULT 1,
    preco_unitario DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_comanda_tenant ON itens_comanda(tenant_id);
CREATE INDEX IF NOT EXISTS idx_itens_comanda_comanda ON itens_comanda(comanda_id);

-- 10. TABELA DE CAIXA
CREATE TABLE IF NOT EXISTS caixa (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    valor_inicial DECIMAL(10,2) DEFAULT 0,
    valor_final DECIMAL(10,2),
    operador VARCHAR(100),
    status VARCHAR(50) DEFAULT 'aberto',
    data_abertura TIMESTAMP DEFAULT NOW(),
    data_fechamento TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_caixa_tenant ON caixa(tenant_id);

-- 11. TABELA DE VENDAS PDV
CREATE TABLE IF NOT EXISTS vendas_pdv (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    caixa_id INTEGER REFERENCES caixa(id) ON DELETE SET NULL,
    itens TEXT,
    total DECIMAL(10,2),
    forma_pagamento VARCHAR(50) DEFAULT 'dinheiro',
    desconto DECIMAL(10,2) DEFAULT 0,
    mesa_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendas_pdv_tenant ON vendas_pdv(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendas_pdv_caixa ON vendas_pdv(caixa_id);

-- 12. TABELA DE MOVIMENTAÇÕES DE CAIXA
CREATE TABLE IF NOT EXISTS movimentacoes_caixa (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    caixa_id INTEGER REFERENCES caixa(id) ON DELETE CASCADE,
    tipo VARCHAR(20) CHECK (tipo IN ('sangria', 'suprimento')),
    valor DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(200),
    operador VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_caixa_tenant ON movimentacoes_caixa(tenant_id);

-- 13. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    chave VARCHAR(100) NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, chave)
);

CREATE INDEX IF NOT EXISTS idx_configuracoes_tenant ON configuracoes(tenant_id);

-- 14. HABILITAR RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_comanda ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- 15. POLÍTICAS RLS - TENANTS
CREATE POLICY "Tenants públicos para leitura" ON tenants 
    FOR SELECT USING (ativo = true);

CREATE POLICY "Tenants editáveis pelos donos" ON tenants 
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM usuarios_tenant WHERE tenant_id = tenants.id
        )
    );

-- 16. POLÍTICAS RLS - PARA TODAS AS TABELAS COM TENANT_ID
-- Permitir leitura pública para cardápios
CREATE POLICY "Categorias públicas" ON categorias FOR SELECT USING (true);
CREATE POLICY "Produtos públicos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Mesas públicas" ON mesas FOR SELECT USING (true);

-- Permitir operações para usuários autenticados do tenant
CREATE POLICY "Categorias do tenant" ON categorias FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Produtos do tenant" ON produtos FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Clientes do tenant" ON clientes FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Pedidos públicos para insert" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Pedidos do tenant" ON pedidos FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
    OR true -- público para visualização
);
CREATE POLICY "Pedidos update do tenant" ON pedidos FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Mesas do tenant" ON mesas FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Comandas públicas para insert" ON comandas FOR INSERT WITH CHECK (true);
CREATE POLICY "Comandas do tenant" ON comandas FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
    OR true
);
CREATE POLICY "Itens comanda públicos" ON itens_comanda FOR ALL USING (true);
CREATE POLICY "Caixa do tenant" ON caixa FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Vendas PDV do tenant" ON vendas_pdv FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Movimentações do tenant" ON movimentacoes_caixa FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Configurações do tenant" ON configuracoes FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
);
CREATE POLICY "Usuarios tenant próprios" ON usuarios_tenant FOR SELECT USING (
    user_id = auth.uid()
);

-- 17. TRIGGER PARA ATUALIZAR VALOR TOTAL DA COMANDA
CREATE OR REPLACE FUNCTION atualizar_total_comanda()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE comandas 
    SET valor_total = (
        SELECT COALESCE(SUM(preco_unitario * quantidade), 0)
        FROM itens_comanda 
        WHERE comanda_id = NEW.comanda_id
    )
    WHERE id = NEW.comanda_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_total_comanda ON itens_comanda;
CREATE TRIGGER trigger_atualizar_total_comanda
    AFTER INSERT OR UPDATE OR DELETE ON itens_comanda
    FOR EACH ROW EXECUTE FUNCTION atualizar_total_comanda();

-- 18. CRIAR TENANT DEMO PARA TESTES
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

-- 19. CRIAR CATEGORIAS DEMO
INSERT INTO categorias (tenant_id, nome, ordem)
SELECT id, 'Lanches', 1 FROM tenants WHERE slug = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO categorias (tenant_id, nome, ordem)
SELECT id, 'Bebidas', 2 FROM tenants WHERE slug = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO categorias (tenant_id, nome, ordem)
SELECT id, 'Sobremesas', 3 FROM tenants WHERE slug = 'demo'
ON CONFLICT DO NOTHING;

-- 20. CRIAR PRODUTOS DEMO
INSERT INTO produtos (tenant_id, categoria_id, nome, descricao, preco)
SELECT 
    t.id,
    c.id,
    'X-Burger',
    'Hambúrguer artesanal com queijo e salada',
    25.90
FROM tenants t
JOIN categorias c ON c.tenant_id = t.id AND c.nome = 'Lanches'
WHERE t.slug = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO produtos (tenant_id, categoria_id, nome, descricao, preco)
SELECT 
    t.id,
    c.id,
    'Coca-Cola 350ml',
    'Refrigerante gelado',
    6.00
FROM tenants t
JOIN categorias c ON c.tenant_id = t.id AND c.nome = 'Bebidas'
WHERE t.slug = 'demo'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- =====================================================
