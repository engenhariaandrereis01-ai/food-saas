import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { tenantService } from '../lib/tenant'
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react'

export function Login({ onLogin }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                setError('Email ou senha incorretos')
                setLoading(false)
                return
            }

            // Buscar tenant do usuário
            const tenant = await tenantService.getCurrentUserTenant()

            if (onLogin) onLogin(data.user)

            // Redirecionar para o dashboard do tenant
            if (tenant) {
                navigate(`/${tenant.slug}/dashboard`)
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError('Erro ao fazer login')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-6xl">🍽️</span>
                    <h1 className="text-2xl font-bold text-[#D4AF37] mt-4">Food SaaS</h1>
                    <p className="text-gray-400 mt-2">Acesse seu painel</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                    <h2 className="text-xl font-semibold mb-6 text-center text-white">Entrar</h2>

                    {error && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${error.includes('Verifique')
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#c9a432] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Carregando...'
                        ) : (
                            <>
                                <LogIn size={20} /> Entrar
                            </>
                        )}
                    </button>

                    <Link
                        to="/onboarding"
                        className="block w-full mt-3 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-400 text-center"
                    >
                        Criar conta gratuita
                    </Link>
                </form>

                <Link to="/" className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-6 hover:text-gray-400">
                    <ArrowLeft size={16} /> Voltar para o início
                </Link>

                <p className="text-center text-gray-500 text-sm mt-4">
                    © 2024 Food SaaS
                </p>
            </div>
        </div>
    )
}
