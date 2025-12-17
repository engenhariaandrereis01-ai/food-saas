import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import {
    Loader2, Save, Upload, Palette, Clock, MapPin,
    Phone, DollarSign, Image as ImageIcon
} from 'lucide-react'

export function Configuracoes() {
    const [tenant, setTenant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [mensagem, setMensagem] = useState(null)
    const fileInputRef = useRef(null)

    // Form
    const [form, setForm] = useState({
        nome: '',
        slug: '',
        cor_primaria: '#D4AF37',
        logo_url: '',
        whatsapp: '',
        cidade: '',
        endereco: '',
        taxa_entrega_padrao: 0,
        pedido_minimo: 0,
        horario_abertura: '18:00',
        horario_fechamento: '23:00'
    })

    // Carregar tenant
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
                const t = data[0].tenants
                setTenant(t)
                setForm({
                    nome: t.nome || '',
                    slug: t.slug || '',
                    cor_primaria: t.cor_primaria || '#D4AF37',
                    logo_url: t.logo_url || '',
                    whatsapp: t.whatsapp || '',
                    cidade: t.cidade || '',
                    endereco: t.endereco || '',
                    taxa_entrega_padrao: t.taxa_entrega_padrao || 0,
                    pedido_minimo: t.pedido_minimo || 0,
                    horario_abertura: t.horario_abertura || '18:00',
                    horario_fechamento: t.horario_fechamento || '23:00'
                })
            }
            setLoading(false)
        }
        init()
    }, [])

    // Upload de logo
    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !tenant) return

        setUploadingLogo(true)
        try {
            const fileName = `logos/${tenant.id}/${Date.now()}.${file.name.split('.').pop()}`
            const { error } = await supabase.storage.from('produtos').upload(fileName, file)
            if (error) throw error

            const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(fileName)
            setForm({ ...form, logo_url: publicUrl })
        } catch (error) {
            console.error('Erro no upload:', error)
            alert('Erro ao fazer upload do logo')
        } finally {
            setUploadingLogo(false)
        }
    }

    // Salvar configurações
    const salvar = async () => {
        setSalvando(true)
        setMensagem(null)

        try {
            const { error } = await supabase
                .from('tenants')
                .update({
                    nome: form.nome,
                    cor_primaria: form.cor_primaria,
                    logo_url: form.logo_url,
                    whatsapp: form.whatsapp,
                    cidade: form.cidade,
                    endereco: form.endereco,
                    taxa_entrega_padrao: parseFloat(form.taxa_entrega_padrao) || 0,
                    pedido_minimo: parseFloat(form.pedido_minimo) || 0,
                    horario_abertura: form.horario_abertura,
                    horario_fechamento: form.horario_fechamento
                })
                .eq('id', tenant.id)

            if (error) throw error
            setMensagem({ tipo: 'sucesso', texto: 'Configurações salvas com sucesso!' })
        } catch (err) {
            console.error('Erro ao salvar:', err)
            setMensagem({ tipo: 'erro', texto: 'Erro ao salvar configurações' })
        } finally {
            setSalvando(false)
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
        <div className="p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-gray-400">Personalize seu restaurante</p>
            </div>

            {/* Mensagem */}
            {mensagem && (
                <div className={`mb-6 p-4 rounded-xl ${mensagem.tipo === 'sucesso' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {mensagem.texto}
                </div>
            )}

            <div className="space-y-6">
                {/* Identidade Visual */}
                <section className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Palette size={20} className="text-[#D4AF37]" />
                        Identidade Visual
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Logo</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-600 transition overflow-hidden"
                            >
                                {uploadingLogo ? (
                                    <Loader2 className="animate-spin text-gray-500" size={32} />
                                ) : form.logo_url ? (
                                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon size={32} className="mx-auto text-gray-600 mb-2" />
                                        <span className="text-xs text-gray-500">Upload</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </div>

                        {/* Cor Primária */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Cor Primária</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={form.cor_primaria}
                                    onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })}
                                    className="w-16 h-16 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={form.cor_primaria}
                                    onChange={(e) => setForm({ ...form, cor_primaria: e.target.value })}
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                                />
                            </div>
                            {/* Preview */}
                            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: form.cor_primaria + '20' }}>
                                <span className="font-bold" style={{ color: form.cor_primaria }}>Preview da cor</span>
                            </div>
                        </div>
                    </div>

                    {/* Nome */}
                    <div className="mt-6">
                        <label className="block text-sm text-gray-400 mb-2">Nome do Restaurante</label>
                        <input
                            type="text"
                            value={form.nome}
                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                    </div>

                    {/* Slug */}
                    <div className="mt-4">
                        <label className="block text-sm text-gray-400 mb-2">Link do Cardápio</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">foodsaas.com/</span>
                            <input
                                type="text"
                                value={form.slug}
                                disabled
                                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Contato e Localização */}
                <section className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-[#D4AF37]" />
                        Contato e Localização
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={form.whatsapp}
                                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                    placeholder="5511999999999"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Cidade</label>
                            <input
                                type="text"
                                value={form.cidade}
                                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm text-gray-400 mb-2">Endereço</label>
                        <input
                            type="text"
                            value={form.endereco}
                            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                        />
                    </div>
                </section>

                {/* Horários */}
                <section className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-[#D4AF37]" />
                        Horário de Funcionamento
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Abertura</label>
                            <input
                                type="time"
                                value={form.horario_abertura}
                                onChange={(e) => setForm({ ...form, horario_abertura: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Fechamento</label>
                            <input
                                type="time"
                                value={form.horario_fechamento}
                                onChange={(e) => setForm({ ...form, horario_fechamento: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Delivery */}
                <section className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-[#D4AF37]" />
                        Valores
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Taxa de Entrega (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.taxa_entrega_padrao}
                                onChange={(e) => setForm({ ...form, taxa_entrega_padrao: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Pedido Mínimo (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.pedido_minimo}
                                onChange={(e) => setForm({ ...form, pedido_minimo: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Botão Salvar */}
                <button
                    onClick={salvar}
                    disabled={salvando}
                    className="w-full py-4 rounded-xl font-bold text-black text-lg flex items-center justify-center gap-2 bg-[#D4AF37] hover:opacity-90 disabled:opacity-50"
                >
                    {salvando ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <Save size={20} />
                            Salvar Configurações
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
