import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Pedidos } from './pages/Pedidos'
import { Clients } from './pages/Clients'
import { Reports } from './pages/Reports'
import { Login } from './pages/Login'
import { Cardapio } from './pages/Cardapio'
import { PDV } from './pages/PDV'
import { Mesas } from './pages/Mesas'
import { Garcom } from './pages/Garcom'
import { Comandas } from './pages/Comandas'
import { Landing } from './pages/public/Landing'
import { Onboarding } from './pages/public/Onboarding'
import { supabase } from './lib/supabase'
import { TenantProvider } from './contexts/TenantContext'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <span className="text-5xl">🍽️</span>
          <p className="text-gray-400 mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <TenantProvider>
      <BrowserRouter>
        <Routes>
          {/* ========================================= */}
          {/* ROTAS PÚBLICAS DO SAAS                   */}
          {/* ========================================= */}

          {/* Landing Page - sempre acessível */}
          <Route path="/" element={<Landing />} />

          {/* Onboarding - Cadastro de Restaurante */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Login */}
          <Route path="/login" element={<Login onLogin={setUser} />} />

          {/* ========================================= */}
          {/* ROTAS PÚBLICAS POR TENANT (/:slug/...)   */}
          {/* ========================================= */}

          {/* Cardápio do restaurante */}
          <Route path="/:slug/cardapio" element={<Cardapio />} />

          {/* App do Garçom */}
          <Route path="/:slug/garcom" element={<Garcom />} />

          {/* Rotas legadas (sem slug) - para compatibilidade */}
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/garcom" element={<Garcom />} />

          {/* ========================================= */}
          {/* ROTAS PROTEGIDAS DO DASHBOARD            */}
          {/* ========================================= */}

          {/* Dashboard principal - requer login */}
          <Route
            path="/dashboard/*"
            element={user ? <Layout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="pdv" element={<PDV />} />
            <Route path="mesas" element={<Mesas />} />
            <Route path="comandas" element={<Comandas />} />
          </Route>

          {/* Dashboard por tenant - requer login */}
          <Route
            path="/:slug/dashboard/*"
            element={user ? <Layout /> : <Navigate to="/login" replace />}
          >
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="pdv" element={<PDV />} />
            <Route path="mesas" element={<Mesas />} />
            <Route path="comandas" element={<Comandas />} />
          </Route>

          {/* Fallback - redireciona para Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TenantProvider>
  )
}

export default App
