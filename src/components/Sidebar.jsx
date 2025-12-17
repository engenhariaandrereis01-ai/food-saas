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
    FolderOpen
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// Menu simplificado - apenas Produtos e Categorias por agora
const menuItems = [
    { path: '', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/produtos', icon: Package, label: 'Produtos' },
    { path: '/categorias', icon: FolderOpen, label: 'Categorias' },
]

export function Sidebar() {
    const location = useLocation()
    const basePath = '/dashboard'

    const handleLogout = async () => {
        // Limpar cache
        localStorage.removeItem('food_saas_tenant')
        localStorage.removeItem('food_saas_user_id')
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
            {/* Logo - fixo, sem dependência */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🍽️</span>
                    <div>
                        <h1 className="text-lg font-bold text-[#D4AF37]">Food SaaS</h1>
                        <p className="text-xs text-gray-400">Painel Admin</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
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
