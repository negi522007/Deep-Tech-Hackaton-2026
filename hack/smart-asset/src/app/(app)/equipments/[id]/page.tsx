'use client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageHeader, SeverityBadge, StatusBadge } from '@/components/ui';
import { companyById, equipmentStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/sample-data';
import { useStore } from '@/lib/store';
import { computePredictive, RISK_COLORS, RISK_LABELS, TREND_ICON } from '@/lib/predictive';
import { ArrowLeft, QrCode, AlertTriangle, TrendingUp, Calendar, Wrench, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function EquipmentDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { failures, equipmentById } = useStore();

  const e = equipmentById(id);
  if (!e) notFound();

  const history = failures.filter((f) => f.equipment_id === id);
  const st = equipmentStatus(id, failures);
  const insight = computePredictive(e, failures);

  const [qrUrl, setQrUrl] = useState('');
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    setQrUrl(`${window.location.origin}/technicien/soumettre?equipmentId=${id}`);
  }, [id]);

  const daysUntil = insight.daysUntilDue;
  const dueBadge = daysUntil === null ? null
    : daysUntil < 0  ? `En retard de ${Math.abs(daysUntil)} j`
    : daysUntil === 0 ? 'Dû aujourd\'hui'
    : `Dans ${daysUntil} j`;

  return (
    <div>
      <Link href="/equipments" className="inline-flex items-center gap-1 text-sm text-steel hover:text-chalk mb-4">
        <ArrowLeft size={16} /> Équipements
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <PageHeader title={e.name} subtitle={`${e.manufacturer ?? '—'} · ${e.model ?? '—'}`} />
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold border rounded-full px-3 py-1 ${STATUS_COLORS[st]}`}>
            {STATUS_LABELS[st]}
          </span>
          <button
            onClick={() => setShowQr(true)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/5 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/10 transition"
          >
            <QrCode size={14} /> QR Code terrain
          </button>
          <Link
            href={`/failures/new?equipmentId=${id}`}
            className="flex items-center gap-1.5 rounded-xl border border-warn/30 bg-warn/5 px-3 py-1.5 text-xs text-warn hover:bg-warn/10 transition"
          >
            <Wrench size={14} /> Déclarer une panne
          </Link>
        </div>
      </div>

      {/* QR Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQr(false)}>
          <div className="glass p-8 rounded-2xl flex flex-col items-center gap-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-bold text-chalk">QR Code terrain</p>
                <p className="text-xs text-steel">{e.name} · {e.serial_number}</p>
              </div>
              <button onClick={() => setShowQr(false)} className="text-steel hover:text-chalk transition">
                <X size={20} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-glow">
              {qrUrl && (
                <QRCodeSVG
                  value={qrUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="M"
                  includeMargin={false}
                />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-steel">Scannez pour déclarer une panne directement</p>
              <p className="text-[10px] font-mono text-steel/60 break-all">{qrUrl}</p>
            </div>

            <div className="w-full rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
              <p className="text-xs text-cyan font-medium">💡 Conseil démo</p>
              <p className="text-xs text-steel mt-1">Imprimez ce QR et collez-le sur l&apos;équipement. Le technicien scanne → formulaire pré-rempli → diagnostic IA → admin alerté.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Fiche équipement */}
        <div className="glass p-5">
          <div className="label-mono mb-3">Fiche équipement</div>
          <dl className="space-y-2 text-sm">
            {[
              ['Numéro de série', e.serial_number],
              ['Catégorie',       e.category],
              ['Fabricant',       e.manufacturer],
              ['Modèle',          e.model],
              ['Date d\'achat',   e.purchase_date],
              ['Emplacement',     e.location],
              ['Entreprise',      companyById(e.company_id)?.name],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-2">
                <dt className="text-steel">{k}</dt>
                <dd className="text-chalk font-mono text-right">{v || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Historique pannes */}
        <div className="glass p-5 lg:col-span-2">
          <div className="label-mono mb-3">Historique des pannes ({history.length})</div>
          {history.length === 0 ? (
            <p className="text-sm text-steel">Aucune panne enregistrée.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {history.map((f) => (
                <div key={f.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1">
                    <div className="text-sm text-chalk">{f.title}</div>
                    <div className="label-mono mt-0.5">{new Date(f.reported_at).toLocaleDateString('fr-FR')} · {f.category}</div>
                  </div>
                  <SeverityBadge severity={f.severity} />
                  <StatusBadge status={f.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analyse prédictive */}
        <div className="glass p-5 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-cyan" />
            <div className="label-mono">Analyse prédictive — AssetIQ Intelligence</div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Score de risque */}
            <div className="rounded-xl border border-[var(--hair)] p-4">
              <p className="label-mono mb-2">Score de risque</p>
              <div className="flex items-end gap-2 mb-1">
                <span className={`text-3xl font-black tabular-nums ${
                  insight.riskLevel === 'critical' ? 'text-crit' :
                  insight.riskLevel === 'high'     ? 'text-warn' :
                  insight.riskLevel === 'medium'   ? 'text-info' : 'text-ok'
                }`}>{insight.riskScore}</span>
                <span className="text-steel text-sm mb-0.5">/100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--surface2)] overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    insight.riskLevel === 'critical' ? 'bg-crit' :
                    insight.riskLevel === 'high'     ? 'bg-warn' :
                    insight.riskLevel === 'medium'   ? 'bg-info' : 'bg-ok'
                  }`}
                  style={{ width: `${insight.riskScore}%` }}
                />
              </div>
              <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${RISK_COLORS[insight.riskLevel]}`}>
                {RISK_LABELS[insight.riskLevel]}
              </span>
            </div>

            {/* Prochaine maintenance */}
            <div className="rounded-xl border border-[var(--hair)] p-4">
              <p className="label-mono mb-2 flex items-center gap-1.5"><Calendar size={12} /> Prochaine maintenance</p>
              {insight.nextMaintenanceDue ? (
                <>
                  <p className="text-chalk font-semibold text-sm">
                    {new Date(insight.nextMaintenanceDue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </p>
                  {dueBadge && (
                    <p className={`text-xs mt-1 font-medium ${daysUntil !== null && daysUntil < 0 ? 'text-crit' : daysUntil !== null && daysUntil <= 7 ? 'text-warn' : 'text-steel'}`}>
                      {daysUntil !== null && daysUntil < 0 ? '⚠️ ' : ''}{dueBadge}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-steel mt-1">Données insuffisantes<br />(moins de 2 pannes)</p>
              )}
            </div>

            {/* Intervalle moyen */}
            <div className="rounded-xl border border-[var(--hair)] p-4">
              <p className="label-mono mb-2">Intervalle moyen</p>
              {insight.avgIntervalDays !== null ? (
                <>
                  <p className="text-3xl font-black tabular-nums text-chalk">{insight.avgIntervalDays}</p>
                  <p className="text-xs text-steel mt-1">jours entre pannes</p>
                </>
              ) : (
                <p className="text-xs text-steel mt-1">Données insuffisantes</p>
              )}
            </div>

            {/* Tendance */}
            <div className="rounded-xl border border-[var(--hair)] p-4">
              <p className="label-mono mb-2">Tendance</p>
              <p className={`text-sm font-semibold mt-1 ${
                insight.trend === 'worsening' ? 'text-crit' :
                insight.trend === 'improving' ? 'text-ok' :
                insight.trend === 'stable'    ? 'text-info' : 'text-steel'
              }`}>{TREND_ICON[insight.trend]}</p>
              <p className="text-xs text-steel mt-2">{insight.failureCount} panne{insight.failureCount > 1 ? 's' : ''} enregistrée{insight.failureCount > 1 ? 's' : ''}</p>
              {insight.lastFailureDate && (
                <p className="text-xs text-steel">Dernière : {new Date(insight.lastFailureDate).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          </div>

          {insight.riskScore >= 50 && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-warn/20 bg-warn/5 px-4 py-3">
              <AlertTriangle size={16} className="text-warn shrink-0 mt-0.5" />
              <p className="text-xs text-steel">
                <span className="text-chalk font-semibold">Recommandation AssetIQ :</span>{' '}
                {insight.riskLevel === 'critical'
                  ? 'Maintenance immédiate requise. La fréquence et la sévérité des pannes indiquent un équipement en fin de vie opérationnelle.'
                  : 'Planifier une inspection préventive. La tendance des pannes suggère une dégradation progressive des composants critiques.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
