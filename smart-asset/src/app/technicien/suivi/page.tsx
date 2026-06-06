'use client';
import { useStore } from '@/lib/store';
import { equipmentById, workflowFor, WORKFLOW_STEP_NAMES } from '@/lib/sample-data';
import Link from 'next/link';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Package, ArrowRight } from 'lucide-react';

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-crit border-crit/30 bg-crit/8',
  high:     'text-warn border-warn/30 bg-warn/8',
  medium:   'text-info border-info/30 bg-info/8',
  low:      'text-ok  border-ok/30  bg-ok/8',
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critique', high: 'Élevée', medium: 'Moyenne', low: 'Faible',
};

export default function SuiviPage() {
  const { failures, workflowProgress, partRequests } = useStore();

  // On affiche toutes les pannes pour la démo (en prod, filtré par user connecté)
  const withSubmitter = failures.filter(f => f.submitter);
  const allFailures   = failures; // démo : tout visible

  if (allFailures.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <ClipboardList size={40} className="text-steel mx-auto" />
        <p className="text-chalk font-semibold">Aucune demande en cours</p>
        <Link href="/technicien/soumettre" className="btn btn-primary inline-flex">Faire une demande</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-chalk">Mes demandes</h1>
          <p className="text-steel text-sm">{allFailures.length} dossier{allFailures.length > 1 ? 's' : ''} · suivi en temps réel</p>
        </div>
        <Link href="/technicien/soumettre" className="btn btn-primary gap-2 text-sm">
          <ArrowRight size={14} /> Nouvelle demande
        </Link>
      </div>

      {allFailures.map(f => {
        const eq         = equipmentById(f.equipment_id);
        const step       = workflowProgress[f.id] ?? 1;
        const steps      = workflowFor(f.id, workflowProgress);
        const isDone     = step >= 10;
        const related    = partRequests.filter(r => r.failure_id === f.id);
        const currentStepName = WORKFLOW_STEP_NAMES[step - 1];

        return (
          <div key={f.id} className="glass p-5 space-y-4">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-chalk">{f.title}</h2>
                  <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${SEVERITY_COLOR[f.severity]}`}>
                    {SEVERITY_LABEL[f.severity]}
                  </span>
                </div>
                <p className="label-mono mt-1">
                  {eq?.name} · {eq?.serial_number} · {new Date(f.reported_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {f.submitter && (
                  <p className="text-xs text-steel mt-0.5">
                    Soumis par <span className="text-chalk">{f.submitter.firstName} {f.submitter.lastName}</span> · {f.submitter.company}
                  </p>
                )}
              </div>
              {isDone ? (
                <span className="flex items-center gap-1.5 text-ok text-xs font-semibold border border-ok/30 rounded-full px-3 py-1">
                  <CheckCircle size={13} /> Clôturé
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-cyan text-xs font-semibold border border-cyan/30 rounded-full px-3 py-1">
                  <Clock size={13} /> En cours
                </span>
              )}
            </div>

            {/* Barre de progression workflow */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-steel">Étape actuelle : <span className="text-chalk font-medium">{currentStepName}</span></span>
                <span className="label-mono">{step}/10</span>
              </div>
              <div className="flex gap-0.5">
                {steps.map((s, i) => (
                  <div key={i} className={`flex-1 h-2 rounded-full transition-colors ${
                    s.status === 'done'   ? 'bg-ok' :
                    s.status === 'active' ? 'bg-cyan animate-pulse' :
                                           'bg-[var(--surface2)]'
                  }`} title={s.step_name} />
                ))}
              </div>
              <div className="flex gap-0.5 mt-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex-1 text-center">
                    {s.status === 'active' && (
                      <span className="text-[8px] text-cyan font-mono leading-none">{s.step_name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alerte sourcing */}
            {step >= 5 && step <= 7 && (
              <div className="flex items-center gap-2 rounded-lg border border-warn/20 bg-warn/5 px-3 py-2">
                <AlertTriangle size={13} className="text-warn shrink-0" />
                <p className="text-xs text-steel">Phase sourcing/fabrication en cours — délai moyen 96h.</p>
              </div>
            )}

            {/* Pièces liées */}
            {related.length > 0 && (
              <div className="border-t border-[var(--hair)] pt-3">
                <p className="label-mono mb-2">Pièces commandées</p>
                <div className="space-y-1.5">
                  {related.map(r => (
                    <div key={r.id} className="flex items-center gap-3">
                      <Package size={13} className="text-amber shrink-0" />
                      <span className="text-sm text-chalk flex-1">{r.spare_part_id ?? 'Pièce en identification'}</span>
                      <span className={`text-xs font-medium ${r.urgency === 'blocking' ? 'text-crit' : r.urgency === 'urgent' ? 'text-amber' : 'text-steel'}`}>{r.urgency}</span>
                      <span className="text-xs font-mono text-steel">{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic IA si dispo */}
            {f.ai_diagnosis && (
              <div className="border-t border-[var(--hair)] pt-3">
                <p className="label-mono mb-1">Diagnostic IA</p>
                <p className="text-xs text-steel leading-relaxed">{f.ai_diagnosis.diagnosis}</p>
                {f.ai_diagnosis.recommended_parts?.[0] && (
                  <p className="text-xs text-amber mt-1 font-medium">
                    Pièce recommandée : {f.ai_diagnosis.recommended_parts[0].name}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
