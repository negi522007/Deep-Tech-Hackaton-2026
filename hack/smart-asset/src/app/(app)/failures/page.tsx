'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { equipmentById, workflowFor } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { Plus, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { WORKFLOW_STEP_NAMES } from '@/lib/sample-data';

function WorkflowBar({ failureId, progress }: { failureId: string; progress: Record<string, number> }) {
  const steps = workflowFor(failureId, progress);
  const active = progress[failureId] ?? 1;
  return (
    <div className="flex items-center gap-0.5 mt-3">
      {steps.map((s) => (
        <div key={s.id} className="flex-1 group relative" title={s.step_name}>
          <div className={`h-1.5 rounded-full transition-colors ${
            s.status === 'done' ? 'bg-ok' : s.status === 'active' ? 'bg-cyan' : 'bg-[var(--line)]'
          }`} />
        </div>
      ))}
      <span className="ml-2 label-mono shrink-0">{active}/10</span>
    </div>
  );
}

export default function FailuresPage() {
  const { failures, workflowProgress, advanceWorkflow } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Pannes"
          subtitle={`${failures.length} signalement${failures.length !== 1 ? 's' : ''} · workflow 10 étapes`}
        />
        <Link href="/failures/new" className="btn btn-primary gap-2">
          <Plus size={15} /> Nouvelle panne
        </Link>
      </div>

      <div className="space-y-3">
        {failures.map((f) => {
          const currentStep = workflowProgress[f.id] ?? 1;
          const isLast = currentStep >= 10;
          const steps = workflowFor(f.id, workflowProgress);

          return (
            <div key={f.id} className="glass p-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setOpenId(openId === f.id ? null : f.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-chalk font-medium">{f.title}</div>
                      <div className="label-mono mt-0.5">
                        {equipmentById(f.equipment_id)?.name} · {f.category}
                      </div>
                    </div>
                    <SeverityBadge severity={f.severity} />
                    <StatusBadge status={f.status} />
                    <ChevronDown size={16} className={`text-steel transition-transform shrink-0 ${openId === f.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Bouton Avancer le workflow */}
                <button
                  onClick={() => advanceWorkflow(f.id)}
                  disabled={isLast}
                  title={isLast ? 'Clôturé' : `Avancer → ${WORKFLOW_STEP_NAMES[currentStep]}`}
                  className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    isLast
                      ? 'border-ok/20 text-ok cursor-default'
                      : 'border-cyan/30 text-cyan hover:bg-cyan/10 hover:border-cyan/60 active:scale-95'
                  }`}
                >
                  {isLast ? 'Clôturé' : (
                    <>
                      <ArrowRight size={13} />
                      {WORKFLOW_STEP_NAMES[currentStep]}
                    </>
                  )}
                </button>

                <Link href={`/failures/${f.id}`} className="shrink-0 grid h-8 w-8 place-items-center rounded-lg border border-[var(--hair)] text-steel hover:text-chalk hover:border-[var(--line)] transition">
                  <ChevronRight size={16} />
                </Link>
              </div>

              <WorkflowBar failureId={f.id} progress={workflowProgress} />

              {/* Étapes détaillées dépliables */}
              {openId === f.id && (
                <div className="mt-4 border-t border-[var(--hair)] pt-4 grid grid-cols-5 lg:grid-cols-10 gap-2">
                  {steps.map((s) => (
                    <div key={s.id} className={`rounded-lg border p-2 text-center text-[10px] transition-colors ${
                      s.status === 'done'   ? 'border-ok/40 bg-ok/5 text-ok' :
                      s.status === 'active' ? 'border-cyan/50 bg-cyan/5 text-cyan' :
                                              'border-[var(--hair)] text-steel'
                    }`}>
                      <div className="font-mono text-[9px] mb-0.5">{s.step_order}</div>
                      <div className="leading-tight">{s.step_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
