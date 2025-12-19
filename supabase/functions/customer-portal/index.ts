// Stripe Edge Function - Customer Portal
// Deploy: supabase functions deploy customer-portal

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
        const { tenant_id, return_url } = await req.json()

        if (!tenant_id) {
            return new Response(
                JSON.stringify({ error: 'tenant_id é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Buscar tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('stripe_customer_id')
            .eq('id', tenant_id)
            .single()

        if (tenantError || !tenant?.stripe_customer_id) {
            return new Response(
                JSON.stringify({ error: 'Cliente Stripe não encontrado. Faça uma assinatura primeiro.' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Criar sessão do Customer Portal
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: tenant.stripe_customer_id,
            return_url: return_url || `${req.headers.get('origin')}/dashboard/billing`,
        })

        return new Response(
            JSON.stringify({ url: portalSession.url }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Erro ao criar portal session:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
