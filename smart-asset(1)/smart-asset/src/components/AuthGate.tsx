'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      if (!isSupabaseConfigured()) {
        if (active) setReady(true);
        return;
      }
      const sb = getSupabaseBrowser();
      if (!sb) {
        if (active) setReady(true);
        return;
      }
      const { data } = await sb.auth.getSession();
      if (!data.session && pathname !== '/login') {
        router.replace('/login');
      } else if (data.session && pathname === '/login') {
        router.replace('/dashboard');
      }
      if (active) setReady(true);
    }
    check();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return <div className="min-h-screen grid place-items-center text-sm text-steel">Chargement de la session…</div>;
  }
  return <>{children}</>;
}
