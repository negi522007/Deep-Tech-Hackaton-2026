'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, AlertTriangle, Package, BarChart3, Cpu, ArrowUpRight, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Mission Control', icon: LayoutDashboard },
  { href: '/equipments', label: 'Équipements', icon: Boxes },
  { href: '/failures', label: 'Pannes', icon: AlertTriangle },
  { href: '/parts', label: 'Pièces', icon: Package },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin', label: 'Administration', icon: ShieldCheck },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 flex-col gap-1 p-4 border-r border-white/[0.06] bg-white/[0.015] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 px-2 pb-6 pt-1 group">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-amber text-ink shadow-glow">
          <Cpu size={20} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-chalk text-sm tracking-tight">Asset<span className="text-cyan">IQ</span></div>
          <div className="label-mono text-[8px]">Industrial Intelligence</div>
        </div>
      </Link>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
              active ? 'text-chalk bg-white/[0.06] border border-cyan/25 shadow-glow'
                     : 'text-steel hover:text-chalk hover:bg-white/[0.04] border border-transparent'}`}>
            {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-cyan" />}
            <Icon size={18} className={active ? 'text-cyan' : ''} />
            {label}
          </Link>
        );
      })}
      <Link href="/" className="mt-auto flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-steel hover:text-chalk border border-white/[0.06] hover:border-white/15 transition">
        Voir la landing <ArrowUpRight size={14} />
      </Link>
      <div className="label-mono px-3 pt-2">v1.0 · PWA · 3D</div>
    </aside>
  );
}
