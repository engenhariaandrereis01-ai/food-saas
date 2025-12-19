// Stripe Edge Function - Create Checkout Session
// Deploy: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// IDs dos preços no Stripe (serão criados automaticamente)
const PRICE_IDS = {
    basico: Deno.env.get('STRIPE_PRICE_BASICO') || '',
    pro: Deno.env.get('STRIPE_PRICE_PRO') || '',
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { tenant_id, plano, user_email, success_url, cancel_url } = await req.json()

        if (!tenant_id || !plano || !user_email) {
            return new Response(
                JSON.stringify({ error: 'tenant_id, plano e user_email são obrigatórios' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const priceId = PRICE_IDS[plano as keyof typeof PRICE_IDS]
        if (!priceId) {
            return new Response(
                JSON.stringify({ error: `Plano inválido: ${plano}` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Buscar tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id, nome, stripe_customer_id')
            .eq('id', tenant_id)
            .single()

        if (tenantError || !tenant) {
            return new Response(
                JSON.stringify({ error: 'Tenant não encontrado' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Criar ou recuperar customer no Stripe
        let customerId = tenant.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user_email,
                name: tenant.nome,
                metadata: {
                    tenant_id: tenant_id,
                },
            })
            customerId = customer.id

            // Salvar customer_id no banco
            await supabase
                .from('tenants')
                .update({ stripe_customer_id: customerId })
                .eq('id', tenant_id)
        }

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: success_url || `${req.headers.get('origin')}/dashboard/billing?success=true`,
            cancel_url: cancel_url || `${req.headers.get('origin')}/dashboard/billing?canceled=true`,
            subscription_data: {
                metadata: {
                    tenant_id: tenant_id,
                    plano: plano,
                },
            },
            metadata: {
                tenant_id: tenant_id,
                plano: plano,
            },
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Erro ao criar checkout:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
