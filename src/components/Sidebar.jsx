import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    BarChart3,
    LogOut,
    ShoppingCart,
    QrCode,
    UtensilsCrossed
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTenant } from '../contexts/TenantContext'

const menuItems = [
    { path: '', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pdv', icon: ShoppingCart, label: 'PDV' },
    { path: '/pedidos', icon: ClipboardList, label: 'Pedidos' },
    { path: '/comandas', icon: UtensilsCrossed, label: 'Comandas' },
    { path: '/mesas', icon: QrCode, label: 'Mesas' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
]

export function Sidebar() {
    const { tenant, tenantSlug } = useTenant()
    const location = useLocation()

    // Determinar o base path (se tem slug ou não)
    const basePath = tenantSlug ? `/${tenantSlug}/dashboard` : '/dashboard'

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
            {/* Logo - dinâmico por tenant */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    {tenant?.logo_url ? (
                        <img src={tenant.logo_url} alt={tenant.nome} className="w-10 h-10 rounded-lg" />
                    ) : (
                        <span className="text-3xl">🍽️</span>
                    )}
                    <div>
                        <h1
                            className="text-lg font-bold"
                            style={{ color: tenant?.cor_primaria || '#D4AF37' }}
                        >
                            {tenant?.nome || 'Food SaaS'}
                        </h1>
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
                                    style={isActive ? { color: tenant?.cor_primaria || '#D4AF37' } : {}}
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
