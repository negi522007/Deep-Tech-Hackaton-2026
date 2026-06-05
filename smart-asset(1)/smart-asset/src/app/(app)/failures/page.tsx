'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { failures, equipmentById, workflowFor } from '@/lib/sample-data';
import { Plus, ChevronDown } from 'lucide-react';

function WorkflowBar({ failureId }: { failureId: string }) {
  const steps = workflowFor(failureId);
  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((s) => (
        <div key={s.id} className="flex-1 group relative" title={s.step_name}>
          <div className={`h-1.5 rounded-full ${
            s.status === 'done' ? 'bg-ok' : s.status === 'active' ? 'bg-amber' : 'bg-line'
          }`} />
          <span className="absolute -top-5 left-0 text-[9px] text-steel opacity-0 group-hover:opacity-100 whitespace-nowrap">
            {s.step_name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FailuresPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div>
      <PageHeader
        title="Pannes"
        subtitle="Signalements et workflow de réparation (7 étapes)"
        action={<Link href="/failures/new" className="btn-primary"><Plus size={16} /> Nouvelle panne</Link>}
      />
      <div className="space-y-3">
        {failures.map((f) => (
          <div key={f.id} className="glass p-5">
            <button onClick={() => setOpenId(openId === f.id ? null : f.id)} className="w-full text-left">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-chalk font-medium">{f.title}</div>
                  <div className="label-mono mt-0.5">{equipmentById(f.equipment_id)?.name} · {f.category}</div>
                </div>
                <SeverityBadge severity={f.severity} />
                <StatusBadge status={f.status} />
                <ChevronDown size={18} className={`text-steel transition-transform ${openId === f.id ? 'rotate-180' : ''}`} />
              </div>
              <WorkflowBar failureId={f.id} />
            </button>
            {openId === f.id && (
              <div className="mt-4 border-t border-white/10 pt-4 grid sm:grid-cols-7 gap-2">
                {workflowFor(f.id).map((s) => (
                  <div key={s.id} className={`rounded-lg border p-2 text-center text-[11px] ${
                    s.status === 'done' ? 'border-ok/40 text-ok' :
                    s.status === 'active' ? 'border-amber/50 text-amber' : 'border-white/10 text-steel'
                  }`}>
                    <div className="font-mono">{s.step_order}</div>
                    <div className="mt-1 leading-tight">{s.step_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
