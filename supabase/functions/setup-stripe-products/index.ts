// Stripe Edge Function - Setup Products (executar uma vez)
// Deploy: supabase functions deploy setup-stripe-products

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Verificar se já existem os produtos
        const existingProducts = await stripe.products.list({ limit: 10 })
        const foodSaasProducts = existingProducts.data.filter(p =>
            p.name === 'Food SaaS Básico' || p.name === 'Food SaaS Profissional'
        )

        if (foodSaasProducts.length >= 2) {
            // Buscar preços existentes
            const prices = await stripe.prices.list({
                limit: 10,
                active: true,
            })

            const basicoPrice = prices.data.find(p => p.unit_amount === 4990)
            const proPrice = prices.data.find(p => p.unit_amount === 9990)

            return new Response(
                JSON.stringify({
                    message: 'Produtos já existem',
                    prices: {
                        basico: basicoPrice?.id,
                        pro: proPrice?.id,
                    }
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Criar produto Básico
        const produtoBasico = await stripe.products.create({
            name: 'Food SaaS Básico',
            description: 'Cardápio digital, App Delivery, App do Garçom, PDV Completo, Gestão de Mesas. Até 50 produtos.',
            metadata: {
                plano: 'basico',
            },
        })

        const precoBasico = await stripe.prices.create({
            product: produtoBasico.id,
            unit_amount: 4990, // R$ 49,90 em centavos
            currency: 'brl',
            recurring: {
                interval: 'month',
            },
            metadata: {
                plano: 'basico',
            },
        })

        // Criar produto Profissional
        const produtoPro = await stripe.products.create({
            name: 'Food SaaS Profissional',
            description: 'Tudo do Básico + Produtos ilimitados, Relatórios avançados, Múltiplos usuários, Suporte prioritário.',
            metadata: {
                plano: 'pro',
            },
        })

        const precoPro = await stripe.prices.create({
            product: produtoPro.id,
            unit_amount: 9990, // R$ 99,90 em centavos
            currency: 'brl',
            recurring: {
                interval: 'month',
            },
            metadata: {
                plano: 'pro',
            },
        })

        return new Response(
            JSON.stringify({
                message: 'Produtos criados com sucesso!',
                products: {
                    basico: {
                        product_id: produtoBasico.id,
                        price_id: precoBasico.id,
                    },
                    pro: {
                        product_id: produtoPro.id,
                        price_id: precoPro.id,
                    },
                },
                instrucoes: 'Adicione estes PRICE_IDs como secrets no Supabase: STRIPE_PRICE_BASICO e STRIPE_PRICE_PRO',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Erro ao criar produtos:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
