import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/types';

export function useNews(sportSlug: string) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke('sports-news', {
      body: { sport: sportSlug },
    });
    if (fnError) setError(fnError.message);
    else setArticles(data?.articles ?? []);
    setLoading(false);
  }, [sportSlug]);

  useEffect(() => { refresh(); }, [refresh]);

  return { articles, loading, error, refresh };
}
