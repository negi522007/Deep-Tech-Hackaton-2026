'use client';
import { Search, Bell, Activity } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-5 md:px-8 h-16 border-b border-white/[0.06] bg-ink/60 backdrop-blur-xl">
      <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 w-72">
        <Search size={15} className="text-steel" />
        <input placeholder="Rechercher un actif, une panne…" className="bg-transparent text-sm text-chalk placeholder:text-steel/50 outline-none w-full" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/5 px-3 py-1 text-[11px] text-ok">
          <Activity size={12} className="animate-pulse" /> Systèmes opérationnels
        </span>
        <button className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-steel hover:text-chalk transition relative">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-crit" />
        </button>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan/30 to-amber/30 border border-white/10 grid place-items-center text-xs font-semibold text-chalk">DA</div>
      </div>
    </header>
  );
}
