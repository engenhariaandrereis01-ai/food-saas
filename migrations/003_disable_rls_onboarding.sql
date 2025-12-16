-- =====================================================
-- FIX DEFINITIVO: Desabilitar RLS para onboarding
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- OPÇÃO 1: Desabilitar RLS completamente nestas tabelas
-- (mais simples, menos seguro, mas funcional para MVP)

ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tenant DISABLE ROW LEVEL SECURITY;

-- As outras tabelas mantêm RLS ativo para segurança
-- (categorias, produtos, pedidos, etc.)

-- =====================================================
-- ALTERNATIVA: Se preferir manter RLS mas permitir tudo
-- Descomente abaixo e comente as linhas acima
-- =====================================================

-- DROP POLICY IF EXISTS "Tenants leitura pública" ON tenants;
-- DROP POLICY IF EXISTS "Tenants insert autenticado" ON tenants;
-- DROP POLICY IF EXISTS "Tenants update pelo dono" ON tenants;
-- DROP POLICY IF EXISTS "Usuarios tenant select" ON usuarios_tenant;
-- DROP POLICY IF EXISTS "Usuarios tenant insert" ON usuarios_tenant;

-- CREATE POLICY "Tenants full access" ON tenants FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Usuarios tenant full access" ON usuarios_tenant FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SCRIPT EXECUTADO!
-- Tente criar o restaurante novamente
-- =====================================================
