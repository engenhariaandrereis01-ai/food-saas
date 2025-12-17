import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook robusto para sempre obter o tenant do usuário logado.
 * 
 * Este hook:
 * - Busca o tenant diretamente do banco (não depende do context)
 * - Cacheia o tenant no localStorage para evitar re-fetches
 * - Retorna loading state para que componentes possam esperar
 * - Re-busca se necessário
 * 
 * @returns {{ tenantId: string|null, tenant: object|null, loading: boolean, error: string|null, refetch: function }}
 */
export function useCurrentTenant() {
    const [tenant, setTenant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Chave do localStorage
    const CACHE_KEY = 'food_saas_tenant'
    const CACHE_USER_KEY = 'food_saas_user_id'

    const fetchTenant = async (forceRefresh = false) => {
        setLoading(true)
        setError(null)

        try {
            // 1. Verificar se há usuário logado
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.log('[useCurrentTenant] Nenhum usuário logado')
                setTenant(null)
                setLoading(false)
                return
            }

            // 2. Verificar cache (se o usuário não mudou)
            const cachedUserId = localStorage.getItem(CACHE_USER_KEY)
            const cachedTenant = localStorage.getItem(CACHE_KEY)

            if (!forceRefresh && cachedUserId === user.id && cachedTenant) {
                const parsed = JSON.parse(cachedTenant)
                console.log('[useCurrentTenant] Usando cache:', parsed.nome)
                setTenant(parsed)
                setLoading(false)
                return
            }

            // 3. Buscar do banco
            console.log('[useCurrentTenant] Buscando tenant para user:', user.id)

            const { data, error: fetchError } = await supabase
                .from('usuarios_tenant')
                .select('tenant_id, tenants(*)')
                .eq('user_id', user.id)
                .single()

            if (fetchError) {
                console.error('[useCurrentTenant] Erro ao buscar tenant:', fetchError)
                setError('Não foi possível carregar o restaurante')
                setTenant(null)
                localStorage.removeItem(CACHE_KEY)
                localStorage.removeItem(CACHE_USER_KEY)
            } else if (data?.tenants) {
                console.log('[useCurrentTenant] Tenant encontrado:', data.tenants.nome)
                setTenant(data.tenants)
                // Salvar no cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(data.tenants))
                localStorage.setItem(CACHE_USER_KEY, user.id)
            } else {
                console.warn('[useCurrentTenant] Usuário sem tenant associado')
                setError('Usuário não associado a nenhum restaurante')
                setTenant(null)
            }
        } catch (err) {
            console.error('[useCurrentTenant] Erro:', err)
            setError('Erro ao carregar restaurante')
        } finally {
            setLoading(false)
        }
    }

    // Buscar tenant ao montar
    useEffect(() => {
        fetchTenant()
    }, [])

    // Escutar mudanças de auth
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN') {
                    // Novo login - buscar tenant
                    fetchTenant(true)
                } else if (event === 'SIGNED_OUT') {
                    // Logout - limpar cache
                    setTenant(null)
                    localStorage.removeItem(CACHE_KEY)
                    localStorage.removeItem(CACHE_USER_KEY)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return {
        tenant,
        tenantId: tenant?.id || null,
        tenantSlug: tenant?.slug || null,
        loading,
        error,
        refetch: () => fetchTenant(true)
    }
}

/**
 * Hook que espera o tenant estar disponível antes de retornar.
 * Útil para componentes que precisam do tenant para funcionar.
 * 
 * @returns {{ tenantId: string, tenant: object, isReady: boolean }}
 */
export function useRequiredTenant() {
    const { tenant, tenantId, loading, error, refetch } = useCurrentTenant()

    return {
        tenant,
        tenantId,
        isReady: !loading && !!tenantId,
        isLoading: loading,
        error,
        refetch
    }
}
