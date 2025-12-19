-- =====================================================
-- MIGRAÇÃO 011: CORREÇÃO DEFINITIVA DA FOREIGN KEY
-- Execute no SQL Editor do Supabase
-- Este script é IDEMPOTENTE - seguro para executar múltiplas vezes
-- =====================================================

-- ========== PASSO 1: DIAGNÓSTICO ==========
-- Verificar estado atual da foreign key

SELECT '=== DIAGNÓSTICO: FOREIGN KEY ATUAL ===' as info;

SELECT 
    tc.constraint_name as constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_schema,
    ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'usuarios_tenant' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- ========== PASSO 2: REMOVER FK INCORRETA ==========

SELECT '=== REMOVENDO FOREIGN KEY INCORRETA ===' as info;

ALTER TABLE usuarios_tenant 
DROP CONSTRAINT IF EXISTS usuarios_tenant_user_id_fkey;

-- ========== PASSO 3: CRIAR FK CORRETA ==========

SELECT '=== CRIANDO FOREIGN KEY CORRETA (auth.users) ===' as info;

ALTER TABLE usuarios_tenant
ADD CONSTRAINT usuarios_tenant_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========== PASSO 4: GARANTIR RLS DESABILITADO (MVP) ==========
-- RLS desabilitado para simplificar o MVP
-- Será habilitado corretamente antes de ir para produção

SELECT '=== GARANTINDO RLS DESABILITADO (MVP) ===' as info;

ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tenant DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE comandas DISABLE ROW LEVEL SECURITY;
ALTER TABLE itens_comanda DISABLE ROW LEVEL SECURITY;
ALTER TABLE caixa DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_pdv DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- ========== PASSO 5: LIMPAR DADOS ÓRFÃOS ==========

SELECT '=== LIMPANDO TENANTS ÓRFÃOS ===' as info;

-- Contar órfãos antes
SELECT 'Tenants órfãos (serão removidos):' as info, COUNT(*) as count
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM usuarios_tenant ut WHERE ut.tenant_id = t.id)
  AND t.slug != 'demo';

-- Remover órfãos
DELETE FROM tenants 
WHERE id NOT IN (SELECT DISTINCT tenant_id FROM usuarios_tenant WHERE tenant_id IS NOT NULL)
  AND slug NOT IN ('demo');

-- ========== PASSO 6: VERIFICAÇÃO FINAL ==========

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar FK corrigida
SELECT 
    tc.constraint_name,
    ccu.table_schema AS foreign_schema,
    ccu.table_name AS foreign_table,
    CASE 
        WHEN ccu.table_schema = 'auth' AND ccu.table_name = 'users' 
        THEN '✅ CORRETO' 
        ELSE '❌ INCORRETO' 
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'usuarios_tenant' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Verificar RLS desabilitado
SELECT tablename, 
    CASE WHEN rowsecurity THEN '❌ ATIVO' ELSE '✅ DESABILITADO' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'usuarios_tenant', 'produtos', 'categorias')
ORDER BY tablename;

-- Contar registros
SELECT 'Tenants ativos:' as info, COUNT(*) as count FROM tenants WHERE ativo = true;
SELECT 'Usuários vinculados:' as info, COUNT(*) as count FROM usuarios_tenant;

-- =====================================================
-- SCRIPT FINALIZADO!
-- Se todas as verificações mostram ✅, está pronto.
-- Tente criar o restaurante novamente no onboarding.
-- =====================================================
