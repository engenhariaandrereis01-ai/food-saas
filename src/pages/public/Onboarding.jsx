import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { tenantService } from '../../lib/tenant'
import { Building2, Mail, Phone, MapPin, Palette, ArrowRight, Check, Loader2 } from 'lucide-react'

export function Onboarding() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Dados do restaurante
    const [restaurante, setRestaurante] = useState({
        nome: '',
        slug: '',
        telefone: '',
        whatsapp: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        email: '',
        cor_primaria: '#D4AF37',
        cor_secundaria: '#1a1a1a'
    })

    // Dados do usuário admin
    const [admin, setAdmin] = useState({
        email: '',
        senha: '',
        nome: ''
    })

    // Gerar slug automaticamente
    const gerarSlug = (nome) => {
        return nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    // Verificar disponibilidade do slug
    const verificarSlug = async (slug) => {
        if (slug.length < 3) return false
        return await tenantService.isSlugAvailable(slug)
    }

    // Etapa 1: Dados do Restaurante
    const handleStep1 = async (e) => {
        e.preventDefault()
        setError('')

        if (!restaurante.nome || !restaurante.slug) {
            setError('Preencha todos os campos obrigatórios')
            return
        }

        const disponivel = await verificarSlug(restaurante.slug)
        if (!disponivel) {
            setError('Este slug já está em uso. Escolha outro.')
            return
        }

        setStep(2)
    }

    // Etapa 2: Dados do Admin
    const handleStep2 = async (e) => {
        e.preventDefault()
        setError('')

        if (!admin.email || !admin.senha || !admin.nome) {
            setError('Preencha todos os campos')
            return
        }

        if (admin.senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setStep(3)
    }

    // Etapa 3: Confirmar e Criar
    const handleCriar = async () => {
        setLoading(true)
        setError('')

        try {
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: admin.email,
                password: admin.senha
            })

            if (authError) throw authError

            // 2. Criar tenant
            const tenant = await tenantService.create(restaurante)

            // 3. Associar usuário ao tenant
            await tenantService.addUser(tenant.id, authData.user.id, 'owner', admin.nome)

            // 4. Redirecionar para o dashboard
            navigate(`/${restaurante.slug}/dashboard`)

        } catch (err) {
            console.error('Erro ao criar:', err)
            setError(err.message || 'Erro ao criar restaurante')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="bg-[#1a1a1a] border-b border-gray-800 py-6">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl">🍽️</span>
                        <div>
                            <h1 className="text-2xl font-bold">Food SaaS</h1>
                            <p className="text-gray-400 text-sm">Cadastre seu restaurante</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 text-gray-500'
                                }`}>
                                {step > s ? <Check size={20} /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-[#D4AF37]' : 'bg-gray-800'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Dados do Restaurante */}
                {step === 1 && (
                    <form onSubmit={handleStep1} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Building2 className="text-[#D4AF37]" />
                            Dados do Restaurante
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome do Restaurante *</label>
                                <input
                                    type="text"
                                    value={restaurante.nome}
                                    onChange={(e) => {
                                        const nome = e.target.value
                                        setRestaurante({
                                            ...restaurante,
                                            nome,
                                            slug: gerarSlug(nome)
                                        })
                                    }}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Ex: Pizzaria do João"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Slug (URL) *</label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-2">foodsaas.com/</span>
                                    <input
                                        type="text"
                                        value={restaurante.slug}
                                        onChange={(e) => setRestaurante({ ...restaurante, slug: e.target.value.toLowerCase() })}
                                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        placeholder="pizzaria-do-joao"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                                    <input
                                        type="tel"
                                        value={restaurante.telefone}
                                        onChange={(e) => setRestaurante({ ...restaurante, telefone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={restaurante.whatsapp}
                                        onChange={(e) => setRestaurante({ ...restaurante, whatsapp: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        placeholder="11999999999"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Endereço</label>
                                <input
                                    type="text"
                                    value={restaurante.endereco}
                                    onChange={(e) => setRestaurante({ ...restaurante, endereco: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Rua, número, bairro"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2">Cidade</label>
                                    <input
                                        type="text"
                                        value={restaurante.cidade}
                                        onChange={(e) => setRestaurante({ ...restaurante, cidade: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Estado</label>
                                    <input
                                        type="text"
                                        value={restaurante.estado}
                                        onChange={(e) => setRestaurante({ ...restaurante, estado: e.target.value.toUpperCase().slice(0, 2) })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                        maxLength={2}
                                        placeholder="SP"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-red-500 mt-4">{error}</p>}

                        <button
                            type="submit"
                            className="w-full mt-6 py-4 bg-[#D4AF37] text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#c9a432] transition"
                        >
                            Continuar <ArrowRight size={20} />
                        </button>
                    </form>
                )}

                {/* Step 2: Dados do Admin */}
                {step === 2 && (
                    <form onSubmit={handleStep2} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Mail className="text-[#D4AF37]" />
                            Criar sua Conta
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Seu Nome *</label>
                                <input
                                    type="text"
                                    value={admin.nome}
                                    onChange={(e) => setAdmin({ ...admin, nome: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="João Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">E-mail *</label>
                                <input
                                    type="email"
                                    value={admin.email}
                                    onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="joao@pizzaria.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Senha *</label>
                                <input
                                    type="password"
                                    value={admin.senha}
                                    onChange={(e) => setAdmin({ ...admin, senha: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 mt-4">{error}</p>}

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-gray-700 rounded-lg"
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 bg-[#D4AF37] text-black font-bold rounded-lg flex items-center justify-center gap-2"
                            >
                                Continuar <ArrowRight size={20} />
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Personalização e Confirmação */}
                {step === 3 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Palette className="text-[#D4AF37]" />
                            Personalização
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Cor Primária</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={restaurante.cor_primaria}
                                            onChange={(e) => setRestaurante({ ...restaurante, cor_primaria: e.target.value })}
                                            className="w-12 h-12 rounded cursor-pointer"
                                        />
                                        <span className="text-gray-400">{restaurante.cor_primaria}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Cor Secundária</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={restaurante.cor_secundaria}
                                            onChange={(e) => setRestaurante({ ...restaurante, cor_secundaria: e.target.value })}
                                            className="w-12 h-12 rounded cursor-pointer"
                                        />
                                        <span className="text-gray-400">{restaurante.cor_secundaria}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-900 rounded-lg p-4 mb-6">
                            <h3 className="text-sm text-gray-400 mb-3">Preview do seu cardápio:</h3>
                            <div
                                className="rounded-lg p-4"
                                style={{ backgroundColor: restaurante.cor_secundaria }}
                            >
                                <div
                                    className="text-xl font-bold mb-2"
                                    style={{ color: restaurante.cor_primaria }}
                                >
                                    {restaurante.nome || 'Seu Restaurante'}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    foodsaas.com/{restaurante.slug}/cardapio
                                </div>
                            </div>
                        </div>

                        {/* Resumo */}
                        <div className="bg-gray-800 rounded-lg p-4 mb-6">
                            <h3 className="text-sm text-gray-400 mb-3">Resumo:</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-400">Restaurante:</span> {restaurante.nome}</p>
                                <p><span className="text-gray-400">URL:</span> foodsaas.com/{restaurante.slug}</p>
                                <p><span className="text-gray-400">Admin:</span> {admin.nome} ({admin.email})</p>
                                <p><span className="text-gray-400">Plano:</span> Trial (14 dias grátis)</p>
                            </div>
                        </div>

                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-4 bg-gray-700 rounded-lg"
                                disabled={loading}
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleCriar}
                                disabled={loading}
                                className="flex-1 py-4 bg-[#D4AF37] text-black font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> Criando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} /> Criar Restaurante
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
