'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { companies, equipments, spareParts, equipmentStatus, STATUS_LABELS, STATUS_COLORS, WORKFLOW_STEP_NAMES } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { SeverityBadge } from '@/components/ui';
import { Building2, Boxes, AlertTriangle, Package, ArrowRight, CheckCircle, ShieldCheck, Radar, Activity } from 'lucide-react';

export default function AdminPage() {
  const { failures, workflowProgress, advanceWorkflow, partRequests } = useStore();
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  // Métriques globales
  const totalEquipments = equipments.length;
  const activeFailures = failures.filter(f => f.status !== 'resolved' && f.status !== 'closed');
  const criticalCount = activeFailures.filter(f => f.severity === 'critical').length;
  const outOfStock = spareParts.filter(p => p.stock_qty === 0).length;
  const pendingRequests = partRequests.filter(r => r.status === 'requested' || r.status === 'approved').length;

  // Métriques par entreprise
  const companyStats = companies.map(c => {
    const eq = equipments.filter(e => e.company_id === c.id);
    const fa = failures.filter(f => f.company_id === c.id);
    const active = fa.filter(f => f.status !== 'resolved' && f.status !== 'closed');
    const crit = active.filter(f => f.severity === 'critical');
    return { company: c, equipments: eq, failures: fa, active, critical: crit };
  });

  const displayFailures = activeCompany
    ? failures.filter(f => f.company_id === activeCompany)
    : failures;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/10 text-cyan">
          <ShieldCheck size={20} />
        </div>
        <PageHeader title="Administration" subtitle="Supervision globale multi-entreprises" />
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Boxes, label: 'Équipements', value: totalEquipments, color: 'text-cyan' },
          { icon: AlertTriangle, label: 'Pannes actives', value: activeFailures.length, color: activeFailures.length > 0 ? 'text-warn' : 'text-ok' },
          { icon: AlertTriangle, label: 'Cas critiques', value: criticalCount, color: criticalCount > 0 ? 'text-crit' : 'text-ok' },
          { icon: Package, label: 'Pièces en rupture', value: outOfStock, color: outOfStock > 0 ? 'text-crit' : 'text-ok' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} className="panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="label-mono">{label}</span>
            </div>
            <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Radar Prédictif (Hackathon Demo Feature) */}
      <div className="mb-8">
        <div className="rounded-xl border border-crit/30 bg-[var(--surface1)] p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5">
            <Radar size={150} className="text-crit animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-crit/20 text-crit">
              <Activity size={16} />
            </div>
            <h3 className="font-bold text-chalk">Radar Prédictif IA</h3>
            <span className="ml-2 rounded-full border border-crit/40 bg-crit/10 px-2 py-0.5 text-[10px] font-bold text-crit uppercase tracking-wider animate-pulse">
              Alerte Imminente
            </span>
          </div>
          <p className="text-sm text-chalk leading-relaxed max-w-2xl relative z-10">
            <span className="font-semibold text-crit">Risque critique (85%)</span> détecté sur <span className="font-mono bg-white/5 px-1 rounded text-cyan">Extrudeuse EX-200</span>. 
            L'analyse des vibrations et de l'historique thermique projette une défaillance du roulement principal d'ici <span className="font-bold underline decoration-crit/50">5 jours</span>.
          </p>
          <div className="mt-4 flex gap-3 relative z-10">
            <button className="btn-primary py-1.5 px-4 text-xs !bg-crit hover:!bg-crit/80 border-none text-white shadow-[0_0_15px_rgba(255,92,122,0.4)]">
              Générer ordre préventif
            </button>
            <button className="btn-ghost py-1.5 px-4 text-xs">
              Détails de l'analyse
            </button>
          </div>
        </div>
      </div>

      {/* Vue par entreprise */}
      <div className="mb-6">
        <p className="label-mono mb-3">Entreprises</p>
        <div className="grid md:grid-cols-3 gap-3">
          {companyStats.map(({ company, equipments: eq, active, critical }) => (
            <button
              key={company.id}
              onClick={() => setActiveCompany(activeCompany === company.id ? null : company.id)}
              className={`glass p-5 text-left transition-all ${
                activeCompany === company.id ? 'border-cyan/50 shadow-glow' : 'glass-hover'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="font-semibold text-chalk text-sm">{company.name}</p>
                  <p className="label-mono text-[9px]">{company.sector}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-chalk">{eq.length}</p>
                  <p className="label-mono text-[9px]">équipements</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${active.length > 0 ? 'text-warn' : 'text-ok'}`}>{active.length}</p>
                  <p className="label-mono text-[9px]">pannes actives</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${critical.length > 0 ? 'text-crit' : 'text-ok'}`}>{critical.length}</p>
                  <p className="label-mono text-[9px]">critiques</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Statut équipements */}
      <div className="mb-6">
        <p className="label-mono mb-3">
          Statut des équipements{activeCompany ? ` — ${companies.find(c => c.id === activeCompany)?.name}` : ' (tous)'}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {equipments
            .filter(e => !activeCompany || e.company_id === activeCompany)
            .map(e => {
              const st = equipmentStatus(e.id, failures);
              return (
                <div key={e.id} className="panel p-3 flex items-center gap-3">
                  <Boxes size={16} className="text-steel shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chalk truncate">{e.name}</p>
                    <p className="label-mono text-[9px]">{e.serial_number}</p>
                  </div>
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 shrink-0 ${STATUS_COLORS[st]}`}>
                    {STATUS_LABELS[st]}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Gestion workflow — toutes les pannes */}
      <div>
        <p className="label-mono mb-3">
          Gestion workflow{activeCompany ? ` — ${companies.find(c => c.id === activeCompany)?.name}` : ' (toutes entreprises)'}
        </p>
        <div className="space-y-2">
          {displayFailures.map(f => {
            const currentStep = workflowProgress[f.id] ?? 1;
            const isLast = currentStep >= 10;
            const eq = equipments.find(e => e.id === f.equipment_id);
            const co = companies.find(c => c.id === f.company_id);
            return (
              <div key={f.id} className="panel p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-chalk">{f.title}</span>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <p className="label-mono mt-0.5">{eq?.name} · {co?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel font-mono">
                    {WORKFLOW_STEP_NAMES[currentStep - 1]} ({currentStep}/10)
                  </span>
                  <button
                    onClick={() => advanceWorkflow(f.id)}
                    disabled={isLast}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                      isLast
                        ? 'border-ok/25 text-ok cursor-default'
                        : 'border-cyan/35 text-cyan hover:bg-cyan/10 hover:border-cyan/60'
                    }`}
                  >
                    {isLast ? <><CheckCircle size={12} /> Clôturé</> : <><ArrowRight size={12} /> Avancer</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demandes de pièces en attente */}
      {pendingRequests > 0 && (
        <div className="mt-6">
          <p className="label-mono mb-3">Demandes de pièces en attente d&apos;approbation ({pendingRequests})</p>
          <div className="space-y-2">
            {partRequests
              .filter(r => r.status === 'requested' || r.status === 'approved')
              .map(r => (
                <div key={r.id} className="panel p-3 flex items-center gap-3">
                  <Package size={15} className="text-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-chalk">
                      {spareParts.find(p => p.id === r.spare_part_id)?.name ?? 'Pièce'} — qté {r.quantity}
                    </p>
                    <p className="label-mono">
                      {failures.find(f => f.id === r.failure_id)?.title ?? r.failure_id}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${
                    r.urgency === 'blocking' ? 'text-crit' : r.urgency === 'urgent' ? 'text-amber' : 'text-steel'
                  }`}>{r.urgency}</span>
                  <span className="text-xs font-mono text-steel">{r.status}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
