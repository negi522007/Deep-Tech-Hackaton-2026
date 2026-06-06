'use client';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { companyById, equipmentStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { Boxes, Search, Plus } from 'lucide-react';

function EquipmentsContent() {
  const searchParams = useSearchParams();
  const { failures, equipments } = useStore();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [cat, setCat]     = useState('');

  // Sync query from URL on navigation
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const CATEGORIES = useMemo(
    () => Array.from(new Set(equipments.map((e) => e.category))).sort(),
    [equipments]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return equipments.filter((e) => {
      const matchQ = !q ||
        e.name.toLowerCase().includes(q) ||
        e.serial_number.toLowerCase().includes(q) ||
        (e.manufacturer ?? '').toLowerCase().includes(q) ||
        (e.model ?? '').toLowerCase().includes(q);
      const matchCat = !cat || e.category === cat;
      return matchQ && matchCat;
    });
  }, [query, cat, equipments]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Équipements" subtitle={`${filtered.length} actif${filtered.length !== 1 ? 's' : ''} industriel${filtered.length !== 1 ? 's' : ''}`} />
        <Link href="/equipments/new" className="btn btn-primary gap-2">
          <Plus size={15} /> Ajouter
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-[var(--hair)] bg-[var(--surface1)] px-3 py-2">
          <Search size={15} className="text-steel shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, N° série, fabricant…"
            className="bg-transparent text-sm text-chalk placeholder:text-steel/50 outline-none w-full"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-[var(--hair)] bg-[var(--surface1)] px-3 py-2 text-sm text-chalk outline-none cursor-pointer"
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="glass p-12 text-center text-steel">Aucun équipement ne correspond.</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e) => {
          const st = equipmentStatus(e.id, failures);
          return (
            <Link key={e.id} href={`/equipments/${e.id}`} className="glass glass-hover p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface2)] text-amber">
                  <Boxes size={20} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="label-mono">{e.category}</span>
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${STATUS_COLORS[st]}`}>
                    {STATUS_LABELS[st]}
                  </span>
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-chalk">{e.name}</h3>
              <div className="mt-2 space-y-1 text-xs text-steel font-mono">
                <div>SN: {e.serial_number}</div>
                <div>{e.manufacturer} · {e.model}</div>
                <div>{companyById(e.company_id)?.name}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function EquipmentsPage() {
  return (
    <Suspense fallback={<div className="text-steel text-sm">Chargement…</div>}>
      <EquipmentsContent />
    </Suspense>
  );
}
