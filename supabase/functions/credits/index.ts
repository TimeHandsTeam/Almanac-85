import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Credit pack definitions — must match RevenueCat product IDs
const CREDIT_PACKS: Record<string, number> = {
  almanac85_credits_10: 10,
  almanac85_credits_50: 50,
  almanac85_credits_200: 200,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // GET: return current balance
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('credits')
      .select('balance, updated_at')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return new Response(JSON.stringify({ balance: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ balance: data.balance, updated_at: data.updated_at }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // POST: handle purchase credit grant
  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}))
    const { product_id } = body

    if (!product_id || !(product_id in CREDIT_PACKS)) {
      return new Response(JSON.stringify({ error: 'Invalid product_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const amount = CREDIT_PACKS[product_id]

    const { error: addError } = await supabase.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: amount,
    })

    if (addError) {
      return new Response(JSON.stringify({ error: addError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: updated } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    return new Response(JSON.stringify({ success: true, balance: updated?.balance ?? 0, added: amount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
