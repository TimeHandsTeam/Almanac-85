import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCredits() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', session.user.id)
        .single();
      if (data) setBalance(data.balance);
    };
    load();

    const channel = supabase
      .channel('credits-watch')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'credits' }, (payload) => {
        setBalance((payload.new as any).balance);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { balance };
}
