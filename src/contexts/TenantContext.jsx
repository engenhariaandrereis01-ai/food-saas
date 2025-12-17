import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TenantContext = createContext(null)

/**
 * TenantProvider Simplificado
 * 
 * Este provider:
 * - Não quebra se falhar ao buscar tenant
 * - Retorna valores default se não encontrar
 * - É tolerante a erros
 */
export function TenantProvider({ children }) {
    const [tenant, setTenant] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadTenant = async () => {
            try {
                // Verificar se há usuário logado
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setLoading(false)
                    return
                }

                // Buscar tenant do usuário
                const { data } = await supabase
                    .from('usuarios_tenant')
                    .select('tenant_id, tenants(*)')
                    .eq('user_id', user.id)
                    .limit(1)

                if (data?.[0]?.tenants) {
                    setTenant(data[0].tenants)
                }
            } catch (err) {
                console.error('[TenantContext] Erro ao carregar tenant:', err)
                // NÃO quebra - apenas não tem tenant
            } finally {
                setLoading(false)
            }
        }

        loadTenant()

        // Escutar mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'SIGNED_OUT') {
                    setTenant(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // Valores seguros - sempre retorna algo, nunca undefined
    const value = {
        tenant: tenant || null,
        tenantId: tenant?.id || null,
        tenantSlug: tenant?.slug || null,
        tenantNome: tenant?.nome || 'Restaurante',
        loading,
        isLoaded: !loading
    }

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext)

    // Retorna valores default se não houver context
    if (!context) {
        return {
            tenant: null,
            tenantId: null,
            tenantSlug: null,
            tenantNome: 'Restaurante',
            loading: false,
            isLoaded: true
        }
    }

    return context
}

export default TenantContext
