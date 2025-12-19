import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook para verificar plano e limites do tenant
 */
export function usePlano(tenantId) {
    const [plano, setPlano] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!tenantId) {
            setLoading(false)
            return
        }

        const loadPlano = async () => {
            const { data } = await supabase
                .from('tenants')
                .select('plano, trial_inicio, trial_fim, assinatura_ativa, limite_produtos')
                .eq('id', tenantId)
                .single()

            if (data) {
                const agora = new Date()
                const trialFim = data.trial_fim ? new Date(data.trial_fim) : null
                const trialExpirado = trialFim && agora > trialFim
                const trialAtivo = data.plano === 'trial' && !trialExpirado

                setPlano({
                    tipo: data.plano || 'trial',
                    trialAtivo,
                    trialExpirado: data.plano === 'trial' && trialExpirado,
                    trialFim: data.trial_fim,
                    diasRestantes: trialFim
                        ? Math.max(0, Math.ceil((trialFim - agora) / (1000 * 60 * 60 * 24)))
                        : 0,
                    assinaturaAtiva: data.assinatura_ativa,
                    limiteProdutos: data.limite_produtos || 20,
                    acessoLiberado: data.assinatura_ativa || trialAtivo
                })
            }
            setLoading(false)
        }

        loadPlano()
    }, [tenantId])

    return { plano, loading }
}

/**
 * Definição dos planos disponíveis
 */
export const PLANOS = {
    trial: {
        nome: 'Trial',
        preco: 0,
        limiteProdutos: 20,
        recursos: [
            'Cardápio digital',
            'App Delivery',
            'App do Garçom',
            'Até 20 produtos',
            'Pedidos ilimitados'
        ]
    },
    basico: {
        nome: 'Básico',
        preco: 49.90,
        limiteProdutos: 50,
        recursos: [
            'Tudo do Trial +',
            'Até 50 produtos',
            'PDV Completo',
            'Gestão de Mesas',
            'Personalização completa'
        ]
    },
    pro: {
        nome: 'Profissional',
        preco: 99.90,
        limiteProdutos: -1, // ilimitado
        recursos: [
            'Tudo do Básico +',
            'Produtos ilimitados',
            'Relatórios avançados',
            'Múltiplos usuários',
            'Suporte prioritário'
        ]
    }
}
