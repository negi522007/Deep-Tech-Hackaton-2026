'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatCard, PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem, motion } from '@/components/motion';
import { equipments as sampleEquipments, failures as sampleFailures, partRequests as samplePartRequests } from '@/lib/sample-data';
import { Equipment, Failure, SparePartRequest } from '@/lib/types';
import { Plus, AlertTriangle, Radio, GitBranch } from 'lucide-react';
import { apiGet } from '@/lib/http';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

interface WorkflowStep {
  id: string;
  failure_id: string;
  step_order: number;
  step_name: string;
  status: 'pending' | 'active' | 'done' | 'skipped';
}

export default function Dashboard() {
  const [equipments, setEquipments] = useState<Equipment[]>(sampleEquipments);
  const [failures, setFailures] = useState<Failure[]>(sampleFailures);
  const [partRequests, setPartRequests] = useState<SparePartRequest[]>(samplePartRequests);
  const [workflow, setWorkflow] = useState<Record<string, WorkflowStep[]>>({});

  const load = useCallback(async () => {
    const [e, f, p] = await Promise.all([
      apiGet<Equipment[]>('/api/equipments', sampleEquipments),
      apiGet<Failure[]>('/api/failures', sampleFailures),
      apiGet<SparePartRequest[]>('/api/parts', samplePartRequests),
    ]);
    setEquipments(e);
    setFailures(f);
    setPartRequests(p);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const target = failures[0];
    if (!target) return;
    apiGet<WorkflowStep[]>(`/api/failures/${target.id}/workflow`, []).then((steps) =>
      setWorkflow((prev) => ({ ...prev, [target.id]: steps })),
    );
  }, [failures]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel('dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'failures' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spare_part_requests' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipments' }, load)
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [load]);

  const equipmentById = useMemo(() => new Map(equipments.map((e) => [e.id, e])), [equipments]);
  const open = failures.filter((f) => !['resolved', 'closed'].includes(f.status));
  const pendingParts = partRequests.filter((r) => !['delivered', 'cancelled'].includes(r.status));
  const resolved = failures.filter((f) => f.resolved_at);
  const avgHours = Math.round(
    resolved.reduce((s, f) => s + (new Date(f.resolved_at!).getTime() - new Date(f.reported_at).getTime()) / 36e5, 0) /
      Math.max(resolved.length, 1),
  );
  const live = failures[0];
  const steps = live ? workflow[live.id] || [] : [];

  return (
    <div>
      <PageHeader title="Mission Control" subtitle="État opérationnel du parc industriel · temps réel"
        action={<Link href="/failures/new" className="btn-primary"><Plus size={16} /> Déclarer une panne</Link>} />

      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem><StatCard label="Équipements" value={equipments.length} hint="parc suivi" accent="cyan" /></StaggerItem>
        <StaggerItem><StatCard label="Pannes ouvertes" value={open.length} hint="à traiter" accent="crit" /></StaggerItem>
        <StaggerItem><StatCard label="Pièces en attente" value={pendingParts.length} hint="approvisionnement" accent="amber" /></StaggerItem>
        <StaggerItem><StatCard label="MTTR (heures)" value={avgHours} hint="temps moyen réparation" accent="ok" /></StaggerItem>
      </Stagger>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2">
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={16} className="text-cyan animate-pulse" />
              <h2 className="font-semibold text-chalk">Flux d&apos;activité</h2>
              <span className="ml-auto label-mono">live</span>
            </div>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-cyan/40 via-white/10 to-transparent" />
              {failures.slice(0, 6).map((f, i) => (
                <motion.div key={f.id}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative mb-4 last:mb-0">
                  <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan ring-4 ring-cyan/10" />
                  <Link href="/failures" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 -mx-2 hover:bg-white/[0.03] transition">
                    <AlertTriangle size={15} className="text-amber shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-chalk truncate">{f.title}</div>
                      <div className="label-mono mt-0.5">{equipmentById.get(f.equipment_id)?.name} · {new Date(f.reported_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <SeverityBadge severity={f.severity} />
                    <div className="w-20 text-right hidden sm:block"><StatusBadge status={f.status} /></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass p-6 h-full">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch size={16} className="text-amber" />
              <h2 className="font-semibold text-chalk">Réparation en cours</h2>
            </div>
            {live ? (
              <>
                <p className="text-sm text-steel mb-5">{live.title} · {equipmentById.get(live.equipment_id)?.name}</p>
                <div className="space-y-1">
                  {steps.map((s, i) => (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3">
                      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-mono ${
                        s.status === 'done' ? 'bg-ok/15 text-ok border border-ok/30'
                        : s.status === 'active' ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-glow'
                        : 'bg-white/[0.03] text-steel border border-white/10'}`}>
                        {s.status === 'done' ? '\u2713' : s.step_order}
                      </div>
                      <div className={`text-sm ${s.status === 'pending' ? 'text-steel' : 'text-chalk'}`}>{s.step_name}</div>
                      {s.status === 'active' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />}
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-steel">Aucune panne en cours.</p>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
