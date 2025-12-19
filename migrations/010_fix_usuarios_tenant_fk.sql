-- =====================================================
-- MIGRAÇÃO IDEMPOTENTE: Correção Completa RLS e Foreign Keys
-- Execute no SQL Editor do Supabase
-- Este script é SEGURO para executar múltiplas vezes
-- =====================================================

-- ========== PARTE 1: VERIFICAR ESTADO ATUAL ==========

-- Ver todas as políticas atuais
SELECT 'POLÍTICAS ATUAIS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('usuarios_tenant', 'tenants')
ORDER BY tablename, policyname;

-- Ver foreign keys
SELECT 'FOREIGN KEYS:' as info;
SELECT 
    tc.constraint_name, 
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'usuarios_tenant' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- ========== PARTE 2: LIMPAR POLÍTICAS ANTIGAS ==========

-- Remover TODAS as políticas antigas de usuarios_tenant
DROP POLICY IF EXISTS "Usuarios tenant próprios" ON usuarios_tenant;
DROP POLICY IF EXISTS "Usuarios tenant insert" ON usuarios_tenant;
DROP POLICY IF EXISTS "Usuarios tenant select" ON usuarios_tenant;
DROP POLICY IF EXISTS "Usuarios tenant update" ON usuarios_tenant;
DROP POLICY IF EXISTS "Usuarios tenant delete" ON usuarios_tenant;
DROP POLICY IF EXISTS "usuarios_tenant_insert_policy" ON usuarios_tenant;
DROP POLICY IF EXISTS "usuarios_tenant_select_policy" ON usuarios_tenant;

-- Remover políticas antigas de tenants
DROP POLICY IF EXISTS "Tenants públicos para leitura" ON tenants;
DROP POLICY IF EXISTS "Tenants editáveis pelos donos" ON tenants;
DROP POLICY IF EXISTS "Tenants select publico" ON tenants;
DROP POLICY IF EXISTS "Tenants insert autenticado" ON tenants;
DROP POLICY IF EXISTS "Tenants update dono" ON tenants;
DROP POLICY IF EXISTS "Tenants delete dono" ON tenants;

-- ========== PARTE 3: CRIAR POLÍTICAS CORRETAS ==========

-- TENANTS: Leitura pública para tenants ativos
CREATE POLICY "tenants_select_public" ON tenants 
    FOR SELECT 
    USING (ativo = true);

-- TENANTS: Inserção para usuários autenticados (onboarding)
CREATE POLICY "tenants_insert_authenticated" ON tenants 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- TENANTS: Update para donos do tenant
CREATE POLICY "tenants_update_owner" ON tenants 
    FOR UPDATE 
    USING (
        id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
    );

-- TENANTS: Delete para donos do tenant
CREATE POLICY "tenants_delete_owner" ON tenants 
    FOR DELETE 
    USING (
        id IN (SELECT tenant_id FROM usuarios_tenant WHERE user_id = auth.uid())
    );

-- USUARIOS_TENANT: Insert para usuários autenticados
CREATE POLICY "usuarios_tenant_insert_authenticated" ON usuarios_tenant 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- USUARIOS_TENANT: Select próprios registros
CREATE POLICY "usuarios_tenant_select_own" ON usuarios_tenant 
    FOR SELECT 
    USING (user_id = auth.uid());

-- USUARIOS_TENANT: Update próprios registros
CREATE POLICY "usuarios_tenant_update_own" ON usuarios_tenant 
    FOR UPDATE 
    USING (user_id = auth.uid());

-- USUARIOS_TENANT: Delete próprios registros
CREATE POLICY "usuarios_tenant_delete_own" ON usuarios_tenant 
    FOR DELETE 
    USING (user_id = auth.uid());

-- ========== PARTE 4: VERIFICAR FOREIGN KEY ==========

-- Garantir que a FK aponta para auth.users
DO $$
DECLARE
    fk_exists BOOLEAN;
    fk_correct BOOLEAN;
BEGIN
    -- Verificar se FK existe e está correta
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'usuarios_tenant' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_schema = 'auth'
          AND ccu.table_name = 'users'
    ) INTO fk_correct;
    
    IF NOT fk_correct THEN
        RAISE NOTICE 'Foreign key precisa ser corrigida - execute manualmente:';
        RAISE NOTICE 'ALTER TABLE usuarios_tenant DROP CONSTRAINT IF EXISTS usuarios_tenant_user_id_fkey;';
        RAISE NOTICE 'ALTER TABLE usuarios_tenant ADD CONSTRAINT usuarios_tenant_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;';
    ELSE
        RAISE NOTICE 'Foreign key está correta: usuarios_tenant.user_id -> auth.users.id';
    END IF;
END $$;

-- ========== PARTE 5: LIMPAR DADOS ÓRFÃOS ==========

-- Remover tenants sem usuário vinculado (exceto demo)
DELETE FROM tenants 
WHERE id NOT IN (SELECT DISTINCT tenant_id FROM usuarios_tenant WHERE tenant_id IS NOT NULL)
  AND slug NOT IN ('demo');

-- ========== PARTE 6: VERIFICAÇÃO FINAL ==========

SELECT 'POLÍTICAS APÓS CORREÇÃO:' as info;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('usuarios_tenant', 'tenants')
ORDER BY tablename, policyname;

SELECT 'TENANTS EXISTENTES:' as info;
SELECT id, nome, slug, created_at FROM tenants;

SELECT 'USUÁRIOS-TENANT EXISTENTES:' as info;
SELECT ut.id, ut.tenant_id, ut.user_id, ut.role, t.nome as tenant_nome
FROM usuarios_tenant ut
LEFT JOIN tenants t ON ut.tenant_id = t.id;
