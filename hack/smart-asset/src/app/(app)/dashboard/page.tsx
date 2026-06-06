'use client';
import Link from 'next/link';
import { StatCard, PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { FadeIn, Stagger, StaggerItem, motion } from '@/components/motion';
import { workflowFor } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { computeAllPredictive, RISK_COLORS, RISK_LABELS } from '@/lib/predictive';
import { Plus, AlertTriangle, Radio, GitBranch, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { failures, equipments, partRequests, workflowProgress, equipmentById } = useStore();

  const open = failures.filter((f) => !['resolved', 'closed'].includes(f.status));
  const pendingParts = partRequests.filter((r) => !['delivered', 'cancelled'].includes(r.status));
  const resolved = failures.filter((f) => f.resolved_at);
  const avgHours = Math.round(
    resolved.reduce((s, f) => s + (new Date(f.resolved_at!).getTime() - new Date(f.reported_at).getTime()) / 36e5, 0) /
      Math.max(resolved.length, 1));

  const live = [...failures]
    .filter(f => !['resolved', 'closed'].includes(f.status) && (workflowProgress[f.id] ?? 1) < 10)
    .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())[0]
    ?? failures[0];
  const steps = live ? workflowFor(live.id, workflowProgress) : [];

  // Prédictif — top 3 équipements à risque
  const predictions = computeAllPredictive(equipments, failures).slice(0, 3);
  const highRiskCount = computeAllPredictive(equipments, failures).filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;

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
        {/* Flux activité */}
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
                      <div className="label-mono mt-0.5">{equipmentById(f.equipment_id)?.name} · {new Date(f.reported_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <SeverityBadge severity={f.severity} />
                    <div className="w-20 text-right hidden sm:block"><StatusBadge status={f.status} /></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Réparation en cours */}
        <FadeIn delay={0.1}>
          <div className="glass p-6 h-full">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch size={16} className="text-amber" />
              <h2 className="font-semibold text-chalk">Réparation en cours</h2>
            </div>
            {live ? (
              <>
                <p className="text-sm text-steel mb-5">{live.title} · {equipmentById(live.equipment_id)?.name}</p>
                <div className="space-y-1">
                  {steps.map((s, i) => (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3">
                      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-mono ${
                        s.status === 'done'   ? 'bg-ok/15 text-ok border border-ok/30'
                        : s.status === 'active' ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-glow'
                        : 'bg-white/[0.03] text-steel border border-white/10'}`}>
                        {s.status === 'done' ? '✓' : s.step_order}
                      </div>
                      <div className={`text-sm ${s.status === 'pending' ? 'text-steel' : 'text-chalk'}`}>{s.step_name}</div>
                      {s.status === 'active' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />}
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-steel mt-4">Aucune réparation en cours.</p>
            )}
          </div>
        </FadeIn>
      </div>

      {/* ── Section Maintenance Prédictive ──────────────────────────────── */}
      <FadeIn delay={0.15} className="mt-6">
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan" />
              <h2 className="font-semibold text-chalk">Intelligence prédictive</h2>
              <span className="label-mono text-cyan">AssetIQ · IA</span>
            </div>
            {highRiskCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold border border-warn/30 rounded-full px-3 py-1 text-warn bg-warn/5">
                <AlertTriangle size={12} /> {highRiskCount} équipement{highRiskCount > 1 ? 's' : ''} à surveiller
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {predictions.map((p, i) => (
              <motion.div key={p.equipment.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={`/equipments/${p.equipment.id}`}
                  className="block rounded-xl border border-[var(--hair)] p-4 hover:border-cyan/30 hover:bg-cyan/5 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-chalk truncate">{p.equipment.name}</p>
                      <p className="label-mono mt-0.5 truncate">{p.equipment.serial_number}</p>
                    </div>
                    <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 shrink-0 ${RISK_COLORS[p.riskLevel]}`}>
                      {RISK_LABELS[p.riskLevel]}
                    </span>
                  </div>

                  {/* Risk bar */}
                  <div className="h-1.5 w-full rounded-full bg-[var(--surface2)] overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all ${
                      p.riskLevel === 'critical' ? 'bg-crit' :
                      p.riskLevel === 'high'     ? 'bg-warn' :
                      p.riskLevel === 'medium'   ? 'bg-info' : 'bg-ok'
                    }`} style={{ width: `${p.riskScore}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-steel">Score</p>
                      <p className="text-chalk font-semibold">{p.riskScore}/100</p>
                    </div>
                    <div>
                      <p className="text-steel">Pannes</p>
                      <p className="text-chalk font-semibold">{p.failureCount}</p>
                    </div>
                  </div>

                  {p.nextMaintenanceDue && (
                    <div className={`mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
                      p.daysUntilDue !== null && p.daysUntilDue < 0 ? 'bg-crit/10 text-crit border border-crit/20' :
                      p.daysUntilDue !== null && p.daysUntilDue <= 14 ? 'bg-warn/10 text-warn border border-warn/20' :
                      'bg-[var(--surface2)] text-steel'
                    }`}>
                      <Calendar size={11} />
                      <span>
                        {p.daysUntilDue !== null && p.daysUntilDue < 0
                          ? `⚠️ Retard ${Math.abs(p.daysUntilDue)}j`
                          : p.daysUntilDue !== null && p.daysUntilDue === 0
                          ? '⚡ Dû aujourd\'hui'
                          : `Maintenance dans ${p.daysUntilDue}j`
                        }
                      </span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 text-xs text-steel text-center">
            Calcul basé sur l&apos;historique des pannes · intervalle moyen · score de sévérité cumulée
            — <Link href="/analytics" className="text-cyan hover:underline">Voir analytics complètes</Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
