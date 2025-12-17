import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {
    Plus, Pencil, Trash2, Upload, X, Save, Image,
    Search, Loader2, Package
} from 'lucide-react'

export function AdminProdutos() {
    const [produtos, setProdutos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState(null)
    const [search, setSearch] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')

    // Modal
    const [modalAberto, setModalAberto] = useState(false)
    const [produtoEditando, setProdutoEditando] = useState(null)
    const [salvando, setSalvando] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const fileInputRef = useRef(null)

    // Form
    const [form, setForm] = useState({
        nome: '', descricao: '', preco: '', preco_promocional: '',
        categoria_id: '', ativo: true, destaque: false, imagem_url: ''
    })

    // Buscar tenant ao montar
    useEffect(() => {
        const init = async () => {
            try {
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
            } catch (err) {
                console.error('Erro:', err)
                setLoading(false)
            }
        }
        init()
    }, [])

    // Carregar dados quando tiver tenant
    useEffect(() => {
        if (tenantId) carregarDados()
    }, [tenantId])

    const carregarDados = async () => {
        setLoading(true)

        const [catsRes, prodsRes] = await Promise.all([
            supabase.from('categorias').select('*').eq('tenant_id', tenantId).order('ordem'),
            supabase.from('produtos').select('*, categorias(nome)').eq('tenant_id', tenantId).order('nome')
        ])

        setCategorias(catsRes.data || [])
        setProdutos(prodsRes.data || [])
        setLoading(false)
    }

    const novoProduto = () => {
        setProdutoEditando(null)
        setForm({ nome: '', descricao: '', preco: '', preco_promocional: '', categoria_id: '', ativo: true, destaque: false, imagem_url: '' })
        setPreviewImage(null)
        setModalAberto(true)
    }

    const editarProduto = (p) => {
        setProdutoEditando(p)
        setForm({
            nome: p.nome, descricao: p.descricao || '', preco: p.preco?.toString() || '',
            preco_promocional: p.preco_promocional?.toString() || '', categoria_id: p.categoria_id || '',
            ativo: p.ativo, destaque: p.destaque || false, imagem_url: p.imagem_url || ''
        })
        setPreviewImage(p.imagem_url)
        setModalAberto(true)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !tenantId) return

        const reader = new FileReader()
        reader.onload = (e) => setPreviewImage(e.target?.result)
        reader.readAsDataURL(file)

        setUploadingImage(true)
        try {
            const fileName = `${tenantId}/${Date.now()}.${file.name.split('.').pop()}`
            const { error } = await supabase.storage.from('produtos').upload(fileName, file)
            if (error) throw error
            const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(fileName)
            setForm({ ...form, imagem_url: publicUrl })
        } catch (error) {
            alert('Erro no upload: ' + error.message)
        } finally {
            setUploadingImage(false)
        }
    }

    const salvarProduto = async () => {
        if (!form.nome || !form.preco) { alert('Preencha nome e preço'); return }
        setSalvando(true)

        const dados = {
            tenant_id: tenantId, nome: form.nome, descricao: form.descricao,
            preco: parseFloat(form.preco), preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional) : null,
            categoria_id: form.categoria_id || null, ativo: form.ativo, destaque: form.destaque, imagem_url: form.imagem_url
        }

        try {
            if (produtoEditando) {
                await supabase.from('produtos').update(dados).eq('id', produtoEditando.id)
            } else {
                await supabase.from('produtos').insert(dados)
            }
            setModalAberto(false)
            carregarDados()
        } catch (error) {
            alert('Erro: ' + error.message)
        } finally {
            setSalvando(false)
        }
    }

    const excluirProduto = async (id) => {
        if (!confirm('Excluir produto?')) return
        await supabase.from('produtos').delete().eq('id', id)
        carregarDados()
    }

    const produtosFiltrados = produtos.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase())
        const matchCat = !filtroCategoria || p.categoria_id == filtroCategoria
        return matchSearch && matchCat
    })

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#D4AF37]" size={40} /></div>
    if (!tenantId) return <div className="flex items-center justify-center h-64"><p className="text-red-400">Restaurante não encontrado</p></div>

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Produtos</h1>
                    <p className="text-gray-400">{produtos.length} produtos</p>
                </div>
                <button onClick={novoProduto} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg">
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value="">Todas</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
            </div>

            {produtosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-gray-800">
                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">Nenhum produto</p>
                    <button onClick={novoProduto} className="px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg">Criar produto</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {produtosFiltrados.map(p => (
                        <div key={p.id} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                            <div className="aspect-video bg-gray-800 relative">
                                {p.imagem_url ? <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><Image size={40} className="text-gray-600" /></div>}
                                {p.destaque && <span className="absolute top-2 right-2 bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-full font-bold">Destaque</span>}
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{p.categorias?.nome || 'Sem categoria'}</p>
                                <h3 className="font-bold text-white mb-1">{p.nome}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#D4AF37] font-bold">R$ {p.preco?.toFixed(2)}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => editarProduto(p)} className="p-2 bg-gray-800 rounded-lg"><Pencil size={16} /></button>
                                        <button onClick={() => excluirProduto(p.id)} className="p-2 bg-gray-800 rounded-lg hover:bg-red-900"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalAberto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">{produtoEditando ? 'Editar' : 'Novo'} Produto</h2>
                            <button onClick={() => setModalAberto(false)}><X size={24} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center cursor-pointer">
                                {uploadingImage ? <Loader2 className="animate-spin" size={40} />
                                    : previewImage ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                        : <div className="text-center"><Upload size={40} className="mx-auto text-gray-600 mb-2" /><p className="text-gray-400">Upload imagem</p></div>}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                            <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome *"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                            <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none" rows={2} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="Preço *"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                                <input type="number" step="0.01" value={form.preco_promocional} onChange={(e) => setForm({ ...form, preco_promocional: e.target.value })} placeholder="Promocional"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                            </div>
                            <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                <option value="">Sem categoria</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="w-5 h-5" /><span className="text-white">Ativo</span></label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} className="w-5 h-5" /><span className="text-white">Destaque</span></label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-gray-800">
                            <button onClick={() => setModalAberto(false)} className="flex-1 py-3 bg-gray-800 rounded-lg">Cancelar</button>
                            <button onClick={salvarProduto} disabled={salvando} className="flex-1 py-3 bg-[#D4AF37] text-black font-bold rounded-lg flex items-center justify-center gap-2">
                                {salvando ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
