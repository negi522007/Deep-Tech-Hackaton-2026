'use client';
import { PageHeader } from '@/components/ui';
import { spareParts, partRequests, partById } from '@/lib/sample-data';
import { Package, AlertCircle } from 'lucide-react';

const urgencyColor: Record<string, string> = {
  normal: 'text-steel', urgent: 'text-amber', blocking: 'text-crit',
};

export default function PartsPage() {
  return (
    <div>
      <PageHeader title="Pièces de rechange" subtitle="Stock & demandes liées aux pannes" />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <div className="label-mono mb-4">Stock</div>
          <div className="divide-y divide-white/10">
            {spareParts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <Package size={18} className={p.stock_qty === 0 ? 'text-crit' : 'text-amber'} />
                <div className="flex-1">
                  <div className="text-sm text-chalk">{p.name}</div>
                  <div className="label-mono">{p.reference} · {p.unit_price?.toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div className={`text-sm font-mono ${p.stock_qty === 0 ? 'text-crit' : 'text-chalk'}`}>
                  {p.stock_qty === 0 ? <span className="flex items-center gap-1"><AlertCircle size={14} /> rupture</span> : `${p.stock_qty} u.`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-5">
          <div className="label-mono mb-4">Demandes en cours</div>
          <div className="divide-y divide-white/10">
            {partRequests.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <div className="text-sm text-chalk">{partById(r.spare_part_id)?.name ?? 'Pièce'}</div>
                  <div className="label-mono">qté {r.quantity} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <span className={`text-xs font-medium ${urgencyColor[r.urgency]}`}>{r.urgency}</span>
                <span className="text-xs text-steel font-mono w-20 text-right">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
