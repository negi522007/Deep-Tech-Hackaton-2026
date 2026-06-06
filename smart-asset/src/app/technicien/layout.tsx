import Link from 'next/link';
import { Cpu, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function TechLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
        {/* Topbar simplifié */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 h-16 border-b border-[var(--hair)] bg-[var(--bg)]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-amber text-ink shadow-glow">
              <Cpu size={18} />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-chalk text-sm">Asset<span className="text-cyan">IQ</span></div>
              <div className="label-mono text-[8px]">Portail Technicien</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/technicien/suivi" className="text-sm text-steel hover:text-chalk transition">Mes demandes</Link>
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 text-xs text-steel hover:text-chalk transition">
              <ArrowLeft size={13} /> Accueil
            </Link>
          </div>
        </header>
        <main className="p-5 md:p-8 max-w-3xl mx-auto">{children}</main>
      </div>
  );
}
