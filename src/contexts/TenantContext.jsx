import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
    const [tenant, setTenant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Detectar tenant pelo slug na URL
    const detectTenantFromUrl = () => {
        const pathParts = window.location.pathname.split('/')
        // URL pattern: /:slug/cardapio or /:slug/garcom
        if (pathParts.length >= 2 && pathParts[1]) {
            const potentialSlug = pathParts[1]
            // Ignorar rotas conhecidas que não são slugs
            const knownRoutes = ['login', 'register', 'admin', 'dashboard', 'onboarding']
            if (!knownRoutes.includes(potentialSlug)) {
                return potentialSlug
            }
        }
        return null
    }

    // Carregar tenant pelo slug
    const loadTenantBySlug = async (slug) => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug)
                .eq('ativo', true)
                .single()

            if (fetchError) {
                console.error('Erro ao carregar tenant:', fetchError)
                setError('Restaurante não encontrado')
                setTenant(null)
            } else {
                setTenant(data)
                // Aplicar cores do tenant
                applyTenantTheme(data)
            }
        } catch (err) {
            console.error('Erro:', err)
            setError('Erro ao carregar restaurante')
        } finally {
            setLoading(false)
        }
    }

    // Carregar tenant pelo ID do usuário logado
    const loadTenantByUser = async (userId) => {
        try {
            setLoading(true)

            const { data: userTenant, error: userError } = await supabase
                .from('usuarios_tenant')
                .select('tenant_id, tenants(*)')
                .eq('user_id', userId)
                .single()

            if (userError) {
                console.error('Usuário não associado a tenant:', userError)
                setTenant(null)
            } else if (userTenant?.tenants) {
                setTenant(userTenant.tenants)
                applyTenantTheme(userTenant.tenants)
            }
        } catch (err) {
            console.error('Erro:', err)
        } finally {
            setLoading(false)
        }
    }

    // Aplicar tema/cores do tenant
    const applyTenantTheme = (tenantData) => {
        if (!tenantData) return

        const root = document.documentElement
        root.style.setProperty('--cor-primaria', tenantData.cor_primaria || '#D4AF37')
        root.style.setProperty('--cor-secundaria', tenantData.cor_secundaria || '#1a1a1a')

        // Atualizar título da página
        if (tenantData.nome) {
            document.title = tenantData.nome
        }

        // Atualizar favicon se houver logo
        if (tenantData.logo_url) {
            const favicon = document.querySelector('link[rel="icon"]')
            if (favicon) {
                favicon.href = tenantData.logo_url
            }
        }
    }

    // Efeito inicial: detectar tenant
    useEffect(() => {
        const slug = detectTenantFromUrl()

        if (slug) {
            loadTenantBySlug(slug)
        } else {
            // Verificar se há usuário logado
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    loadTenantByUser(session.user.id)
                } else {
                    setLoading(false)
                }
            })
        }
    }, [])

    // Escutar mudanças de autenticação
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const slug = detectTenantFromUrl()
                    if (!slug) {
                        loadTenantByUser(session.user.id)
                    }
                } else if (event === 'SIGNED_OUT') {
                    setTenant(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const value = {
        tenant,
        loading,
        error,
        tenantId: tenant?.id,
        tenantSlug: tenant?.slug,
        tenantNome: tenant?.nome,
        isLoaded: !loading,
        refreshTenant: () => {
            const slug = detectTenantFromUrl()
            if (slug) loadTenantBySlug(slug)
        }
    }

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext)
    if (!context) {
        throw new Error('useTenant deve ser usado dentro de TenantProvider')
    }
    return context
}

export default TenantContext
