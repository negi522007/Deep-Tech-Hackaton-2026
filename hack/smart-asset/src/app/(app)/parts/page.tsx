'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { spareParts, partById } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { Package, AlertCircle, Plus, X, CheckCircle } from 'lucide-react';
import { PartUrgency } from '@/lib/types';

const URGENCY_STYLES: Record<PartUrgency, string> = {
  normal:   'text-steel border-steel/30',
  urgent:   'text-amber border-amber/40',
  blocking: 'text-crit  border-crit/40',
};

const STATUS_LABELS: Record<string, string> = {
  requested: 'Demandé',
  approved:  'Approuvé',
  sourcing:  'Sourcing',
  shipped:   'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export default function PartsPage() {
  const { partRequests, addPartRequest, failures } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ failure_id: '', spare_part_id: '', quantity: '1', urgency: 'normal' as PartUrgency });
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPartRequest({
      failure_id: form.failure_id || (failures[0]?.id ?? 'f1'),
      spare_part_id: form.spare_part_id || undefined,
      part_name: spareParts.find(p => p.id === form.spare_part_id)?.name,
      quantity: parseInt(form.quantity) || 1,
      urgency: form.urgency,
    });
    setDone(true);
    setTimeout(() => { setShowForm(false); setDone(false); setForm({ failure_id: '', spare_part_id: '', quantity: '1', urgency: 'normal' }); }, 1200);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Pièces de rechange" subtitle="Catalogue stock & demandes en cours" />
        <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
          <Plus size={15} /> Nouvelle demande
        </button>
      </div>

      {/* Modal formulaire nouvelle demande */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-steel hover:text-chalk">
              <X size={18} />
            </button>

            {done ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle size={32} className="text-ok" />
                <p className="text-chalk font-semibold">Demande enregistrée</p>
              </div>
            ) : (
              <>
                <p className="label-mono text-cyan mb-4">Nouvelle demande de pièce</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs text-steel">Panne liée</span>
                    <select value={form.failure_id} onChange={e => setForm(f => ({ ...f, failure_id: e.target.value }))} className="field-input">
                      <option value="">— Sélectionner —</option>
                      {failures.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                    </select>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs text-steel">Pièce</span>
                    <select value={form.spare_part_id} onChange={e => setForm(f => ({ ...f, spare_part_id: e.target.value }))} className="field-input">
                      <option value="">— Sélectionner ou saisir —</option>
                      {spareParts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.reference}) — stock: {p.stock_qty}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs text-steel">Quantité</span>
                      <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="field-input" />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs text-steel">Urgence</span>
                      <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value as PartUrgency }))} className="field-input">
                        <option value="normal">Normale</option>
                        <option value="urgent">Urgente</option>
                        <option value="blocking">Bloquante</option>
                      </select>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-2">Enregistrer la demande</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Catalogue stock */}
        <div className="glass p-5">
          <p className="label-mono mb-4">Catalogue pièces</p>
          <div className="divide-y divide-[var(--hair)]">
            {spareParts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <Package size={18} className={p.stock_qty === 0 ? 'text-crit' : 'text-amber'} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-chalk">{p.name}</div>
                  <div className="label-mono">{p.reference} · {p.unit_price?.toLocaleString('fr-FR')} FCFA</div>
                </div>
                <div className={`text-sm font-mono shrink-0 ${p.stock_qty === 0 ? 'text-crit' : 'text-chalk'}`}>
                  {p.stock_qty === 0
                    ? <span className="flex items-center gap-1"><AlertCircle size={13} /> rupture</span>
                    : `${p.stock_qty} u.`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demandes en cours */}
        <div className="glass p-5">
          <p className="label-mono mb-4">Demandes ({partRequests.length})</p>
          {partRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-steel">
              <Package size={24} />
              <p className="text-sm">Aucune demande en cours</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--hair)]">
              {partRequests.map((r) => {
                const part = partById(r.spare_part_id);
                return (
                  <div key={r.id} className="py-3 space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-chalk truncate">
                          {part?.name ?? r.spare_part_id ?? 'Pièce non spécifiée'}
                        </div>
                        <div className="label-mono">
                          qté {r.quantity} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${URGENCY_STYLES[r.urgency]}`}>
                        {r.urgency}
                      </span>
                      <span className="text-xs text-steel font-mono w-20 text-right shrink-0">
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
