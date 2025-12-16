-- =====================================================
-- CONFIGURAR SUPABASE STORAGE PARA PRODUTOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar bucket para produtos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acesso ao bucket de produtos

-- Permitir leitura pública (para exibir no cardápio)
DROP POLICY IF EXISTS "Produtos leitura publica" ON storage.objects;
CREATE POLICY "Produtos leitura publica" ON storage.objects
    FOR SELECT USING (bucket_id = 'produtos');

-- Permitir upload por usuários autenticados
DROP POLICY IF EXISTS "Produtos upload autenticado" ON storage.objects;
CREATE POLICY "Produtos upload autenticado" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'produtos' 
        AND auth.uid() IS NOT NULL
    );

-- Permitir delete por usuários autenticados
DROP POLICY IF EXISTS "Produtos delete autenticado" ON storage.objects;
CREATE POLICY "Produtos delete autenticado" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'produtos' 
        AND auth.uid() IS NOT NULL
    );

-- =====================================================
-- SCRIPT EXECUTADO!
-- Agora você pode fazer upload de imagens de produtos
-- =====================================================
