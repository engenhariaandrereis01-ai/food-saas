import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    BarChart3,
    LogOut,
    ShoppingCart,
    QrCode,
    UtensilsCrossed,
    Package,
    FolderOpen,
    Settings,
    CreditCard,
    MonitorPlay,
    Armchair,
    FileText
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTenant } from '../contexts/TenantContext'

export function Sidebar() {
    const location = useLocation()
    const { tenant } = useTenant()
    const basePath = '/dashboard'

    // Definir quais itens aparecem para quais planos
    // null = todos
    const menuItems = [
        {
            path: '',
            icon: LayoutDashboard,
            label: 'Dashboard',
            minPlan: null
        },
        {
            path: '/pedidos',
            icon: ClipboardList,
            label: 'Pedidos',
            minPlan: null
        },
        {
            path: '/pdv',
            icon: MonitorPlay,
            label: 'PDV (Caixa)',
            minPlan: 'basico'
        },
        {
            path: '/mesas',
            icon: Armchair,
            label: 'Mesas',
            minPlan: 'basico'
        },
        {
            path: '/comandas',
            icon: FileText,
            label: 'Comandas',
            minPlan: 'basico'
        },
        {
            path: '/produtos',
            icon: Package,
            label: 'Produtos',
            minPlan: null
        },
        {
            path: '/categorias',
            icon: FolderOpen,
            label: 'Categorias',
            minPlan: null
        },
        {
            path: '/clientes',
            icon: Users,
            label: 'Clientes',
            minPlan: 'pro'
        },
        {
            path: '/relatorios',
            icon: BarChart3,
            label: 'Relatórios',
            minPlan: 'pro'
        },
        {
            path: '/configuracoes',
            icon: Settings,
            label: 'Configurações',
            minPlan: null
        },
        {
            path: '/billing',
            icon: CreditCard,
            label: 'Planos',
            minPlan: null
        },
    ]

    const handleLogout = async () => {
        // Limpar cache
        localStorage.removeItem('food_saas_tenant')
        localStorage.removeItem('food_saas_user_id')
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    // Função auxiliar para verificar permissão
    const checkPermission = (minPlan) => {
        if (!minPlan) return true
        if (!tenant?.plano || tenant.plano === 'trial') return false // Trial tem acesso limitado por enquanto

        const levels = { 'trial': 0, 'basico': 1, 'pro': 2 }
        const currentLevel = levels[tenant.plano] || 0
        const requiredLevel = levels[minPlan] || 100

        return currentLevel >= requiredLevel
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🍽️</span>
                    <div>
                        <h1 className="text-lg font-bold text-[#D4AF37]">Food SaaS</h1>
                        <p className="text-xs text-gray-400">
                            {tenant?.nome ? tenant.nome.substring(0, 20) : 'Painel Admin'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        // Verificar permissão
                        if (!checkPermission(item.minPlan)) return null

                        const fullPath = basePath + item.path
                        const isActive = location.pathname === fullPath ||
                            (item.path === '' && location.pathname === basePath)

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={fullPath}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <div className="mb-4 px-4 py-2 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Plano Atual</p>
                    <p className="text-sm font-bold text-[#D4AF37] capitalize">
                        {tenant?.plano === 'pro' ? 'Profissional' : tenant?.plano || 'Carregando...'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    )
}
