import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { usePlano, PLANOS } from '../../hooks/usePlano'
import {
    Loader2, Check, AlertTriangle, Crown, Zap, Star,
    CreditCard, Calendar, Package
} from 'lucide-react'

export function Billing() {
    const [tenant, setTenant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [contadorProdutos, setContadorProdutos] = useState(0)

    // Carregar tenant e contar produtos
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data } = await supabase
                .from('usuarios_tenant')
                .select('tenant_id, tenants(*)')
                .eq('user_id', user.id)
                .limit(1)

            if (data?.[0]?.tenants) {
                setTenant(data[0].tenants)

                // Contar produtos
                const { count } = await supabase
                    .from('produtos')
                    .select('id', { count: 'exact' })
                    .eq('tenant_id', data[0].tenant_id)

                setContadorProdutos(count || 0)
            }
            setLoading(false)
        }
        init()
    }, [])

    const { plano } = usePlano(tenant?.id)

    const selecionarPlano = async (tipoPlano) => {
        // Por enquanto, apenas simula a seleção
        // Futuramente integrar com Stripe/MercadoPago
        alert(`Para ativar o plano ${PLANOS[tipoPlano].nome}, entre em contato pelo WhatsApp!`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Planos e Cobrança</h1>
                <p className="text-gray-400">Gerencie sua assinatura</p>
            </div>

            {/* Status atual do plano */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Plano Atual</p>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {plano?.tipo === 'pro' && <Crown className="text-[#D4AF37]" />}
                            {plano?.tipo === 'basico' && <Zap className="text-blue-400" />}
                            {plano?.tipo === 'trial' && <Star className="text-purple-400" />}
                            {PLANOS[plano?.tipo]?.nome || 'Trial'}
                        </h2>
                    </div>

                    {plano?.tipo === 'trial' && (
                        <div className={`px-4 py-2 rounded-xl ${plano?.trialExpirado ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {plano?.trialExpirado ? (
                                <span className="flex items-center gap-2">
                                    <AlertTriangle size={18} />
                                    Trial Expirado
                                </span>
                            ) : (
                                <span>{plano?.diasRestantes} dias restantes</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Uso de produtos */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400 flex items-center gap-2">
                            <Package size={16} />
                            Produtos cadastrados
                        </span>
                        <span className="text-white">
                            {contadorProdutos} / {plano?.limiteProdutos === -1 ? '∞' : plano?.limiteProdutos}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#D4AF37] rounded-full transition-all"
                            style={{
                                width: plano?.limiteProdutos === -1
                                    ? '10%'
                                    : `${Math.min(100, (contadorProdutos / plano?.limiteProdutos) * 100)}%`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Cards de planos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(PLANOS).map(([key, planoInfo]) => {
                    const isAtual = plano?.tipo === key
                    const isPopular = key === 'basico'

                    return (
                        <div
                            key={key}
                            className={`relative bg-[#1a1a1a] rounded-xl p-6 border transition ${isAtual
                                    ? 'border-[#D4AF37]'
                                    : isPopular
                                        ? 'border-blue-500'
                                        : 'border-gray-800'
                                }`}
                        >
                            {/* Badge popular */}
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                    Mais Popular
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">{planoInfo.nome}</h3>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-4xl font-bold text-[#D4AF37]">
                                        {planoInfo.preco === 0 ? 'Grátis' : `R$ ${planoInfo.preco.toFixed(2).replace('.', ',')}`}
                                    </span>
                                    {planoInfo.preco > 0 && <span className="text-gray-400 ml-1">/mês</span>}
                                </div>
                            </div>

                            {/* Recursos */}
                            <ul className="space-y-3 mb-6">
                                {planoInfo.recursos.map((recurso, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-300">
                                        <Check size={16} className="text-green-400 flex-shrink-0" />
                                        <span>{recurso}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Botão */}
                            <button
                                onClick={() => !isAtual && selecionarPlano(key)}
                                disabled={isAtual}
                                className={`w-full py-3 rounded-xl font-bold transition ${isAtual
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#D4AF37] text-black hover:opacity-90'
                                    }`}
                            >
                                {isAtual ? 'Plano Atual' : key === 'trial' ? 'Voltar ao Trial' : 'Assinar'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Info de pagamento */}
            <div className="mt-8 bg-gray-800/30 rounded-xl p-6 border border-gray-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-[#D4AF37]" />
                    Formas de Pagamento
                </h3>
                <p className="text-gray-400">
                    Aceitamos PIX, cartão de crédito e boleto bancário.
                    Para ativar um plano pago, entre em contato pelo WhatsApp.
                </p>
            </div>
        </div>
    )
}
