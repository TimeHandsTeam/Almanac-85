import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Standing } from '@/lib/types';

export function useStandings(sportSlug: string) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: sport } = await supabase.from('sports').select('id').eq('slug', sportSlug).single();
    if (!sport) { setStandings([]); setLoading(false); return; }

    const { data: leagues } = await supabase.from('leagues').select('id').eq('sport_id', sport.id);
    const leagueIds = (leagues ?? []).map((l: any) => l.id);

    if (leagueIds.length === 0) { setStandings([]); setLoading(false); return; }

    const { data, error: dbError } = await supabase
      .from('standings')
      .select('*, team:teams(id, name, short_name, logo_url)')
      .in('league_id', leagueIds)
      .order('position', { ascending: true })
      .limit(20);

    if (dbError) setError(dbError.message);
    else setStandings(data ?? []);
    setLoading(false);
  }, [sportSlug]);

  useEffect(() => { refresh(); }, [refresh]);

  return { standings, loading, error, refresh };
}
