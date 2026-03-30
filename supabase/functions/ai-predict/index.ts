import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictRequest {
  type: 'outcome' | 'prop'
  sport: string
  homeTeam?: string
  awayTeam?: string
  matchId?: string
  propDescription?: string
}

interface PredictionResult {
  type: 'outcome' | 'prop'
  home_win_pct?: number
  away_win_pct?: number
  draw_pct?: number
  prop_probability?: number
  prop_hit_rate?: string
  confidence: number
  reasoning: string
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

  // Verify user JWT
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Check credits
  const { data: credits } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  if (!credits || credits.balance < 1) {
    return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
      status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: PredictRequest
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { type, sport, homeTeam, awayTeam, matchId, propDescription } = body

  if (!type || !sport) {
    return new Response(JSON.stringify({ error: 'type and sport are required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (type === 'outcome' && (!homeTeam || !awayTeam)) {
    return new Response(JSON.stringify({ error: 'homeTeam and awayTeam required for outcome predictions' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (type === 'prop' && !propDescription) {
    return new Response(JSON.stringify({ error: 'propDescription required for prop predictions' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Build prompt
  const systemPrompt = `You are an expert sports analyst and statistician. Analyze matchups and provide precise probability predictions based on team performance, historical data, and current form. Always respond with valid JSON only — no markdown, no explanation outside the JSON.`

  let userPrompt: string
  if (type === 'outcome') {
    userPrompt = `Analyze this ${sport} matchup and predict the outcome:
Home team: ${homeTeam}
Away team: ${awayTeam}

Respond with JSON in this exact format:
{
  "home_win_pct": <0-100>,
  "away_win_pct": <0-100>,
  "draw_pct": <0-100>,
  "confidence": <1-10>,
  "reasoning": "<2-3 sentence analysis>"
}
Note: home_win_pct + away_win_pct + draw_pct must sum to 100.`
  } else {
    userPrompt = `Analyze this ${sport} prop bet and estimate the probability:
Prop: ${propDescription}

Respond with JSON in this exact format:
{
  "prop_probability": <0-100>,
  "prop_hit_rate": "<historical context like '58% in last 10 games'>",
  "confidence": <1-10>,
  "reasoning": "<2-3 sentence analysis>"
}`
  }

  // Call Anthropic API
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `AI service error: ${errText}` }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const anthropicData = await anthropicRes.json()
  const rawText = anthropicData.content?.[0]?.text ?? '{}'

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const result: PredictionResult = {
    type,
    confidence: Number(parsed.confidence) || 5,
    reasoning: String(parsed.reasoning || ''),
    ...(type === 'outcome' ? {
      home_win_pct: Number(parsed.home_win_pct) || 0,
      away_win_pct: Number(parsed.away_win_pct) || 0,
      draw_pct: Number(parsed.draw_pct) || 0,
    } : {
      prop_probability: Number(parsed.prop_probability) || 0,
      prop_hit_rate: String(parsed.prop_hit_rate || ''),
    }),
  }

  // Deduct 1 credit atomically
  const { error: deductError } = await supabase.rpc('deduct_credit', { p_user_id: user.id })
  if (deductError) {
    return new Response(JSON.stringify({ error: 'Failed to deduct credit' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Log prediction
  const { data: prediction } = await supabase.from('predictions').insert({
    user_id: user.id,
    match_id: matchId ?? null,
    type,
    prompt: { sport, homeTeam, awayTeam, propDescription },
    result,
    credits_used: 1,
  }).select().single()

  return new Response(JSON.stringify({ prediction, result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
