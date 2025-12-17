import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'

/**
 * Componente Drawer do Carrinho
 * 
 * Props:
 * - isOpen: boolean - se o drawer está aberto
 * - onClose: function - fechar drawer
 * - itens: array - itens do carrinho
 * - total: number - total do carrinho
 * - onAtualizarQuantidade: function(itemId, quantidade)
 * - onRemover: function(itemId)
 * - onCheckout: function - ir para checkout
 * - corPrimaria: string - cor do tenant
 */
export function Carrinho({
    isOpen,
    onClose,
    itens = [],
    total = 0,
    onAtualizarQuantidade,
    onRemover,
    onCheckout,
    corPrimaria = '#D4AF37'
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#1a1a1a] shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag size={24} style={{ color: corPrimaria }} />
                        Seu Pedido
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Itens */}
                <div className="flex-1 overflow-y-auto p-4">
                    {itens.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">Seu carrinho está vazio</p>
                            <p className="text-gray-500 text-sm mt-2">Adicione produtos para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {itens.map(item => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 p-3 bg-gray-800/50 rounded-xl"
                                >
                                    {/* Imagem */}
                                    {item.imagem_url && (
                                        <img
                                            src={item.imagem_url}
                                            alt={item.nome}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white truncate">{item.nome}</h4>
                                        {item.observacoes && (
                                            <p className="text-gray-400 text-xs truncate">{item.observacoes}</p>
                                        )}
                                        <p className="font-bold mt-1" style={{ color: corPrimaria }}>
                                            R$ {(item.preco * item.quantidade).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Controles */}
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => onRemover(item.id)}
                                            className="p-1 text-gray-400 hover:text-red-400 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onAtualizarQuantidade(item.id, item.quantidade - 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-gray-700 rounded-lg hover:bg-gray-600"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-6 text-center font-semibold">{item.quantidade}</span>
                                            <button
                                                onClick={() => onAtualizarQuantidade(item.id, item.quantidade + 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg"
                                                style={{ backgroundColor: corPrimaria, color: '#000' }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {itens.length > 0 && (
                    <div className="p-4 border-t border-gray-800 space-y-4">
                        {/* Total */}
                        <div className="flex items-center justify-between text-lg">
                            <span className="text-gray-400">Total</span>
                            <span className="font-bold text-2xl" style={{ color: corPrimaria }}>
                                R$ {total.toFixed(2)}
                            </span>
                        </div>

                        {/* Botão Checkout */}
                        <button
                            onClick={onCheckout}
                            className="w-full py-4 rounded-xl font-bold text-black text-lg transition hover:opacity-90"
                            style={{ backgroundColor: corPrimaria }}
                        >
                            Fazer Pedido
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Botão flutuante do carrinho
 */
export function BotaoCarrinho({ quantidade, onClick, corPrimaria = '#D4AF37' }) {
    if (quantidade === 0) return null

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
            style={{ backgroundColor: corPrimaria }}
        >
            <ShoppingBag size={28} className="text-black" />
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-sm font-bold flex items-center justify-center">
                {quantidade > 9 ? '9+' : quantidade}
            </span>
        </button>
    )
}
