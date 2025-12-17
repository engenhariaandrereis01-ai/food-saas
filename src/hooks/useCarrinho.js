import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar carrinho de compras
 * Persiste no localStorage por tenant
 */
export function useCarrinho(tenantId) {
    const [itens, setItens] = useState([])
    const STORAGE_KEY = `carrinho_${tenantId}`

    // Carregar do localStorage ao montar
    useEffect(() => {
        if (tenantId) {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    setItens(JSON.parse(saved))
                } catch (e) {
                    console.error('Erro ao carregar carrinho:', e)
                }
            }
        }
    }, [tenantId])

    // Salvar no localStorage quando mudar
    useEffect(() => {
        if (tenantId) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
        }
    }, [itens, tenantId])

    // Adicionar produto ao carrinho
    const adicionar = (produto, quantidade = 1, observacoes = '') => {
        setItens(prev => {
            // Verificar se já existe
            const existente = prev.find(item =>
                item.produto_id === produto.id &&
                item.observacoes === observacoes
            )

            if (existente) {
                return prev.map(item =>
                    item.produto_id === produto.id && item.observacoes === observacoes
                        ? { ...item, quantidade: item.quantidade + quantidade }
                        : item
                )
            }

            // Novo item
            return [...prev, {
                id: Date.now(),
                produto_id: produto.id,
                nome: produto.nome,
                preco: produto.preco_promocional || produto.preco,
                imagem_url: produto.imagem_url,
                quantidade,
                observacoes
            }]
        })
    }

    // Remover item
    const remover = (itemId) => {
        setItens(prev => prev.filter(item => item.id !== itemId))
    }

    // Atualizar quantidade
    const atualizarQuantidade = (itemId, quantidade) => {
        if (quantidade <= 0) {
            remover(itemId)
            return
        }
        setItens(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantidade } : item
            )
        )
    }

    // Limpar carrinho
    const limpar = () => {
        setItens([])
        localStorage.removeItem(STORAGE_KEY)
    }

    // Calcular total
    const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)

    // Quantidade total de itens
    const quantidadeTotal = itens.reduce((sum, item) => sum + item.quantidade, 0)

    return {
        itens,
        adicionar,
        remover,
        atualizarQuantidade,
        limpar,
        total,
        quantidadeTotal,
        temItens: itens.length > 0
    }
}
