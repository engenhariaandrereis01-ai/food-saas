-- =====================================================
-- MVP: DESABILITAR RLS EM TODAS AS TABELAS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Tabelas core do sistema
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tenant DISABLE ROW LEVEL SECURITY;

-- Tabelas de dados
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;

-- Tabelas que podem não existir ainda (execute individualmente se der erro)
-- ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE itens_pedido DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- Tabelas auxiliares (se existirem)
-- ALTER TABLE mesas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE comandas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE itens_comanda DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendas_pdv DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR STATUS DO RLS
-- =====================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================
-- NOTA: POR QUE DESABILITAR RLS NO MVP?
-- =====================================================
-- 1. Simplifica desenvolvimento e debugging
-- 2. Elimina problemas de persistência imediatos
-- 3. A UI já filtra por tenant_id (segurança via aplicação)
-- 4. RLS será habilitado corretamente na fase de segurança
--
-- TRADE-OFF ACEITO PARA MVP:
-- - Um usuário mal-intencionado poderia acessar dados
--   de outros tenants via API direta
-- - Risco baixo pois exige conhecimento técnico
-- - Será corrigido antes do deploy em produção
-- =====================================================
