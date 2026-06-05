'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { failures as sampleFailures, equipments as sampleEquipments } from '@/lib/sample-data';
import { Equipment, Failure } from '@/lib/types';
import { Plus, ChevronDown } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/http';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

interface WorkflowStep {
  id: string;
  failure_id: string;
  step_order: number;
  step_name: string;
  status: 'pending' | 'active' | 'done' | 'skipped';
}

function WorkflowBar({ steps }: { steps: WorkflowStep[] }) {
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
  const [failures, setFailures] = useState<Failure[]>(sampleFailures);
  const [equipments, setEquipments] = useState<Equipment[]>(sampleEquipments);
  const [workflowByFailure, setWorkflowByFailure] = useState<Record<string, WorkflowStep[]>>({});

  const load = useCallback(async () => {
    const [f, e] = await Promise.all([
      apiGet<Failure[]>('/api/failures', sampleFailures),
      apiGet<Equipment[]>('/api/equipments', sampleEquipments),
    ]);
    setFailures(f);
    setEquipments(e);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    failures.forEach((f) => {
      apiGet<WorkflowStep[]>(`/api/failures/${f.id}/workflow`, []).then((steps) =>
        setWorkflowByFailure((prev) => ({ ...prev, [f.id]: steps })),
      );
    });
  }, [failures]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel('failures-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'failures' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflow_steps' }, load)
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [load]);

  const equipmentById = useMemo(() => new Map(equipments.map((e) => [e.id, e])), [equipments]);

  async function advanceWorkflow(failureId: string) {
    const steps = workflowByFailure[failureId] || [];
    const active = steps.find((s) => s.status === 'active');
    if (!active) return;
    await apiPatch(`/api/failures/${failureId}/workflow`, { next_step_order: Math.min(active.step_order + 1, 7) });
    const refreshed = await apiGet<WorkflowStep[]>(`/api/failures/${failureId}/workflow`, steps);
    setWorkflowByFailure((prev) => ({ ...prev, [failureId]: refreshed }));
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Pannes"
        subtitle="Signalements et workflow de réparation (7 étapes)"
        action={<Link href="/failures/new" className="btn-primary"><Plus size={16} /> Nouvelle panne</Link>}
      />
      <div className="space-y-3">
        {failures.map((f) => {
          const steps = workflowByFailure[f.id] || [];
          return (
            <div key={f.id} className="glass p-5">
              <button onClick={() => setOpenId(openId === f.id ? null : f.id)} className="w-full text-left">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-chalk font-medium">{f.title}</div>
                    <div className="label-mono mt-0.5">{equipmentById.get(f.equipment_id)?.name} · {f.category}</div>
                  </div>
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                  <ChevronDown size={18} className={`text-steel transition-transform ${openId === f.id ? 'rotate-180' : ''}`} />
                </div>
                {steps.length > 0 && <WorkflowBar steps={steps} />}
              </button>
              {openId === f.id && (
                <div className="mt-4 border-t border-white/10 pt-4 grid sm:grid-cols-7 gap-2">
                  {steps.map((s) => (
                    <div key={s.id} className={`rounded-lg border p-2 text-center text-[11px] ${
                      s.status === 'done' ? 'border-ok/40 text-ok' :
                      s.status === 'active' ? 'border-amber/50 text-amber' : 'border-white/10 text-steel'
                    }`}>
                      <div className="font-mono">{s.step_order}</div>
                      <div className="mt-1 leading-tight">{s.step_name}</div>
                    </div>
                  ))}
                  <div className="sm:col-span-7 mt-2">
                    <button onClick={() => advanceWorkflow(f.id)} className="btn-ghost text-xs py-2">
                      Avancer le workflow
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
