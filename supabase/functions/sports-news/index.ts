import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'

const SPORT_MAP: Record<string, { sport: string; league: string }> = {
  soccer:     { sport: 'soccer',      league: 'eng.1' },
  basketball: { sport: 'basketball',  league: 'nba' },
  football:   { sport: 'football',    league: 'nfl' },
  baseball:   { sport: 'baseball',    league: 'mlb' },
  hockey:     { sport: 'hockey',      league: 'nhl' },
  tennis:     { sport: 'tennis',      league: 'atp' },
  golf:       { sport: 'golf',        league: 'pga' },
  mma:        { sport: 'mma',         league: 'ufc' },
  boxing:     { sport: 'boxing',      league: 'boxing' },
  rugby:      { sport: 'rugby-union', league: 'eng.1' },
  volleyball: { sport: 'volleyball',  league: 'avp' },
  cricket:    { sport: 'cricket',     league: 'icc.world' },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const sportSlug: string = body?.sport ?? 'basketball'
    const mapping = SPORT_MAP[sportSlug] ?? SPORT_MAP['basketball']

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Check cache (15 min TTL)
    const cacheKey = `news:${sportSlug}`
    const { data: cacheEntry } = await supabase
      .from('cache_log')
      .select('expires_at')
      .eq('cache_key', cacheKey)
      .single()

    const isCacheFresh = cacheEntry && new Date(cacheEntry.expires_at) > new Date()

    if (isCacheFresh) {
      const { data: sport } = await supabase.from('sports').select('id').eq('slug', sportSlug).single()
      if (sport) {
        const { data: articles } = await supabase
          .from('articles')
          .select('*')
          .eq('sport_id', sport.id)
          .order('published_at', { ascending: false })
          .limit(20)
        // Only serve cache if it actually has articles (guard against empty-cache poison)
        if (articles && articles.length > 0) {
          return new Response(JSON.stringify({ articles, cached: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
    }

    // Fetch from ESPN
    const espnUrl = `${ESPN_BASE}/${mapping.sport}/${mapping.league}/news`
    const espnRes = await fetch(espnUrl)
    if (!espnRes.ok) {
      return new Response(JSON.stringify({ articles: [], error: 'ESPN news fetch failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const espnData = await espnRes.json()
    const newsItems: any[] = espnData?.articles ?? espnData?.news ?? []

    // Get or create sport
    let { data: sport } = await supabase.from('sports').select('id').eq('slug', sportSlug).single()
    if (!sport) {
      const { data: ns } = await supabase.from('sports')
        .insert({ name: sportSlug, slug: sportSlug, display_order: 99 })
        .select('id').single()
      sport = ns
    }

    const articles: any[] = []
    for (const item of newsItems.slice(0, 20)) {
      const sourceUrl = item.links?.web?.href ?? item.link ?? `https://espn.com/${sportSlug}`
      const { data: article } = await supabase.from('articles').upsert({
        sport_id: sport!.id,
        title: item.headline ?? item.title ?? 'Untitled',
        summary: item.description ?? item.summary ?? null,
        image_url: item.images?.[0]?.url ?? null,
        source_url: sourceUrl,
        published_at: item.published ?? new Date().toISOString(),
        cached_at: new Date().toISOString(),
      }, { onConflict: 'source_url' })
        .select()
        .single()
      if (article) articles.push(article)
    }

    // Update cache
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await supabase.from('cache_log').upsert(
      { cache_key: cacheKey, expires_at: expiresAt },
      { onConflict: 'cache_key' },
    )

    return new Response(JSON.stringify({ articles, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ articles: [], error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
