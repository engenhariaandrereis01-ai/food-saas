import { Link } from 'react-router-dom'
import { ChefHat, Smartphone, CreditCard, BarChart3, ArrowRight, Check } from 'lucide-react'

export function Landing() {
    const features = [
        { icon: Smartphone, title: 'Cardápio Digital', desc: 'Seus clientes pedem pelo celular' },
        { icon: ChefHat, title: 'App do Garçom', desc: 'Pedidos direto na mesa' },
        { icon: CreditCard, title: 'PDV Completo', desc: 'Vendas de balcão integradas' },
        { icon: BarChart3, title: 'Relatórios', desc: 'Acompanhe suas vendas' }
    ]

    const planos = [
        {
            nome: 'Trial',
            preco: 'Grátis',
            periodo: '14 dias',
            recursos: ['Cardápio digital', 'Até 50 produtos', 'Até 100 pedidos/mês'],
            destaque: false
        },
        {
            nome: 'Starter',
            preco: 'R$ 79',
            periodo: '/mês',
            recursos: ['Cardápio digital', 'Até 100 produtos', 'Pedidos ilimitados', 'Suporte por email'],
            destaque: false
        },
        {
            nome: 'Pro',
            preco: 'R$ 149',
            periodo: '/mês',
            recursos: ['Tudo do Starter', 'PDV completo', 'Sistema de comandas', 'App do garçom', 'Suporte prioritário'],
            destaque: true
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="bg-[#1a1a1a] border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🍽️</span>
                        <span className="text-xl font-bold">Food SaaS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-gray-400 hover:text-white">
                            Entrar
                        </Link>
                        <Link
                            to="/onboarding"
                            className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#c9a432]"
                        >
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Seu restaurante na <span className="text-[#D4AF37]">palma da mão</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        Cardápio digital, PDV, comandas e muito mais.
                        Tudo integrado em uma única plataforma.
                    </p>
                    <Link
                        to="/onboarding"
                        className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#c9a432] transition"
                    >
                        Comece grátis por 14 dias <ArrowRight size={24} />
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4 bg-[#1a1a1a]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Tudo que você precisa
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
                                <f.icon size={40} className="text-[#D4AF37] mb-4" />
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-gray-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Planos */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">Planos</h2>
                    <p className="text-gray-400 text-center mb-12">Escolha o plano ideal para seu negócio</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {planos.map((p, i) => (
                            <div
                                key={i}
                                className={`rounded-xl p-6 border ${p.destaque
                                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                                        : 'bg-[#1a1a1a] border-gray-800'
                                    }`}
                            >
                                {p.destaque && (
                                    <span className="bg-[#D4AF37] text-black px-3 py-1 rounded-full text-sm font-bold">
                                        Mais Popular
                                    </span>
                                )}
                                <h3 className="text-2xl font-bold mt-4">{p.nome}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-bold">{p.preco}</span>
                                    <span className="text-gray-400">{p.periodo}</span>
                                </div>
                                <ul className="mt-6 space-y-3">
                                    {p.recursos.map((r, j) => (
                                        <li key={j} className="flex items-center gap-2">
                                            <Check size={18} className="text-[#D4AF37]" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/onboarding"
                                    className={`block mt-6 py-3 rounded-lg text-center font-bold ${p.destaque
                                            ? 'bg-[#D4AF37] text-black'
                                            : 'bg-gray-800 hover:bg-gray-700'
                                        }`}
                                >
                                    Começar
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 px-4 bg-[#1a1a1a]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Pronto para modernizar seu restaurante?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Cadastre-se em menos de 2 minutos e comece a receber pedidos hoje mesmo.
                    </p>
                    <Link
                        to="/onboarding"
                        className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#c9a432] transition"
                    >
                        Criar meu cardápio grátis <ArrowRight size={24} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-gray-800">
                <div className="max-w-6xl mx-auto text-center text-gray-400">
                    <p>© 2024 Food SaaS. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
