import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Package, FolderOpen, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Dashboard() {
    const [stats, setStats] = useState({ produtos: 0, categorias: 0 })
    const [tenantNome, setTenantNome] = useState('Seu Restaurante')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { setLoading(false); return }

                // Buscar tenant
                const { data: ut } = await supabase
                    .from('usuarios_tenant')
                    .select('tenant_id, tenants(nome)')
                    .eq('user_id', user.id)
                    .limit(1)

                if (ut?.[0]?.tenants?.nome) {
                    setTenantNome(ut[0].tenants.nome)
                }

                const tenantId = ut?.[0]?.tenant_id
                if (!tenantId) { setLoading(false); return }

                // Contar produtos e categorias
                const [prodRes, catRes] = await Promise.all([
                    supabase.from('produtos').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
                    supabase.from('categorias').select('id', { count: 'exact' }).eq('tenant_id', tenantId)
                ])

                setStats({
                    produtos: prodRes.count || 0,
                    categorias: catRes.count || 0
                })
            } catch (err) {
                console.error('Erro:', err)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Olá! 👋</h1>
                <p className="text-gray-400">Bem-vindo ao painel de <span className="text-[#D4AF37]">{tenantNome}</span></p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                            <Package className="text-[#D4AF37]" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Produtos</p>
                            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.produtos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <FolderOpen className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Categorias</p>
                            <p className="text-2xl font-bold text-white">{loading ? '...' : stats.categorias}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <TrendingUp className="text-green-400" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <p className="text-lg font-bold text-green-400">Ativo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/dashboard/produtos"
                        className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
                            <Plus className="text-[#D4AF37]" size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Adicionar Produto</p>
                            <p className="text-sm text-gray-400">Cadastre novos produtos</p>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/categorias"
                        className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Plus className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Adicionar Categoria</p>
                            <p className="text-sm text-gray-400">Organize seus produtos</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-xl p-6 border border-[#D4AF37]/20">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">🚀 Próximos Passos</h3>
                <ul className="text-gray-300 space-y-2">
                    <li>1. Crie suas <strong>categorias</strong> (ex: Bebidas, Pizzas, Sobremesas)</li>
                    <li>2. Adicione seus <strong>produtos</strong> com fotos e preços</li>
                    <li>3. Compartilhe seu cardápio digital com seus clientes!</li>
                </ul>
            </div>
        </div>
    )
}
