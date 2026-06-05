'use client';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { equipments, companyById } from '@/lib/sample-data';
import { Boxes } from 'lucide-react';

export default function EquipmentsPage() {
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
              <div>{companyById(e.company_id)?.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
