import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePlano, PLANOS } from '../../hooks/usePlano'
import {
    Loader2, Check, AlertTriangle, Crown, Zap, Star,
    CreditCard, Calendar, Package, ExternalLink, CheckCircle, XCircle
} from 'lucide-react'

export function Billing() {
    const [searchParams] = useSearchParams()
    const [tenant, setTenant] = useState(null)
    const [tenantId, setTenantId] = useState(null)
    const [userEmail, setUserEmail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [portalLoading, setPortalLoading] = useState(false)
    const [contadorProdutos, setContadorProdutos] = useState(0)
    const [mensagem, setMensagem] = useState(null)

    // Verificar parâmetros de retorno do Stripe
    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setMensagem({ tipo: 'sucesso', texto: '🎉 Assinatura ativada com sucesso!' })
        } else if (searchParams.get('canceled') === 'true') {
            setMensagem({ tipo: 'info', texto: 'Checkout cancelado. Você pode tentar novamente.' })
        }
    }, [searchParams])

    // Carregar tenant e contar produtos
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            setUserEmail(user.email)

            const { data } = await supabase
                .from('usuarios_tenant')
                .select('tenant_id, tenants(*)')
                .eq('user_id', user.id)
                .limit(1)

            if (data?.[0]?.tenants) {
                setTenant(data[0].tenants)
                setTenantId(data[0].tenant_id)

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

    const { plano } = usePlano(tenantId)

    // Iniciar checkout Stripe
    const iniciarCheckout = async (tipoPlano) => {
        setCheckoutLoading(true)
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                        plano: tipoPlano,
                        user_email: userEmail,
                    }),
                }
            )

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                setMensagem({ tipo: 'erro', texto: data.error || 'Erro ao criar checkout' })
            }
        } catch (error) {
            console.error('Erro no checkout:', error)
            setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor' })
        } finally {
            setCheckoutLoading(false)
        }
    }

    // Abrir portal do cliente
    const abrirPortal = async () => {
        setPortalLoading(true)
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        tenant_id: tenantId,
                    }),
                }
            )

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                setMensagem({ tipo: 'erro', texto: data.error || 'Erro ao abrir portal' })
            }
        } catch (error) {
            console.error('Erro no portal:', error)
            setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor' })
        } finally {
            setPortalLoading(false)
        }
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

            {/* Mensagens de feedback */}
            {mensagem && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${mensagem.tipo === 'sucesso' ? 'bg-green-500/20 text-green-400' :
                        mensagem.tipo === 'erro' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                    }`}>
                    {mensagem.tipo === 'sucesso' ? <CheckCircle size={20} /> :
                        mensagem.tipo === 'erro' ? <XCircle size={20} /> :
                            <AlertTriangle size={20} />}
                    {mensagem.texto}
                </div>
            )}

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

                    <div className="flex gap-2">
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

                        {/* Botão para gerenciar assinatura */}
                        {tenant?.stripe_customer_id && plano?.tipo !== 'trial' && (
                            <button
                                onClick={abrirPortal}
                                disabled={portalLoading}
                                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                            >
                                {portalLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <ExternalLink size={18} />
                                        Gerenciar Assinatura
                                    </>
                                )}
                            </button>
                        )}
                    </div>
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
                    const isPago = key !== 'trial'

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
                                onClick={() => !isAtual && isPago && iniciarCheckout(key)}
                                disabled={isAtual || checkoutLoading || !isPago}
                                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isAtual
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : isPago
                                        ? 'bg-[#D4AF37] text-black hover:opacity-90'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {checkoutLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : isAtual ? (
                                    'Plano Atual'
                                ) : !isPago ? (
                                    'Trial Ativo'
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Assinar Agora
                                    </>
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Info de pagamento */}
            <div className="mt-8 bg-gray-800/30 rounded-xl p-6 border border-gray-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-[#D4AF37]" />
                    Pagamento Seguro
                </h3>
                <p className="text-gray-400">
                    Processamos pagamentos de forma segura através do Stripe.
                    Aceitamos cartão de crédito e débito. Você pode cancelar sua assinatura a qualquer momento.
                </p>
            </div>
        </div>
    )
}

