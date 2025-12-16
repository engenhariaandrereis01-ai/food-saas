import { supabase } from './supabase'

/**
 * Serviço para operações relacionadas a tenants
 */
export const tenantService = {
    /**
     * Buscar tenant pelo slug
     */
    async getBySlug(slug) {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', slug)
            .eq('ativo', true)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Buscar tenant pelo ID
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    /**
     * Criar novo tenant (onboarding)
     */
    async create(tenantData) {
        const { data, error } = await supabase
            .from('tenants')
            .insert({
                nome: tenantData.nome,
                slug: tenantData.slug,
                telefone: tenantData.telefone,
                whatsapp: tenantData.whatsapp,
                endereco: tenantData.endereco,
                cidade: tenantData.cidade,
                estado: tenantData.estado,
                cep: tenantData.cep,
                email: tenantData.email,
                plano: 'trial',
                plano_valido_ate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Atualizar tenant
     */
    async update(id, updates) {
        const { data, error } = await supabase
            .from('tenants')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Verificar se slug está disponível
     */
    async isSlugAvailable(slug) {
        const { data, error } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', slug)
            .single()

        if (error && error.code === 'PGRST116') {
            // Não encontrado = disponível
            return true
        }
        return false
    },

    /**
     * Associar usuário a tenant
     */
    async addUser(tenantId, userId, role = 'admin', nome = '') {
        const { data, error } = await supabase
            .from('usuarios_tenant')
            .insert({
                tenant_id: tenantId,
                user_id: userId,
                role,
                nome
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    /**
     * Obter tenant do usuário logado
     */
    async getCurrentUserTenant() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data, error } = await supabase
            .from('usuarios_tenant')
            .select('*, tenants(*)')
            .eq('user_id', user.id)
            .single()

        if (error) return null
        return data?.tenants
    },

    /**
     * Verificar se usuário pertence ao tenant
     */
    async userBelongsToTenant(userId, tenantId) {
        const { data, error } = await supabase
            .from('usuarios_tenant')
            .select('id')
            .eq('user_id', userId)
            .eq('tenant_id', tenantId)
            .single()

        return !!data && !error
    }
}

/**
 * Helper para fazer queries filtradas por tenant
 */
export function withTenant(query, tenantId) {
    if (!tenantId) {
        console.warn('withTenant: tenantId não fornecido')
        return query
    }
    return query.eq('tenant_id', tenantId)
}

/**
 * Helper para inserir dados com tenant_id
 */
export function withTenantInsert(data, tenantId) {
    if (!tenantId) {
        console.warn('withTenantInsert: tenantId não fornecido')
        return data
    }
    return { ...data, tenant_id: tenantId }
}

export default tenantService
