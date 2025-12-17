import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Search, ShoppingBag, MapPin, Clock, Phone, X } from 'lucide-react'

export function CardapioPublico() {
    const { slug } = useParams()
    const [tenant, setTenant] = useState(null)
    const [categorias, setCategorias] = useState([])
    const [produtos, setProdutos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [categoriaAtiva, setCategoriaAtiva] = useState(null)
    const [produtoSelecionado, setProdutoSelecionado] = useState(null)

    // Carregar dados do tenant
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Buscar tenant pelo slug
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('slug', slug)
                    .eq('ativo', true)
                    .single()

                if (tenantError || !tenantData) {
                    setError('Restaurante não encontrado')
                    setLoading(false)
                    return
                }

                setTenant(tenantData)

                // 2. Buscar categorias
                const { data: cats } = await supabase
                    .from('categorias')
                    .select('*')
                    .eq('tenant_id', tenantData.id)
                    .eq('ativo', true)
                    .order('ordem')

                setCategorias(cats || [])

                // 3. Buscar produtos
                const { data: prods } = await supabase
                    .from('produtos')
                    .select('*, categorias(nome)')
                    .eq('tenant_id', tenantData.id)
                    .eq('ativo', true)
                    .order('nome')

                setProdutos(prods || [])

            } catch (err) {
                console.error('Erro:', err)
                setError('Erro ao carregar cardápio')
            } finally {
                setLoading(false)
            }
        }

        if (slug) loadData()
    }, [slug])

    // Filtrar produtos por busca e categoria
    const produtosFiltrados = produtos.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
            p.descricao?.toLowerCase().includes(search.toLowerCase())
        const matchCategoria = !categoriaAtiva || p.categoria_id === categoriaAtiva
        return matchSearch && matchCategoria
    })

    // Agrupar produtos por categoria
    const produtosPorCategoria = categorias.reduce((acc, cat) => {
        const prods = produtosFiltrados.filter(p => p.categoria_id === cat.id)
        if (prods.length > 0) {
            acc.push({ categoria: cat, produtos: prods })
        }
        return acc
    }, [])

    // Produtos sem categoria
    const produtosSemCategoria = produtosFiltrados.filter(p => !p.categoria_id)

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
            </div>
        )
    }

    // Erro
    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-6xl mb-4">🍽️</p>
                    <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        )
    }

    const corPrimaria = tenant?.cor_primaria || '#D4AF37'

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#1a1a1a] border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        {tenant.logo_url ? (
                            <img src={tenant.logo_url} alt={tenant.nome} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: corPrimaria + '20' }}>
                                🍽️
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-xl font-bold" style={{ color: corPrimaria }}>{tenant.nome}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                {tenant.cidade && <span className="flex items-center gap-1"><MapPin size={14} /> {tenant.cidade}</span>}
                                <span className="flex items-center gap-1"><Clock size={14} /> Aberto</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Busca */}
            <div className="sticky top-[76px] z-30 bg-[#0a0a0a] py-3 px-4 border-b border-gray-800">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar no cardápio..."
                            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Categorias (scroll horizontal) */}
            {categorias.length > 0 && (
                <div className="sticky top-[140px] z-20 bg-[#0a0a0a] py-3 px-4 border-b border-gray-800 overflow-x-auto">
                    <div className="max-w-4xl mx-auto flex gap-2">
                        <button
                            onClick={() => setCategoriaAtiva(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${!categoriaAtiva
                                    ? 'text-black'
                                    : 'bg-gray-800 text-gray-300 hover:text-white'
                                }`}
                            style={!categoriaAtiva ? { backgroundColor: corPrimaria } : {}}
                        >
                            Todos
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoriaAtiva(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${categoriaAtiva === cat.id
                                        ? 'text-black'
                                        : 'bg-gray-800 text-gray-300 hover:text-white'
                                    }`}
                                style={categoriaAtiva === cat.id ? { backgroundColor: corPrimaria } : {}}
                            >
                                {cat.nome}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Produtos */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {produtosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Por categoria */}
                        {produtosPorCategoria.map(({ categoria, produtos }) => (
                            <section key={categoria.id}>
                                <h2 className="text-xl font-bold mb-4" style={{ color: corPrimaria }}>{categoria.nome}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {produtos.map(produto => (
                                        <ProdutoCard
                                            key={produto.id}
                                            produto={produto}
                                            corPrimaria={corPrimaria}
                                            onClick={() => setProdutoSelecionado(produto)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {/* Sem categoria */}
                        {produtosSemCategoria.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold mb-4" style={{ color: corPrimaria }}>Outros</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {produtosSemCategoria.map(produto => (
                                        <ProdutoCard
                                            key={produto.id}
                                            produto={produto}
                                            corPrimaria={corPrimaria}
                                            onClick={() => setProdutoSelecionado(produto)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-[#1a1a1a] border-t border-gray-800 py-6 mt-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">
                        {tenant.whatsapp && (
                            <a href={`https://wa.me/${tenant.whatsapp}`} className="flex items-center justify-center gap-2 hover:text-white">
                                <Phone size={16} /> {tenant.whatsapp}
                            </a>
                        )}
                    </p>
                    <p className="text-gray-600 text-xs mt-4">Powered by Food SaaS</p>
                </div>
            </footer>

            {/* Modal de Produto */}
            {produtoSelecionado && (
                <ModalProduto
                    produto={produtoSelecionado}
                    corPrimaria={corPrimaria}
                    onClose={() => setProdutoSelecionado(null)}
                />
            )}
        </div>
    )
}

// Componente Card de Produto
function ProdutoCard({ produto, corPrimaria, onClick }) {
    return (
        <div
            onClick={onClick}
            className="flex gap-4 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition"
        >
            <div className="flex-1">
                <h3 className="font-bold text-white mb-1">{produto.nome}</h3>
                {produto.descricao && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{produto.descricao}</p>
                )}
                <div className="flex items-center gap-2">
                    {produto.preco_promocional ? (
                        <>
                            <span className="text-gray-500 line-through text-sm">R$ {produto.preco?.toFixed(2)}</span>
                            <span className="font-bold" style={{ color: corPrimaria }}>R$ {produto.preco_promocional?.toFixed(2)}</span>
                        </>
                    ) : (
                        <span className="font-bold" style={{ color: corPrimaria }}>R$ {produto.preco?.toFixed(2)}</span>
                    )}
                </div>
            </div>
            {produto.imagem_url && (
                <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
            )}
        </div>
    )
}

// Modal de Detalhes do Produto
function ModalProduto({ produto, corPrimaria, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center">
            <div className="bg-[#1a1a1a] w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
                {/* Imagem */}
                {produto.imagem_url && (
                    <div className="relative aspect-video">
                        <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Info */}
                <div className="p-6">
                    {!produto.imagem_url && (
                        <button onClick={onClose} className="absolute top-4 right-4">
                            <X size={24} />
                        </button>
                    )}

                    <h2 className="text-2xl font-bold text-white mb-2">{produto.nome}</h2>
                    {produto.descricao && (
                        <p className="text-gray-400 mb-4">{produto.descricao}</p>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        {produto.preco_promocional ? (
                            <>
                                <span className="text-gray-500 line-through text-lg">R$ {produto.preco?.toFixed(2)}</span>
                                <span className="text-2xl font-bold" style={{ color: corPrimaria }}>
                                    R$ {produto.preco_promocional?.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold" style={{ color: corPrimaria }}>
                                R$ {produto.preco?.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl font-bold text-black transition hover:opacity-90"
                        style={{ backgroundColor: corPrimaria }}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}
