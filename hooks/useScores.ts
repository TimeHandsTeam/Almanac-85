import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Match } from '@/lib/types';

export function useScores(sportSlug: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke('sports-scores', {
      body: { sport: sportSlug },
    });
    if (fnError) setError(fnError.message);
    else setMatches(data?.matches ?? []);
    setLoading(false);
  }, [sportSlug]);

  useEffect(() => { refresh(); }, [refresh]);

  return { matches, loading, error, refresh };
}
