import { Equipment, Failure, Severity } from './types';

const SEV_WEIGHT: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 5 };

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PredictiveInsight {
  equipment: Equipment;
  failureCount: number;
  avgIntervalDays: number | null;
  nextMaintenanceDue: string | null;   // ISO date
  daysUntilDue: number | null;         // negative = overdue
  riskScore: number;                   // 0–100
  riskLevel: RiskLevel;
  trend: 'stable' | 'worsening' | 'improving' | 'unknown';
  lastFailureDate: string | null;
}

export function computePredictive(equipment: Equipment, allFailures: Failure[]): PredictiveInsight {
  const eqF = allFailures
    .filter(f => f.equipment_id === equipment.id)
    .sort((a, b) => new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime());

  const failureCount  = eqF.length;
  const lastFailure   = eqF.at(-1) ?? null;
  const lastFailureDate = lastFailure?.reported_at ?? null;

  // ── Intervalle moyen entre pannes ─────────────────────────────────────
  let avgIntervalDays: number | null = null;
  let nextMaintenanceDue: string | null = null;
  let daysUntilDue: number | null = null;

  if (eqF.length >= 2) {
    const spans: number[] = [];
    for (let i = 1; i < eqF.length; i++) {
      const diff = (new Date(eqF[i].reported_at).getTime() - new Date(eqF[i - 1].reported_at).getTime()) / 864e5;
      spans.push(diff);
    }
    avgIntervalDays = Math.round(spans.reduce((s, d) => s + d, 0) / spans.length);

    const nextTs = new Date(lastFailure!.reported_at).getTime() + avgIntervalDays * 864e5;
    nextMaintenanceDue = new Date(nextTs).toISOString();
    daysUntilDue = Math.round((nextTs - Date.now()) / 864e5);
  }

  // ── Score de risque (0–100) ────────────────────────────────────────────
  const daysSinceLast = lastFailureDate
    ? (Date.now() - new Date(lastFailureDate).getTime()) / 864e5
    : 999;

  const avgSev = eqF.length > 0
    ? eqF.reduce((s, f) => s + SEV_WEIGHT[f.severity], 0) / eqF.length
    : 0;

  // More failures + higher severity + overdue = higher risk
  const overdueBonus = daysUntilDue !== null && daysUntilDue < 0 ? Math.min(30, Math.abs(daysUntilDue)) : 0;
  const raw = (failureCount * 8) + (avgSev * 12) + overdueBonus - (daysSinceLast * 0.3);
  const riskScore = Math.min(100, Math.max(0, Math.round(raw)));

  const riskLevel: RiskLevel =
    riskScore >= 70 ? 'critical' :
    riskScore >= 45 ? 'high' :
    riskScore >= 20 ? 'medium' : 'low';

  // ── Tendance (compare 1ère moitié vs 2ème moitié) ─────────────────────
  let trend: PredictiveInsight['trend'] = 'unknown';
  if (eqF.length >= 4) {
    const half = Math.floor(eqF.length / 2);
    const firstHalfAvgSev = eqF.slice(0, half).reduce((s, f) => s + SEV_WEIGHT[f.severity], 0) / half;
    const secondHalfAvgSev = eqF.slice(half).reduce((s, f) => s + SEV_WEIGHT[f.severity], 0) / (eqF.length - half);
    trend = secondHalfAvgSev > firstHalfAvgSev + 0.3 ? 'worsening'
      : secondHalfAvgSev < firstHalfAvgSev - 0.3 ? 'improving'
      : 'stable';
  } else if (eqF.length >= 2) {
    trend = 'stable';
  }

  return {
    equipment, failureCount, avgIntervalDays,
    nextMaintenanceDue, daysUntilDue,
    riskScore, riskLevel, trend, lastFailureDate,
  };
}

export function computeAllPredictive(equipments: Equipment[], failures: Failure[]): PredictiveInsight[] {
  return equipments
    .map(e => computePredictive(e, failures))
    .sort((a, b) => b.riskScore - a.riskScore);
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  low:      'text-ok   border-ok/30   bg-ok/8',
  medium:   'text-info border-info/30 bg-info/8',
  high:     'text-warn border-warn/30 bg-warn/8',
  critical: 'text-crit border-crit/30 bg-crit/8',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Faible', medium: 'Modéré', high: 'Élevé', critical: 'Critique',
};

export const TREND_ICON: Record<PredictiveInsight['trend'], string> = {
  worsening: '↗ Dégradation',
  improving: '↘ Amélioration',
  stable:    '→ Stable',
  unknown:   '? Données insuffisantes',
};
