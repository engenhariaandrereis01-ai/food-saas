-- =====================================================
-- FIX: Permitir criação de novos tenants
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Remover políticas antigas de tenants
DROP POLICY IF EXISTS "Tenants públicos para leitura" ON tenants;
DROP POLICY IF EXISTS "Tenants editáveis pelos donos" ON tenants;
DROP POLICY IF EXISTS "Tenants visíveis para usuários autenticados" ON tenants;
DROP POLICY IF EXISTS "Tenants públicos por slug" ON tenants;

-- 2. Novas políticas para tenants

-- Permitir leitura pública de tenants ativos (para cardápio)
CREATE POLICY "Tenants leitura pública" ON tenants 
    FOR SELECT USING (ativo = true);

-- Permitir INSERT para qualquer usuário autenticado (onboarding)
CREATE POLICY "Tenants insert autenticado" ON tenants 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir UPDATE apenas para donos do tenant
CREATE POLICY "Tenants update pelo dono" ON tenants 
    FOR UPDATE USING (
        id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
    );

-- 3. Corrigir política de usuarios_tenant para permitir INSERT
DROP POLICY IF EXISTS "Usuários podem ver seus próprios registros" ON usuarios_tenant;

CREATE POLICY "Usuarios tenant select" ON usuarios_tenant 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuarios tenant insert" ON usuarios_tenant 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- Tente criar o restaurante novamente
-- =====================================================
