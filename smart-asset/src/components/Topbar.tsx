'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Activity, CheckCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useStore } from '@/lib/store';

const TYPE_LABELS: Record<string, string> = {
  failure_created: '🔴 Panne',
  step_advanced:   '⏩ Workflow',
  part_requested:  '📦 Pièce',
  status_changed:  '🔄 Statut',
};

export default function Topbar() {
  const { notifications, unreadCount, markAllRead } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) markAllRead();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-5 md:px-8 h-16 border-b border-[var(--hair)] bg-[var(--bg)]/60 backdrop-blur-xl">
      <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--hair)] bg-[var(--surface1)]/40 px-3 py-1.5 w-72">
        <Search size={15} className="text-steel" />
        <input placeholder="Rechercher un actif, une panne…" className="bg-transparent text-sm text-chalk placeholder:text-steel/50 outline-none w-full" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/5 px-3 py-1 text-[11px] text-ok">
          <Activity size={12} className="animate-pulse" /> Systèmes opérationnels
        </span>

        <ThemeToggle />

        {/* Cloche avec dropdown notifications */}
        <div ref={ref} className="relative">
          <button
            onClick={handleOpen}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--hair)] bg-[var(--surface1)]/40 text-steel hover:text-chalk transition relative"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-crit text-[9px] font-bold text-white grid place-items-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-80 glass rounded-xl shadow-glow overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hair)]">
                <span className="label-mono">Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-steel hover:text-chalk transition">
                    <CheckCheck size={12} /> Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--hair)]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-steel text-sm">Aucune notification</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 transition-colors ${n.read ? '' : 'bg-cyan/5'}`}>
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-steel font-mono">{TYPE_LABELS[n.type] ?? n.type}</p>
                          <p className="text-sm text-chalk leading-snug">{n.message}</p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {new Date(n.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan/30 to-amber/30 border border-[var(--hair)] grid place-items-center text-xs font-semibold text-chalk">DA</div>
      </div>
    </header>
  );
}
