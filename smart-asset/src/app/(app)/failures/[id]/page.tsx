'use client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import { equipmentById, companyById, workflowFor, WORKFLOW_STEP_NAMES } from '@/lib/sample-data';
import { SeverityBadge, StatusBadge } from '@/components/ui';

export default function FailureDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { failures, workflowProgress, advanceWorkflow, partRequests } = useStore();

  const failure = failures.find((f) => f.id === id);
  if (!failure) notFound();

  const equipment = equipmentById(failure.equipment_id);
  const company = companyById(failure.company_id);
  const steps = workflowFor(id, workflowProgress);
  const currentStep = workflowProgress[id] ?? 1;
  const isLast = currentStep >= 10;
  const related = partRequests.filter((r) => r.failure_id === id);

  return (
    <div className="max-w-4xl">
      <Link href="/failures" className="inline-flex items-center gap-2 text-steel hover:text-chalk text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Retour aux pannes
      </Link>

      {/* Header */}
      <div className="glass p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-chalk">{failure.title}</h1>
            <p className="text-steel text-sm mt-1">
              {equipment?.name} · {company?.name} · déclaré le {new Date(failure.reported_at).toLocaleDateString('fr-FR')}
            </p>
            {failure.description && (
              <p className="text-sm text-chalk/70 mt-2">{failure.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={failure.severity} />
            <StatusBadge status={failure.status} />
          </div>
        </div>
      </div>

      {/* Workflow interactif */}
      <div className="glass p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <p className="label-mono text-cyan">Workflow de réparation — étape {currentStep} / 10</p>
          <button
            onClick={() => advanceWorkflow(id)}
            disabled={isLast}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
              isLast
                ? 'border-ok/30 text-ok cursor-default'
                : 'border-cyan/40 text-cyan hover:bg-cyan/10 hover:border-cyan/70'
            }`}
          >
            {isLast ? (
              <><CheckCircle size={15} /> Clôturé</>
            ) : (
              <><ArrowRight size={15} /> Avancer → {WORKFLOW_STEP_NAMES[currentStep]}</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {steps.map((s) => (
            <div key={s.id} className={`relative rounded-xl border p-3 text-center transition-all ${
              s.status === 'done'
                ? 'border-ok/40 bg-ok/5'
                : s.status === 'active'
                ? 'border-cyan/60 bg-cyan/8 shadow-glow'
                : 'border-[var(--hair)]'
            }`}>
              {s.status === 'done' && (
                <CheckCircle size={12} className="text-ok mx-auto mb-1" />
              )}
              {s.status === 'active' && (
                <div className="h-2 w-2 rounded-full bg-cyan mx-auto mb-1 animate-pulse" />
              )}
              {s.status === 'pending' && (
                <div className="h-2 w-2 rounded-full bg-[var(--line)] mx-auto mb-1" />
              )}
              <div className={`text-[10px] font-medium leading-tight ${
                s.status === 'done' ? 'text-ok' : s.status === 'active' ? 'text-cyan' : 'text-steel'
              }`}>
                {s.step_name}
              </div>
              <div className="label-mono text-[8px] mt-0.5">{s.step_order}</div>
            </div>
          ))}
        </div>

        {/* Timeline estimée sourcing */}
        {currentStep >= 5 && currentStep <= 7 && (
          <div className="mt-4 rounded-lg border border-crit/20 bg-crit/5 p-3 flex items-center gap-3">
            <Clock size={16} className="text-crit shrink-0" />
            <p className="text-xs text-steel">
              <span className="text-crit font-semibold">Phase sourcing/fabrication</span> — étape la plus longue du workflow (96,5 h en moyenne sans AssetIQ).
            </p>
          </div>
        )}
      </div>

      {/* Info équipement + demandes pièces */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <p className="label-mono mb-3">Équipement</p>
          {equipment ? (
            <dl className="space-y-2 text-sm">
              {[
                ['Nom', equipment.name],
                ['N° série', equipment.serial_number],
                ['Fabricant', equipment.manufacturer],
                ['Modèle', equipment.model],
                ['Emplacement', equipment.location],
              ].map(([k, v]) => v ? (
                <div key={k} className="flex justify-between gap-4 border-b border-[var(--hair)] pb-2">
                  <dt className="text-steel">{k}</dt>
                  <dd className="text-chalk font-mono text-right">{v}</dd>
                </div>
              ) : null)}
            </dl>
          ) : <p className="text-steel text-sm">Équipement introuvable.</p>}
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="label-mono">Pièces demandées ({related.length})</p>
            <Link href="/parts" className="text-xs text-cyan hover:underline">Voir tout</Link>
          </div>
          {related.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-steel">
              <Package size={24} />
              <p className="text-sm">Aucune demande de pièce</p>
              <Link href="/parts" className="btn btn-ghost text-xs py-1.5 px-3 mt-1">Créer une demande</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {related.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border border-[var(--hair)] p-3">
                  <Package size={15} className="text-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-chalk truncate">{r.spare_part_id ?? 'Pièce'}</div>
                    <div className="label-mono">qté {r.quantity}</div>
                  </div>
                  <span className={`text-xs font-medium ${
                    r.urgency === 'blocking' ? 'text-crit' : r.urgency === 'urgent' ? 'text-amber' : 'text-steel'
                  }`}>{r.urgency}</span>
                  <span className="text-xs text-steel font-mono">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
