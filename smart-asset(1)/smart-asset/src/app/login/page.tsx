'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu } from 'lucide-react';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!isSupabaseConfigured()) {
      router.push('/dashboard');
      return;
    }
    const sb = getSupabaseBrowser();
    if (!sb) return setError('Supabase non configuré');
    setBusy(true);
    const fn = mode === 'signin' ? sb.auth.signInWithPassword.bind(sb.auth) : sb.auth.signUp.bind(sb.auth);
    const { error: e } = await fn({ email, password });
    setBusy(false);
    if (e) return setError(e.message);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass w-full max-w-md p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-amber text-ink shadow-glow">
            <Cpu size={18} />
          </div>
          <div>
            <div className="font-semibold">AssetIQ</div>
            <div className="label-mono">Connexion Supabase</div>
          </div>
        </div>
        {!isSupabaseConfigured() && (
          <div className="mb-4 rounded-lg border border-amber/30 bg-amber/10 text-amber text-xs p-3">
            Mode démo actif : aucune clé Supabase détectée. Continuer ouvrira directement le dashboard.
          </div>
        )}
        <div className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="input" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mot de passe" className="input" />
          {error && <div className="text-xs text-crit">{error}</div>}
          <button onClick={submit} disabled={busy || !email || !password} className="btn-primary w-full py-3">
            {busy ? 'Chargement…' : mode === 'signin' ? 'Se connecter' : "S'inscrire"}
          </button>
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="btn-ghost w-full py-2">
            {mode === 'signin' ? 'Créer un compte' : 'Déjà inscrit ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
