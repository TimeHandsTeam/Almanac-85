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

    // Check cache
    const cacheKey = `scores:${sportSlug}`
    const { data: cacheEntry } = await supabase
      .from('cache_log')
      .select('expires_at')
      .eq('cache_key', cacheKey)
      .single()

    const now = new Date()
    const isCacheFresh = cacheEntry && new Date(cacheEntry.expires_at) > now

    if (isCacheFresh) {
      const { data: sport } = await supabase.from('sports').select('id').eq('slug', sportSlug).single()
      if (sport) {
        const { data: leagues } = await supabase.from('leagues').select('id').eq('sport_id', sport.id)
        const leagueIds = (leagues ?? []).map((l: any) => l.id)
        if (leagueIds.length > 0) {
          const { data: matches } = await supabase
            .from('matches')
            .select(`*, home_team:teams!matches_home_team_id_fkey(id,name,short_name,logo_url), away_team:teams!matches_away_team_id_fkey(id,name,short_name,logo_url)`)
            .in('league_id', leagueIds)
            .order('start_time', { ascending: true })
            .limit(20)
          return new Response(JSON.stringify({ matches: matches ?? [], cached: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
    }

    // Fetch from ESPN
    const espnUrl = `${ESPN_BASE}/${mapping.sport}/${mapping.league}/scoreboard`
    const espnRes = await fetch(espnUrl)
    if (!espnRes.ok) {
      return new Response(JSON.stringify({ matches: [], error: 'ESPN fetch failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const espnData = await espnRes.json()
    const events = espnData?.events ?? []

    // Get or create sport
    let { data: sport } = await supabase.from('sports').select('id').eq('slug', sportSlug).single()
    if (!sport) {
      const { data: ns } = await supabase.from('sports').insert({ name: sportSlug, slug: sportSlug, display_order: 99 }).select('id').single()
      sport = ns
    }

    // Get or create league
    let { data: league } = await supabase.from('leagues').select('id').eq('slug', mapping.league).single()
    if (!league) {
      const { data: nl } = await supabase.from('leagues').insert({ sport_id: sport!.id, name: mapping.league, slug: mapping.league }).select('id').single()
      league = nl
    }

    const matches: any[] = []

    for (const event of events.slice(0, 20)) {
      const competition = event.competitions?.[0]
      if (!competition) continue
      const homeComp = competition.competitors?.find((c: any) => c.homeAway === 'home')
      const awayComp = competition.competitors?.find((c: any) => c.homeAway === 'away')
      if (!homeComp || !awayComp) continue

      const upsertTeam = async (comp: any): Promise<string | null> => {
        const t = comp.team
        const teamName = t.displayName ?? t.name
        const { data: existing } = await supabase.from('teams').select('id').eq('league_id', league!.id).eq('name', teamName).maybeSingle()
        if (existing) return existing.id
        const { data: nt } = await supabase.from('teams').insert({
          league_id: league!.id, name: teamName,
          short_name: t.abbreviation ?? teamName.substring(0, 3).toUpperCase(),
          logo_url: t.logo ?? null,
        }).select('id').single()
        return nt?.id ?? null
      }

      const homeTeamId = await upsertTeam(homeComp)
      const awayTeamId = await upsertTeam(awayComp)
      if (!homeTeamId || !awayTeamId) continue

      const statusName = competition.status?.type?.name ?? 'STATUS_SCHEDULED'
      let status: 'scheduled' | 'live' | 'finished' = 'scheduled'
      if (statusName.includes('IN_PROGRESS') || statusName.includes('HALFTIME')) status = 'live'
      else if (statusName.includes('FINAL') || statusName.includes('FULL_TIME')) status = 'finished'

      const { data: match } = await supabase.from('matches').upsert({
        league_id: league!.id, home_team_id: homeTeamId, away_team_id: awayTeamId,
        start_time: event.date ?? new Date().toISOString(),
        status,
        home_score: homeComp.score != null ? parseInt(homeComp.score) : null,
        away_score: awayComp.score != null ? parseInt(awayComp.score) : null,
        raw_data: event, cached_at: new Date().toISOString(),
      }, { onConflict: 'id' })
        .select(`*, home_team:teams!matches_home_team_id_fkey(id,name,short_name,logo_url), away_team:teams!matches_away_team_id_fkey(id,name,short_name,logo_url)`)
        .single()

      if (match) matches.push(match)
    }

    // Update cache
    const hasLive = matches.some((m: any) => m.status === 'live')
    const ttl = hasLive ? 60 : 300
    await supabase.from('cache_log').upsert(
      { cache_key: cacheKey, expires_at: new Date(Date.now() + ttl * 1000).toISOString() },
      { onConflict: 'cache_key' },
    )

    return new Response(JSON.stringify({ matches, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ matches: [], error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
