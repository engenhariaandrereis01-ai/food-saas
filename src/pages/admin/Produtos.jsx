import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useTenant } from '../../contexts/TenantContext'
import {
    Plus, Pencil, Trash2, Upload, X, Save, Image,
    Search, Filter, Loader2, Check
} from 'lucide-react'

export function AdminProdutos() {
    const { tenantId: contextTenantId, tenant, loading: tenantLoading } = useTenant()
    const [produtos, setProdutos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [tenantId, setTenantId] = useState(null)

    // Modal de edição
    const [modalAberto, setModalAberto] = useState(false)
    const [produtoEditando, setProdutoEditando] = useState(null)
    const [salvando, setSalvando] = useState(false)

    // Form
    const [form, setForm] = useState({
        nome: '',
        descricao: '',
        preco: '',
        preco_promocional: '',
        categoria_id: '',
        ativo: true,
        destaque: false,
        imagem_url: ''
    })

    // Upload
    const [uploadingImage, setUploadingImage] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const fileInputRef = useRef(null)

    // Buscar tenant ID
    useEffect(() => {
        const fetchTenantId = async () => {
            // Se já tem do context, usa
            if (contextTenantId) {
                setTenantId(contextTenantId)
                return
            }

            // Senão, busca do usuário logado
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('usuarios_tenant')
                    .select('tenant_id')
                    .eq('user_id', user.id)
                    .single()

                if (data?.tenant_id) {
                    setTenantId(data.tenant_id)
                } else {
                    setLoading(false) // Não tem tenant
                }
            } else {
                setLoading(false) // Não está logado
            }
        }

        fetchTenantId()
    }, [contextTenantId])

    // Carregar dados quando tiver tenantId
    useEffect(() => {
        if (tenantId) {
            carregarDados()
        }
    }, [tenantId])

    const carregarDados = async () => {
        setLoading(true)

        // Carregar categorias
        const { data: cats } = await supabase
            .from('categorias')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('ordem')

        setCategorias(cats || [])

        // Carregar produtos
        const { data: prods } = await supabase
            .from('produtos')
            .select('*, categorias(nome)')
            .eq('tenant_id', tenantId)
            .order('nome')

        setProdutos(prods || [])
        setLoading(false)
    }

    // Abrir modal para novo produto
    const novoProduto = () => {
        setProdutoEditando(null)
        setForm({
            nome: '',
            descricao: '',
            preco: '',
            preco_promocional: '',
            categoria_id: categorias[0]?.id || '',
            ativo: true,
            destaque: false,
            imagem_url: ''
        })
        setPreviewImage(null)
        setModalAberto(true)
    }

    // Abrir modal para editar
    const editarProduto = (produto) => {
        setProdutoEditando(produto)
        setForm({
            nome: produto.nome,
            descricao: produto.descricao || '',
            preco: produto.preco?.toString() || '',
            preco_promocional: produto.preco_promocional?.toString() || '',
            categoria_id: produto.categoria_id || '',
            ativo: produto.ativo,
            destaque: produto.destaque || false,
            imagem_url: produto.imagem_url || ''
        })
        setPreviewImage(produto.imagem_url)
        setModalAberto(true)
    }

    // Upload de imagem
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!tenantId) {
            alert('Erro: Tenant não identificado. Recarregue a página.')
            console.error('TenantId é null no momento do upload')
            return
        }

        // Preview local
        const reader = new FileReader()
        reader.onload = (e) => setPreviewImage(e.target?.result)
        reader.readAsDataURL(file)

        setUploadingImage(true)

        try {
            // Nome único para o arquivo
            const fileExt = file.name.split('.').pop()
            const fileName = `${tenantId}/${Date.now()}.${fileExt}`
            console.log('Uploading to:', fileName)

            // Upload para Supabase Storage
            const { data, error } = await supabase.storage
                .from('produtos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error('Upload error:', error)
                throw error
            }

            console.log('Upload success:', data)

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('produtos')
                .getPublicUrl(fileName)

            console.log('Public URL:', publicUrl)
            setForm({ ...form, imagem_url: publicUrl })
        } catch (error) {
            console.error('Erro ao fazer upload:', error)
            alert('Erro ao fazer upload: ' + error.message)
        } finally {
            setUploadingImage(false)
        }
    }

    // Salvar produto
    const salvarProduto = async () => {
        if (!form.nome || !form.preco) {
            alert('Preencha nome e preço')
            return
        }

        setSalvando(true)

        const dados = {
            tenant_id: tenantId,
            nome: form.nome,
            descricao: form.descricao,
            preco: parseFloat(form.preco),
            preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional) : null,
            categoria_id: form.categoria_id || null,
            ativo: form.ativo,
            destaque: form.destaque,
            imagem_url: form.imagem_url
        }

        try {
            if (produtoEditando) {
                // Atualizar
                await supabase
                    .from('produtos')
                    .update(dados)
                    .eq('id', produtoEditando.id)
            } else {
                // Criar
                await supabase
                    .from('produtos')
                    .insert(dados)
            }

            setModalAberto(false)
            carregarDados()
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar produto')
        } finally {
            setSalvando(false)
        }
    }

    // Excluir produto
    const excluirProduto = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return

        await supabase
            .from('produtos')
            .delete()
            .eq('id', id)

        carregarDados()
    }

    // Filtrar produtos
    const produtosFiltrados = produtos.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase())
        const matchCategoria = !filtroCategoria || p.categoria_id == filtroCategoria
        return matchSearch && matchCategoria
    })

    if (loading) {
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
                    <h1 className="text-2xl font-bold text-white">Produtos</h1>
                    <p className="text-gray-400">{produtos.length} produtos cadastrados</p>
                </div>
                <button
                    onClick={novoProduto}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#c9a432]"
                >
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                </div>
                <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                    <option value="">Todas categorias</option>
                    {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>

            {/* Grid de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {produtosFiltrados.map(produto => (
                    <div
                        key={produto.id}
                        className={`bg-[#1a1a1a] rounded-xl border overflow-hidden ${produto.ativo ? 'border-gray-800' : 'border-red-900 opacity-60'
                            }`}
                    >
                        {/* Imagem */}
                        <div className="aspect-video bg-gray-800 relative">
                            {produto.imagem_url ? (
                                <img
                                    src={produto.imagem_url}
                                    alt={produto.nome}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image size={40} className="text-gray-600" />
                                </div>
                            )}
                            {produto.destaque && (
                                <span className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-full font-bold">
                                    Destaque
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <p className="text-xs text-gray-500 mb-1">
                                {produto.categorias?.nome || 'Sem categoria'}
                            </p>
                            <h3 className="font-bold text-white mb-1">{produto.nome}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                {produto.descricao || 'Sem descrição'}
                            </p>

                            <div className="flex items-center justify-between">
                                <div>
                                    {produto.preco_promocional ? (
                                        <>
                                            <span className="text-gray-500 line-through text-sm">
                                                R$ {produto.preco?.toFixed(2)}
                                            </span>
                                            <span className="text-[#D4AF37] font-bold ml-2">
                                                R$ {produto.preco_promocional?.toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-[#D4AF37] font-bold">
                                            R$ {produto.preco?.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editarProduto(produto)}
                                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => excluirProduto(produto.id)}
                                        className="p-2 bg-gray-800 rounded-lg hover:bg-red-900"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Edição */}
            {modalAberto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">
                                {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={() => setModalAberto(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-4 space-y-4">
                            {/* Upload de Imagem */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Imagem</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center cursor-pointer hover:border-[#D4AF37] transition"
                                >
                                    {uploadingImage ? (
                                        <Loader2 className="animate-spin" size={40} />
                                    ) : previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <Upload size={40} className="mx-auto text-gray-600 mb-2" />
                                            <p className="text-gray-400">Clique para fazer upload</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Nome */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome *</label>
                                <input
                                    type="text"
                                    value={form.nome}
                                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    placeholder="Nome do produto"
                                />
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                                <textarea
                                    value={form.descricao}
                                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                                    rows={3}
                                    placeholder="Descrição do produto"
                                />
                            </div>

                            {/* Preços */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Preço *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.preco}
                                        onChange={(e) => setForm({ ...form, preco: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Preço Promocional</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.preco_promocional}
                                        onChange={(e) => setForm({ ...form, preco_promocional: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Categoria</label>
                                <select
                                    value={form.categoria_id}
                                    onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                >
                                    <option value="">Sem categoria</option>
                                    {categorias.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Switches */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.ativo}
                                        onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-white">Ativo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.destaque}
                                        onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-white">Destaque</span>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-4 border-t border-gray-800">
                            <button
                                onClick={() => setModalAberto(false)}
                                className="flex-1 py-3 bg-gray-800 rounded-lg hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarProduto}
                                disabled={salvando}
                                className="flex-1 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#c9a432] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {salvando ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Save size={20} /> Salvar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
