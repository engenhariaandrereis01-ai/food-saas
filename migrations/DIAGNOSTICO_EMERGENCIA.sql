-- =====================================================
-- DIAGNÓSTICO COMPLETO - Execute no SQL Editor do Supabase
-- COPIE TODO O RESULTADO E ME ENVIE
-- =====================================================

-- 1. STATUS DO RLS EM TODAS AS TABELAS
SELECT '=== 1. STATUS RLS ===' as section;
SELECT tablename, 
    CASE WHEN rowsecurity THEN 'ATIVO ❌' ELSE 'DESABILITADO ✅' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. TODAS AS POLÍTICAS RLS EXISTENTES
SELECT '=== 2. POLÍTICAS RLS ===' as section;
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. FOREIGN KEYS DA TABELA usuarios_tenant
SELECT '=== 3. FOREIGN KEYS usuarios_tenant ===' as section;
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'usuarios_tenant'::regclass
  AND contype = 'f';

-- 4. CONTAGEM DE DADOS
SELECT '=== 4. DADOS EXISTENTES ===' as section;
SELECT 'auth.users' as tabela, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'tenants' as tabela, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'usuarios_tenant' as tabela, COUNT(*) as count FROM usuarios_tenant;

-- 5. VERIFICAR SE HÁ TRIGGER QUE PODE INTERFERIR
SELECT '=== 5. TRIGGERS ===' as section;
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table;
