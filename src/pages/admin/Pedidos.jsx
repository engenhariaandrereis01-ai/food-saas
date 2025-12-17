import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    Loader2, RefreshCw, Clock, ChefHat, Package, CheckCircle,
    Phone, MapPin, DollarSign, Eye
} from 'lucide-react'

const STATUS_CONFIG = {
    pendente: { label: 'Pendente', color: 'yellow', icon: Clock },
    preparando: { label: 'Preparando', color: 'blue', icon: ChefHat },
    pronto: { label: 'Pronto', color: 'purple', icon: Package },
    entregue: { label: 'Entregue', color: 'green', icon: CheckCircle }
}

export function AdminPedidos() {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState(null)
    const [filtroStatus, setFiltroStatus] = useState('')
    const [pedidoDetalhes, setPedidoDetalhes] = useState(null)

    // Buscar tenant
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data } = await supabase
                .from('usuarios_tenant')
                .select('tenant_id')
                .eq('user_id', user.id)
                .limit(1)

            if (data?.[0]?.tenant_id) {
                setTenantId(data[0].tenant_id)
            } else {
                setLoading(false)
            }
        }
        init()
    }, [])

    // Carregar pedidos
    useEffect(() => {
        if (tenantId) {
            carregarPedidos()
            // Realtime
            const channel = supabase
                .channel('pedidos-changes')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'pedidos', filter: `tenant_id=eq.${tenantId}` },
                    () => carregarPedidos()
                )
                .subscribe()

            return () => supabase.removeChannel(channel)
        }
    }, [tenantId])

    const carregarPedidos = async () => {
        setLoading(true)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data } = await supabase
            .from('pedidos')
            .select('*')
            .eq('tenant_id', tenantId)
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false })

        setPedidos(data || [])
        setLoading(false)
    }

    const atualizarStatus = async (pedidoId, novoStatus) => {
        await supabase
            .from('pedidos')
            .update({ status: novoStatus })
            .eq('id', pedidoId)

        carregarPedidos()
    }

    const pedidosFiltrados = filtroStatus
        ? pedidos.filter(p => p.status === filtroStatus)
        : pedidos

    const contadores = {
        pendente: pedidos.filter(p => p.status === 'pendente').length,
        preparando: pedidos.filter(p => p.status === 'preparando').length,
        pronto: pedidos.filter(p => p.status === 'pronto').length,
        entregue: pedidos.filter(p => p.status === 'entregue').length
    }

    if (loading && !tenantId) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pedidos</h1>
                    <p className="text-gray-400">{pedidos.length} pedidos hoje</p>
                </div>
                <button
                    onClick={carregarPedidos}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                    <RefreshCw size={18} />
                    Atualizar
                </button>
            </div>

            {/* Filtros por Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                        key={status}
                        onClick={() => setFiltroStatus(filtroStatus === status ? '' : status)}
                        className={`p-4 rounded-xl border transition ${filtroStatus === status
                                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                                : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <config.icon size={20} className={`text-${config.color}-400`} />
                            <span className="text-2xl font-bold text-white">{contadores[status]}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{config.label}</p>
                    </button>
                ))}
            </div>

            {/* Lista de Pedidos */}
            {pedidosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-gray-800">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Nenhum pedido</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pedidosFiltrados.map(pedido => (
                        <PedidoCard
                            key={pedido.id}
                            pedido={pedido}
                            onVerDetalhes={() => setPedidoDetalhes(pedido)}
                            onAtualizarStatus={atualizarStatus}
                        />
                    ))}
                </div>
            )}

            {/* Modal Detalhes */}
            {pedidoDetalhes && (
                <ModalDetalhes
                    pedido={pedidoDetalhes}
                    onClose={() => setPedidoDetalhes(null)}
                    onAtualizarStatus={(status) => {
                        atualizarStatus(pedidoDetalhes.id, status)
                        setPedidoDetalhes(null)
                    }}
                />
            )}
        </div>
    )
}

function PedidoCard({ pedido, onVerDetalhes, onAtualizarStatus }) {
    const config = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.pendente
    const hora = new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const proximoStatus = {
        pendente: 'preparando',
        preparando: 'pronto',
        pronto: 'entregue'
    }

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">#{pedido.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400`}>
                            {config.label}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">{hora}</p>
                </div>
                <span className="text-xl font-bold text-[#D4AF37]">
                    R$ {parseFloat(pedido.valor_total)?.toFixed(2)}
                </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
                <p className="flex items-center gap-2 text-gray-300">
                    <Phone size={14} className="text-gray-500" />
                    {pedido.nome_cliente} - {pedido.phone}
                </p>
                {pedido.endereco_entrega && (
                    <p className="flex items-center gap-2 text-gray-400">
                        <MapPin size={14} className="text-gray-500" />
                        {pedido.endereco_entrega}
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onVerDetalhes}
                    className="flex-1 py-2 bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                    <Eye size={16} /> Ver Detalhes
                </button>
                {proximoStatus[pedido.status] && (
                    <button
                        onClick={() => onAtualizarStatus(pedido.id, proximoStatus[pedido.status])}
                        className="flex-1 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-bold hover:opacity-90"
                    >
                        {STATUS_CONFIG[proximoStatus[pedido.status]].label}
                    </button>
                )}
            </div>
        </div>
    )
}

function ModalDetalhes({ pedido, onClose, onAtualizarStatus }) {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Pedido #{pedido.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-sm text-gray-400 mb-1">Cliente</h3>
                        <p className="text-white">{pedido.nome_cliente}</p>
                        <p className="text-gray-400">{pedido.phone}</p>
                    </div>

                    {pedido.endereco_entrega && (
                        <div>
                            <h3 className="text-sm text-gray-400 mb-1">Endereço</h3>
                            <p className="text-white">{pedido.endereco_entrega}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm text-gray-400 mb-1">Itens</h3>
                        <div className="bg-gray-800 rounded-lg p-3 whitespace-pre-wrap text-white">
                            {pedido.itens}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm text-gray-400 mb-1">Pagamento</h3>
                            <p className="text-white capitalize">{pedido.forma_pagamento}</p>
                        </div>
                        <div>
                            <h3 className="text-sm text-gray-400 mb-1">Total</h3>
                            <p className="text-2xl font-bold text-[#D4AF37]">
                                R$ {parseFloat(pedido.valor_total)?.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {pedido.observacoes && (
                        <div>
                            <h3 className="text-sm text-gray-400 mb-1">Observações</h3>
                            <p className="text-yellow-400">{pedido.observacoes}</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400 mb-3">Atualizar Status:</p>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <button
                                key={status}
                                onClick={() => onAtualizarStatus(status)}
                                className={`py-2 rounded-lg text-xs font-medium transition ${pedido.status === status
                                        ? 'bg-[#D4AF37] text-black'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
