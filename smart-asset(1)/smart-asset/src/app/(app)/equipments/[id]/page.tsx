'use client';
import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { equipmentById, companyById, failures } from '@/lib/sample-data';
import { ArrowLeft } from 'lucide-react';

export default function EquipmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const e = equipmentById(id);
  if (!e) notFound();
  const history = failures.filter((f) => f.equipment_id === id);

  return (
    <div>
      <Link href="/equipments" className="inline-flex items-center gap-1 text-sm text-steel hover:text-chalk mb-4">
        <ArrowLeft size={16} /> Équipements
      </Link>
      <PageHeader title={e.name} subtitle={`${e.manufacturer} · ${e.model}`} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass p-5">
          <div className="label-mono mb-3">Fiche équipement</div>
          <dl className="space-y-2 text-sm">
            {[
              ['Numéro de série', e.serial_number],
              ['Catégorie', e.category],
              ['Fabricant', e.manufacturer],
              ['Modèle', e.model],
              ['Date d\'achat', e.purchase_date],
              ['Emplacement', e.location],
              ['Entreprise', companyById(e.company_id)?.name],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <dt className="text-steel">{k}</dt>
                <dd className="text-chalk font-mono text-right">{v || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="glass p-5 lg:col-span-2">
          <div className="label-mono mb-3">Historique des pannes ({history.length})</div>
          {history.length === 0 ? (
            <p className="text-sm text-steel">Aucune panne enregistrée.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {history.map((f) => (
                <div key={f.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1">
                    <div className="text-sm text-chalk">{f.title}</div>
                    <div className="label-mono mt-0.5">{new Date(f.reported_at).toLocaleDateString('fr-FR')} · {f.category}</div>
                  </div>
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
