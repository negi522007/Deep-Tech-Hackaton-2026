'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui';
import { spareParts as sampleSpareParts, partRequests as samplePartRequests } from '@/lib/sample-data';
import { SparePart, SparePartRequest } from '@/lib/types';
import { Package, AlertCircle } from 'lucide-react';
import { apiGet } from '@/lib/http';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

const urgencyColor: Record<string, string> = {
  normal: 'text-steel', urgent: 'text-amber', blocking: 'text-crit',
};

interface PartRequestEvent {
  id: string;
  part_request_id: string;
  event_type: string;
  to_status?: string | null;
}

export default function PartsPage() {
  const [spareParts, setSpareParts] = useState<SparePart[]>(sampleSpareParts);
  const [partRequests, setPartRequests] = useState<SparePartRequest[]>(samplePartRequests);
  const [eventsByRequest, setEventsByRequest] = useState<Record<string, PartRequestEvent[]>>({});

  const load = useCallback(async () => {
    const [parts, requests] = await Promise.all([
      apiGet<SparePart[]>('/api/spare-parts', sampleSpareParts),
      apiGet<SparePartRequest[]>('/api/parts', samplePartRequests),
    ]);
    setSpareParts(parts);
    setPartRequests(requests);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    partRequests.forEach((r) => {
      apiGet<PartRequestEvent[]>(`/api/parts/${r.id}/events`, []).then((events) =>
        setEventsByRequest((prev) => ({ ...prev, [r.id]: events })),
      );
    });
  }, [partRequests]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel('parts-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spare_part_requests' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'part_request_events' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spare_parts' }, load)
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [load]);

  const partById = useMemo(() => new Map(spareParts.map((p) => [p.id, p])), [spareParts]);

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
            {partRequests.map((r) => {
              const events = eventsByRequest[r.id] || [];
              const latest = events.at(-1);
              return (
                <div key={r.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <div className="text-sm text-chalk">{partById.get(r.spare_part_id || '')?.name ?? 'Pièce'}</div>
                    <div className="label-mono">qté {r.quantity} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                    {latest && <div className="text-[10px] text-cyan mt-1">Dernier évènement: {latest.event_type}</div>}
                  </div>
                  <span className={`text-xs font-medium ${urgencyColor[r.urgency]}`}>{r.urgency}</span>
                  <span className="text-xs text-steel font-mono w-20 text-right">{latest?.to_status || r.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
