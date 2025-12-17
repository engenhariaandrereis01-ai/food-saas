import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    Plus, Pencil, Trash2, X, Save, GripVertical,
    Loader2, FolderOpen
} from 'lucide-react'

export function AdminCategorias() {
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState(null)

    // Modal de edição
    const [modalAberto, setModalAberto] = useState(false)
    const [categoriaEditando, setCategoriaEditando] = useState(null)
    const [salvando, setSalvando] = useState(false)

    // Form
    const [form, setForm] = useState({
        nome: '',
        descricao: '',
        ordem: 0,
        ativo: true
    })

    // Buscar tenant ID ao montar
    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    console.log('Nenhum usuário logado')
                    setLoading(false)
                    return
                }

                console.log('Buscando tenant para user:', user.id)

                const { data, error } = await supabase
                    .from('usuarios_tenant')
                    .select('tenant_id')
                    .eq('user_id', user.id)
                    .limit(1)

                if (error) {
                    console.error('Erro ao buscar tenant:', error)
                    setLoading(false)
                    return
                }

                if (data && data.length > 0 && data[0].tenant_id) {
                    console.log('Tenant encontrado:', data[0].tenant_id)
                    setTenantId(data[0].tenant_id)
                } else {
                    console.log('Usuário sem tenant')
                    setLoading(false)
                }
            } catch (err) {
                console.error('Erro:', err)
                setLoading(false)
            }
        }

        init()
    }, [])

    // Carregar categorias quando tiver tenantId
    useEffect(() => {
        if (tenantId) {
            carregarCategorias()
        }
    }, [tenantId])

    const carregarCategorias = async () => {
        setLoading(true)
        console.log('Carregando categorias para tenant:', tenantId)

        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('ordem')

        if (error) {
            console.error('Erro ao carregar categorias:', error)
        } else {
            console.log('Categorias carregadas:', data?.length || 0)
            setCategorias(data || [])
        }

        setLoading(false)
    }

    const novaCategoria = () => {
        setCategoriaEditando(null)
        setForm({ nome: '', descricao: '', ordem: categorias.length, ativo: true })
        setModalAberto(true)
    }

    const editarCategoria = (categoria) => {
        setCategoriaEditando(categoria)
        setForm({
            nome: categoria.nome,
            descricao: categoria.descricao || '',
            ordem: categoria.ordem || 0,
            ativo: categoria.ativo
        })
        setModalAberto(true)
    }

    const salvarCategoria = async () => {
        if (!form.nome) {
            alert('Preencha o nome da categoria')
            return
        }

        setSalvando(true)

        const dados = {
            tenant_id: tenantId,
            nome: form.nome,
            descricao: form.descricao,
            ordem: form.ordem,
            ativo: form.ativo
        }

        try {
            if (categoriaEditando) {
                await supabase.from('categorias').update(dados).eq('id', categoriaEditando.id)
            } else {
                await supabase.from('categorias').insert(dados)
            }

            setModalAberto(false)
            carregarCategorias()
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar categoria')
        } finally {
            setSalvando(false)
        }
    }

    const excluirCategoria = async (categoria) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

        await supabase.from('categorias').delete().eq('id', categoria.id)
        carregarCategorias()
    }

    // Loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
            </div>
        )
    }

    // Sem tenant
    if (!tenantId) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Restaurante não encontrado</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg">
                        Recarregar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Categorias</h1>
                    <p className="text-gray-400">{categorias.length} categorias</p>
                </div>
                <button onClick={novaCategoria} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg">
                    <Plus size={20} /> Nova Categoria
                </button>
            </div>

            {categorias.length === 0 ? (
                <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-gray-800">
                    <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">Nenhuma categoria cadastrada</p>
                    <button onClick={novaCategoria} className="px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg">
                        Criar primeira categoria
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {categorias.map((categoria, index) => (
                        <div key={categoria.id} className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                            <GripVertical size={20} className="text-gray-600" />
                            <span className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 text-sm">{index + 1}</span>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">{categoria.nome}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoria.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {categoria.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => editarCategoria(categoria)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => excluirCategoria(categoria)} className="p-2 bg-gray-800 rounded-lg hover:bg-red-900">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalAberto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] rounded-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">{categoriaEditando ? 'Editar' : 'Nova'} Categoria</h2>
                            <button onClick={() => setModalAberto(false)}><X size={24} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome *</label>
                                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" placeholder="Nome" />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="w-5 h-5 rounded" />
                                <span className="text-white">Ativa</span>
                            </label>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-gray-800">
                            <button onClick={() => setModalAberto(false)} className="flex-1 py-3 bg-gray-800 rounded-lg">Cancelar</button>
                            <button onClick={salvarCategoria} disabled={salvando} className="flex-1 py-3 bg-[#D4AF37] text-black font-bold rounded-lg flex items-center justify-center gap-2">
                                {salvando ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
