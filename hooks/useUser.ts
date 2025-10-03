'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/browser';

type Profile = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
};

export function useUser() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data: sessData } = await supabase.auth.getSession();
        if (!mounted) return;
        const sess = sessData?.session ?? null;
        setSession(sess);

        if (sess?.user) {
          const email = sess.user.email ?? null;
          const { data: p, error: pe } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', sess.user.id)
            .maybeSingle();

          if (pe && pe.code !== 'PGRST116') {
            setError(pe.message);
          }

          setProfile({
            id: sess.user.id,
            full_name: p?.full_name ?? null,
            avatar_url: p?.avatar_url ?? null,
            email,
          });
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, session, user: session?.user ?? null, profile, error };
}
