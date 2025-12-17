import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCarrinho } from '../../hooks/useCarrinho'
import { ArrowLeft, Loader2, CheckCircle, MapPin, Phone, User, CreditCard } from 'lucide-react'

export function Checkout() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [tenant, setTenant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [sucesso, setSucesso] = useState(false)
    const [pedidoId, setPedidoId] = useState(null)

    // Form
    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        endereco: '',
        bairro: '',
        complemento: '',
        forma_pagamento: 'dinheiro',
        observacoes: ''
    })

    // Carregar tenant
    useEffect(() => {
        const loadTenant = async () => {
            const { data } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug)
                .single()

            if (data) setTenant(data)
            setLoading(false)
        }
        loadTenant()
    }, [slug])

    // Hook do carrinho
    const carrinho = useCarrinho(tenant?.id)

    // Enviar pedido
    const enviarPedido = async () => {
        if (!form.nome || !form.telefone) {
            alert('Preencha nome e telefone')
            return
        }

        if (!carrinho.temItens) {
            alert('Seu carrinho está vazio')
            return
        }

        setEnviando(true)

        try {
            // Montar itens como texto
            const itensTexto = carrinho.itens.map(item =>
                `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}`
            ).join('\n')

            const pedido = {
                tenant_id: tenant.id,
                phone: form.telefone,
                nome_cliente: form.nome,
                itens: itensTexto,
                valor_total: carrinho.total,
                taxa_entrega: tenant.taxa_entrega_padrao || 0,
                endereco_entrega: `${form.endereco}, ${form.bairro} - ${form.complemento}`,
                forma_pagamento: form.forma_pagamento,
                observacoes: form.observacoes,
                status: 'pendente',
                modalidade: form.endereco ? 'delivery' : 'retirada'
            }

            const { data, error } = await supabase
                .from('pedidos')
                .insert(pedido)
                .select()
                .single()

            if (error) throw error

            setPedidoId(data.id)
            carrinho.limpar()
            setSucesso(true)

        } catch (err) {
            console.error('Erro ao enviar pedido:', err)
            alert('Erro ao enviar pedido. Tente novamente.')
        } finally {
            setEnviando(false)
        }
    }

    const corPrimaria = tenant?.cor_primaria || '#D4AF37'

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
            </div>
        )
    }

    // Tela de sucesso
    if (sucesso) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: corPrimaria + '20' }}>
                        <CheckCircle size={40} style={{ color: corPrimaria }} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Pedido Enviado!</h1>
                    <p className="text-gray-400 mb-2">Seu pedido #{pedidoId} foi recebido.</p>
                    <p className="text-gray-500 text-sm mb-8">Aguarde a confirmação do restaurante.</p>

                    <button
                        onClick={() => navigate(`/${slug}/cardapio`)}
                        className="px-6 py-3 rounded-xl font-bold text-black"
                        style={{ backgroundColor: corPrimaria }}
                    >
                        Voltar ao Cardápio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#1a1a1a] border-b border-gray-800">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-lg">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Finalizar Pedido</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Resumo do Pedido */}
                <section className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                    <h2 className="font-bold mb-4">Resumo do Pedido</h2>
                    <div className="space-y-2 mb-4">
                        {carrinho.itens.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-400">{item.quantidade}x {item.nome}</span>
                                <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-800 pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span style={{ color: corPrimaria }}>R$ {carrinho.total.toFixed(2)}</span>
                    </div>
                </section>

                {/* Dados do Cliente */}
                <section className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <User size={20} style={{ color: corPrimaria }} />
                        Seus Dados
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Seu nome *"
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                        <input
                            type="tel"
                            placeholder="WhatsApp *"
                            value={form.telefone}
                            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                    </div>
                </section>

                {/* Endereço */}
                <section className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <MapPin size={20} style={{ color: corPrimaria }} />
                        Endereço de Entrega
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Rua, número"
                            value={form.endereco}
                            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Bairro"
                                value={form.bairro}
                                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                            <input
                                type="text"
                                placeholder="Complemento"
                                value={form.complemento}
                                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Pagamento */}
                <section className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <CreditCard size={20} style={{ color: corPrimaria }} />
                        Forma de Pagamento
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {['dinheiro', 'pix', 'cartao', 'debito'].map(forma => (
                            <button
                                key={forma}
                                onClick={() => setForm({ ...form, forma_pagamento: forma })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium transition ${form.forma_pagamento === forma
                                        ? 'text-black'
                                        : 'bg-gray-800 text-gray-300'
                                    }`}
                                style={form.forma_pagamento === forma ? { backgroundColor: corPrimaria } : {}}
                            >
                                {forma.charAt(0).toUpperCase() + forma.slice(1)}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Observações */}
                <section className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                    <h2 className="font-bold mb-4">Observações</h2>
                    <textarea
                        placeholder="Ex: Sem cebola, troco para R$ 50..."
                        value={form.observacoes}
                        onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none"
                        rows={3}
                    />
                </section>

                {/* Botão Enviar */}
                <button
                    onClick={enviarPedido}
                    disabled={enviando}
                    className="w-full py-4 rounded-xl font-bold text-black text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: corPrimaria }}
                >
                    {enviando ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>Enviar Pedido - R$ {carrinho.total.toFixed(2)}</>
                    )}
                </button>
            </div>
        </div>
    )
}
