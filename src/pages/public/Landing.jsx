import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ChefHat, Smartphone, CreditCard, BarChart3, ArrowRight, Check,
    X, MessageCircle, Star, Users, TrendingUp, Shield, Clock, Zap,
    ChevronDown, ChevronUp
} from 'lucide-react'

export function Landing() {
    const [faqAberto, setFaqAberto] = useState(null)

    const features = [
        { icon: Smartphone, title: 'Cardápio Digital', desc: 'QR Code na mesa, cliente pede pelo celular' },
        { icon: ChefHat, title: 'Pedidos em Tempo Real', desc: 'Receba pedidos direto no painel' },
        { icon: CreditCard, title: 'Zero Taxa', desc: 'Sem comissão por pedido, diferente do iFood' },
        { icon: BarChart3, title: 'Painel Completo', desc: 'Gerencie produtos, pedidos e clientes' }
    ]

    const comparativo = [
        { recurso: 'Taxa por pedido', nos: 'R$ 0', ifood: '27%', rappi: '25%' },
        { recurso: 'Mensalidade', nos: 'R$ 49,90', ifood: 'R$ 100+', rappi: 'R$ 79+' },
        { recurso: 'Sua marca', nos: true, ifood: false, rappi: false },
        { recurso: 'Dados dos clientes', nos: true, ifood: false, rappi: false },
        { recurso: 'Personalização', nos: true, ifood: false, rappi: false },
    ]

    const depoimentos = [
        {
            nome: 'João Silva',
            negocio: 'Espetaria do Jão',
            cidade: 'São Paulo, SP',
            texto: 'Triplicamos os pedidos em 30 dias. Melhor investimento que fiz!',
            estrelas: 5
        },
        {
            nome: 'Maria Oliveira',
            negocio: 'Pizzaria Bella',
            cidade: 'Rio de Janeiro, RJ',
            texto: 'Economizamos mais de R$ 3.000/mês só em taxas de marketplace.',
            estrelas: 5
        },
        {
            nome: 'Carlos Santos',
            negocio: 'Burger House',
            cidade: 'Belo Horizonte, MG',
            texto: 'O cliente escaneia, pede e eu só preparo. Simples assim!',
            estrelas: 5
        }
    ]

    const planos = [
        {
            nome: 'Trial',
            preco: 'Grátis',
            periodo: '14 dias',
            recursos: ['Cardápio digital', 'Até 20 produtos', 'Pedidos ilimitados', 'Suporte por email'],
            destaque: false
        },
        {
            nome: 'Básico',
            preco: 'R$ 49,90',
            periodo: '/mês',
            recursos: ['Cardápio digital', 'Até 50 produtos', 'Pedidos ilimitados', 'Personalização completa', 'Suporte por email'],
            destaque: true
        },
        {
            nome: 'Profissional',
            preco: 'R$ 99,90',
            periodo: '/mês',
            recursos: ['Produtos ilimitados', 'Pedidos ilimitados', 'Relatórios avançados', 'Múltiplos usuários', 'Suporte prioritário'],
            destaque: false
        }
    ]

    const faqs = [
        {
            pergunta: 'Preciso saber programar?',
            resposta: 'Não! O Food SaaS é 100% pronto para usar. Você cadastra seus produtos e já tem seu cardápio funcionando em minutos.'
        },
        {
            pergunta: 'Quanto tempo leva para configurar?',
            resposta: 'Menos de 10 minutos. Basta criar sua conta, cadastrar seus produtos e pronto!'
        },
        {
            pergunta: 'Posso cancelar quando quiser?',
            resposta: 'Sim! Não tem fidelidade nem multa. Cancele quando quiser pelo próprio painel.'
        },
        {
            pergunta: 'Vocês cobram taxa por pedido?',
            resposta: 'Nunca! Diferente do iFood e Rappi, não cobramos comissão. Você paga apenas a mensalidade fixa.'
        },
        {
            pergunta: 'Funciona no meu celular?',
            resposta: 'Sim! O painel funciona em qualquer dispositivo com internet: celular, tablet ou computador.'
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
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

            {/* Hero - Headline impactante */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        🎉 +500 restaurantes já usam
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Pare de pagar <span className="text-red-400 line-through">27% de taxa</span> pro iFood
                    </h1>
                    <p className="text-xl text-gray-400 mb-4">
                        Tenha seu próprio cardápio digital e receba pedidos
                        <span className="text-[#D4AF37] font-bold"> sem pagar comissão</span>
                    </p>
                    <p className="text-gray-500 mb-8">
                        QR Code na mesa → Cliente pede pelo celular → Você recebe na hora
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/onboarding"
                            className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#c9a432] transition"
                        >
                            Testar Grátis por 14 Dias <ArrowRight size={24} />
                        </Link>
                        <a
                            href="https://wa.me/5527996205115?text=Olá! Quero saber mais sobre o Food SaaS"
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition"
                        >
                            <MessageCircle size={24} /> Falar no WhatsApp
                        </a>
                    </div>
                    <p className="text-gray-500 text-sm mt-4">✓ Sem cartão de crédito ✓ Cancele quando quiser</p>
                </div>
            </section>

            {/* Comparativo com concorrentes */}
            <section className="py-16 px-4 bg-[#1a1a1a]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">
                        Por que o Food SaaS é melhor?
                    </h2>
                    <p className="text-gray-400 text-center mb-12">Compare e veja a diferença</p>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-4 px-4"></th>
                                    <th className="text-center py-4 px-4 text-[#D4AF37] font-bold">Food SaaS</th>
                                    <th className="text-center py-4 px-4 text-gray-400">iFood</th>
                                    <th className="text-center py-4 px-4 text-gray-400">Rappi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparativo.map((item, i) => (
                                    <tr key={i} className="border-b border-gray-800">
                                        <td className="py-4 px-4 text-gray-300">{item.recurso}</td>
                                        <td className="py-4 px-4 text-center">
                                            {typeof item.nos === 'boolean' ? (
                                                item.nos ? <Check className="mx-auto text-green-400" /> : <X className="mx-auto text-red-400" />
                                            ) : (
                                                <span className="text-[#D4AF37] font-bold">{item.nos}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {typeof item.ifood === 'boolean' ? (
                                                item.ifood ? <Check className="mx-auto text-green-400" /> : <X className="mx-auto text-red-400" />
                                            ) : (
                                                <span className="text-red-400">{item.ifood}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {typeof item.rappi === 'boolean' ? (
                                                item.rappi ? <Check className="mx-auto text-green-400" /> : <X className="mx-auto text-red-400" />
                                            ) : (
                                                <span className="text-red-400">{item.rappi}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Tudo que você precisa em um só lugar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#D4AF37] transition">
                                <f.icon size={40} className="text-[#D4AF37] mb-4" />
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-gray-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Depoimentos */}
            <section className="py-16 px-4 bg-[#1a1a1a]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">
                        O que nossos clientes dizem
                    </h2>
                    <p className="text-gray-400 text-center mb-12">Resultados reais de donos de restaurante</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {depoimentos.map((d, i) => (
                            <div key={i} className="bg-[#0a0a0a] rounded-xl p-6 border border-gray-800">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(d.estrelas)].map((_, j) => (
                                        <Star key={j} size={20} className="text-[#D4AF37] fill-[#D4AF37]" />
                                    ))}
                                </div>
                                <p className="text-gray-300 mb-4">"{d.texto}"</p>
                                <div>
                                    <p className="font-bold">{d.nome}</p>
                                    <p className="text-gray-400 text-sm">{d.negocio}</p>
                                    <p className="text-gray-500 text-sm">{d.cidade}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Planos */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">Planos Simples e Transparentes</h2>
                    <p className="text-gray-400 text-center mb-12">Sem surpresas, sem taxas escondidas</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {planos.map((p, i) => (
                            <div
                                key={i}
                                className={`relative rounded-xl p-6 border ${p.destaque
                                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] scale-105'
                                    : 'bg-[#1a1a1a] border-gray-800'
                                    }`}
                            >
                                {p.destaque && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black px-4 py-1 rounded-full text-sm font-bold">
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
                                            <Check size={18} className="text-[#D4AF37] flex-shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/onboarding"
                                    className={`block mt-6 py-3 rounded-lg text-center font-bold transition ${p.destaque
                                        ? 'bg-[#D4AF37] text-black hover:bg-[#c9a432]'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                        }`}
                                >
                                    {p.nome === 'Trial' ? 'Começar Grátis' : 'Assinar Agora'}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-4 bg-[#1a1a1a]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden">
                                <button
                                    onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                                    className="w-full flex items-center justify-between p-4 text-left font-bold"
                                >
                                    {faq.pergunta}
                                    {faqAberto === i ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                {faqAberto === i && (
                                    <div className="px-4 pb-4 text-gray-400">
                                        {faq.resposta}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Pronto para parar de perder dinheiro?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Junte-se a +500 restaurantes que já economizam com o Food SaaS
                    </p>
                    <Link
                        to="/onboarding"
                        className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#c9a432] transition"
                    >
                        Criar meu cardápio grátis <ArrowRight size={24} />
                    </Link>
                    <p className="text-gray-500 text-sm mt-4">14 dias grátis • Sem cartão • Cancele quando quiser</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-gray-800 bg-[#1a1a1a]">
                <div className="max-w-6xl mx-auto text-center text-gray-400">
                    <p>© 2024 Food SaaS. Todos os direitos reservados.</p>
                </div>
            </footer>

            {/* Botão WhatsApp Flutuante */}
            <a
                href="https://wa.me/5527996205115?text=Olá! Quero saber mais sobre o Food SaaS"
                target="_blank"
                className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition z-50"
            >
                <MessageCircle size={28} className="text-white" />
            </a>
        </div>
    )
}
