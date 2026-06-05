'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui';
import { equipments as sampleEquipments, companies as sampleCompanies } from '@/lib/sample-data';
import { Equipment, Company } from '@/lib/types';
import { Boxes } from 'lucide-react';
import { apiGet } from '@/lib/http';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>(sampleEquipments);
  const [companies, setCompanies] = useState<Company[]>(sampleCompanies);

  const load = useCallback(async () => {
    const [e, c] = await Promise.all([
      apiGet<Equipment[]>('/api/equipments', sampleEquipments),
      apiGet<Company[]>('/api/companies', sampleCompanies),
    ]);
    setEquipments(e);
    setCompanies(c);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel('equipments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipments' }, load)
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [load]);

  const companyById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  return (
    <div>
      <PageHeader title="Équipements" subtitle="Inventaire des actifs industriels" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipments.map((e) => (
          <Link key={e.id} href={`/equipments/${e.id}`} className="glass p-5 hover:border-amber/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-panel2 text-amber">
                <Boxes size={20} />
              </div>
              <span className="label-mono">{e.category}</span>
            </div>
            <h3 className="mt-3 font-semibold text-chalk">{e.name}</h3>
            <div className="mt-2 space-y-1 text-xs text-steel font-mono">
              <div>SN: {e.serial_number}</div>
              <div>{e.manufacturer} · {e.model}</div>
              <div>{companyById.get(e.company_id)?.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
