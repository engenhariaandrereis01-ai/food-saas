// Stripe Edge Function - Webhook Handler
// Deploy: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Limites de produtos por plano
const LIMITES_PLANO = {
    trial: 20,
    basico: 50,
    pro: -1, // ilimitado
}

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        console.log(`Webhook recebido: ${event.type}`)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const tenantId = session.metadata?.tenant_id
                const plano = session.metadata?.plano || 'basico'

                if (tenantId) {
                    // Buscar subscription para pegar mais detalhes
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    )

                    await supabase
                        .from('tenants')
                        .update({
                            plano: plano,
                            assinatura_ativa: true,
                            subscription_status: subscription.status,
                            stripe_subscription_id: subscription.id,
                            stripe_price_id: subscription.items.data[0]?.price.id,
                            limite_produtos: LIMITES_PLANO[plano as keyof typeof LIMITES_PLANO] || 50,
                            ultimo_pagamento: new Date().toISOString(),
                            proxima_cobranca: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                        .eq('id', tenantId)

                    console.log(`Tenant ${tenantId} atualizado para plano ${plano}`)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const tenantId = subscription.metadata?.tenant_id

                if (tenantId) {
                    const isActive = ['active', 'trialing'].includes(subscription.status)

                    await supabase
                        .from('tenants')
                        .update({
                            assinatura_ativa: isActive,
                            subscription_status: subscription.status,
                            proxima_cobranca: new Date(subscription.current_period_end * 1000).toISOString(),
                        })
                        .eq('id', tenantId)

                    console.log(`Subscription do tenant ${tenantId} atualizada: ${subscription.status}`)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const tenantId = subscription.metadata?.tenant_id

                if (tenantId) {
                    await supabase
                        .from('tenants')
                        .update({
                            plano: 'trial',
                            assinatura_ativa: false,
                            subscription_status: 'canceled',
                            stripe_subscription_id: null,
                            stripe_price_id: null,
                            limite_produtos: 20,
                        })
                        .eq('id', tenantId)

                    console.log(`Tenant ${tenantId} voltou para trial após cancelamento`)
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const subscription = await stripe.subscriptions.retrieve(
                    invoice.subscription as string
                )
                const tenantId = subscription.metadata?.tenant_id

                if (tenantId) {
                    await supabase
                        .from('tenants')
                        .update({
                            subscription_status: 'past_due',
                        })
                        .eq('id', tenantId)

                    console.log(`Pagamento falhou para tenant ${tenantId}`)
                    // TODO: Enviar email de notificação
                }
                break
            }

            default:
                console.log(`Evento não tratado: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Erro no webhook:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
