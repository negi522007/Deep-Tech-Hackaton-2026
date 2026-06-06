import {
  Company, Equipment, Failure, SparePart, SparePartRequest, WorkflowStep,
} from './types';

export const companies: Company[] = [
  { id: 'c1', name: 'SOBEBRA Cotonou', sector: 'Beverage' },
  { id: 'c2', name: 'CIMBENIN', sector: 'Cement' },
  { id: 'c3', name: 'Bénin Textile SA', sector: 'Textile' },
];

export const equipments: Equipment[] = [
  { id: 'e1', company_id: 'c1', name: 'Convoyeur ligne 1', category: 'conveyor', serial_number: 'CNV-001', model: 'C200', manufacturer: 'SIEMENS', purchase_date: '2021-03-10', location: 'Hall A' },
  { id: 'e2', company_id: 'c1', name: 'Compresseur air', category: 'compressor', serial_number: 'CMP-014', model: 'GA22', manufacturer: 'ATLAS COPCO', purchase_date: '2020-07-01', location: 'Salle technique' },
  { id: 'e3', company_id: 'c2', name: 'Broyeur à boulets', category: 'mill', serial_number: 'MIL-007', model: 'BM-90', manufacturer: 'FLSmidth', purchase_date: '2019-11-20', location: 'Atelier broyage' },
  { id: 'e4', company_id: 'c3', name: 'Métier à tisser', category: 'loom', serial_number: 'LOM-031', model: 'OmniPlus', manufacturer: 'PICANOL', purchase_date: '2022-01-15', location: 'Tissage 2' },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

export const failures: Failure[] = [
  // ── Historique 8 mois ──────────────────────────────────────────────────────
  { id: 'f7',  equipment_id: 'e1', company_id: 'c1', title: 'Vibration palier gauche',        category: 'mechanical',  severity: 'high',     status: 'resolved', reported_at: daysAgo(235), resolved_at: daysAgo(232) },
  { id: 'f8',  equipment_id: 'e3', company_id: 'c2', title: 'Pression pompe hydraulique basse', category: 'hydraulic', severity: 'medium',   status: 'resolved', reported_at: daysAgo(225), resolved_at: daysAgo(223) },
  { id: 'f9',  equipment_id: 'e2', company_id: 'c1', title: 'Court-circuit contacteur K3',    category: 'electrical',  severity: 'medium',   status: 'resolved', reported_at: daysAgo(208), resolved_at: daysAgo(206) },
  { id: 'f10', equipment_id: 'e4', company_id: 'c3', title: 'Bruit chaîne de transmission',   category: 'mechanical',  severity: 'low',      status: 'resolved', reported_at: daysAgo(200), resolved_at: daysAgo(198) },
  { id: 'f11', equipment_id: 'e1', company_id: 'c1', title: 'Fuite circuit pneumatique',      category: 'pneumatic',   severity: 'high',     status: 'resolved', reported_at: daysAgo(178), resolved_at: daysAgo(174) },
  { id: 'f12', equipment_id: 'e3', company_id: 'c2', title: 'Fracture bielle de broyage',     category: 'mechanical',  severity: 'critical', status: 'resolved', reported_at: daysAgo(168), resolved_at: daysAgo(160) },
  { id: 'f13', equipment_id: 'e2', company_id: 'c1', title: 'Surchauffe variateur fréquence', category: 'electrical',  severity: 'high',     status: 'resolved', reported_at: daysAgo(148), resolved_at: daysAgo(145) },
  { id: 'f14', equipment_id: 'e4', company_id: 'c3', title: 'Fissure bâti machine',           category: 'structural',  severity: 'medium',   status: 'resolved', reported_at: daysAgo(138), resolved_at: daysAgo(132) },
  { id: 'f15', equipment_id: 'e1', company_id: 'c1', title: 'Filtre hydraulique colmaté',     category: 'hydraulic',   severity: 'medium',   status: 'resolved', reported_at: daysAgo(118), resolved_at: daysAgo(116) },
  { id: 'f16', equipment_id: 'e3', company_id: 'c2', title: 'Usure garniture mécanique',      category: 'mechanical',  severity: 'high',     status: 'resolved', reported_at: daysAgo(105), resolved_at: daysAgo(101) },
  { id: 'f17', equipment_id: 'e2', company_id: 'c1', title: 'Défaut isolation bobinage',      category: 'electrical',  severity: 'medium',   status: 'resolved', reported_at: daysAgo(88),  resolved_at: daysAgo(85) },
  { id: 'f18', equipment_id: 'e4', company_id: 'c3', title: 'Roulement galet porteur HS',     category: 'mechanical',  severity: 'high',     status: 'resolved', reported_at: daysAgo(78),  resolved_at: daysAgo(73) },
  { id: 'f19', equipment_id: 'e1', company_id: 'c1', title: 'Rupture flexible haute pression', category: 'hydraulic',  severity: 'critical', status: 'resolved', reported_at: daysAgo(62),  resolved_at: daysAgo(54) },
  { id: 'f20', equipment_id: 'e3', company_id: 'c2', title: 'Électrovanne pneumatique bloquée', category: 'pneumatic', severity: 'low',      status: 'resolved', reported_at: daysAgo(52),  resolved_at: daysAgo(51) },
  { id: 'f21', equipment_id: 'e2', company_id: 'c1', title: 'Fusible moteur principal grillé', category: 'electrical', severity: 'medium',  status: 'resolved', reported_at: daysAgo(43),  resolved_at: daysAgo(41) },
  { id: 'f22', equipment_id: 'e4', company_id: 'c3', title: 'Déraillement courroie principale', category: 'mechanical', severity: 'high',   status: 'resolved', reported_at: daysAgo(38),  resolved_at: daysAgo(36) },
  // ── Pannes récentes (originales) ──────────────────────────────────────────
  { id: 'f1',  equipment_id: 'e1', company_id: 'c1', title: 'Roulement bruyant',              category: 'mechanical',  severity: 'high',     status: 'resolved',    reported_at: daysAgo(95),  resolved_at: daysAgo(94) },
  { id: 'f2',  equipment_id: 'e1', company_id: 'c1', title: 'Courroie cassée',               category: 'mechanical',  severity: 'critical', status: 'resolved',    reported_at: daysAgo(60),  resolved_at: daysAgo(59) },
  { id: 'f3',  equipment_id: 'e2', company_id: 'c1', title: 'Surchauffe moteur',             category: 'electrical',  severity: 'high',     status: 'in_repair',   reported_at: daysAgo(35),  resolved_at: null },
  { id: 'f4',  equipment_id: 'e3', company_id: 'c2', title: 'Fuite hydraulique',             category: 'hydraulic',   severity: 'critical', status: 'reported',    reported_at: daysAgo(20),  resolved_at: null },
  { id: 'f5',  equipment_id: 'e3', company_id: 'c2', title: 'Capteur HS',                   category: 'electrical',  severity: 'medium',   status: 'resolved',    reported_at: daysAgo(12),  resolved_at: daysAgo(11) },
  { id: 'f6',  equipment_id: 'e4', company_id: 'c3', title: 'Vibration anormale',           category: 'mechanical',  severity: 'medium',   status: 'diagnosing',  reported_at: daysAgo(5),   resolved_at: null },
];

export const spareParts: SparePart[] = [
  { id: 'p1', reference: 'BRG-6204',    name: 'Roulement 6204-2RS',          category: 'bearing', unit_price: 4500,  stock_qty: 12 },
  { id: 'p2', reference: 'BLT-A45',     name: 'Courroie trapézoïdale A45',   category: 'belt',    unit_price: 8000,  stock_qty: 3 },
  { id: 'p3', reference: 'SEN-PT100',   name: 'Sonde température PT100',     category: 'sensor',  unit_price: 15000, stock_qty: 7 },
  { id: 'p4', reference: 'FLT-HY10',   name: 'Filtre hydraulique HY-10',    category: 'filter',  unit_price: 6200,  stock_qty: 0 },
  { id: 'p5', reference: 'JNT-HYD-KIT', name: 'Kit joints hydrauliques',     category: 'seal',    unit_price: 3800,  stock_qty: 5 },
];

export const partRequests: SparePartRequest[] = [
  { id: 'r1',  failure_id: 'f2',  spare_part_id: 'p2', quantity: 1, urgency: 'blocking', status: 'delivered',  created_at: daysAgo(60) },
  { id: 'r2',  failure_id: 'f4',  spare_part_id: 'p4', quantity: 2, urgency: 'urgent',   status: 'sourcing',   created_at: daysAgo(19) },
  { id: 'r3',  failure_id: 'f1',  spare_part_id: 'p1', quantity: 4, urgency: 'normal',   status: 'delivered',  created_at: daysAgo(95) },
  { id: 'r4',  failure_id: 'f12', spare_part_id: 'p1', quantity: 2, urgency: 'urgent',   status: 'delivered',  created_at: daysAgo(168) },
  { id: 'r5',  failure_id: 'f19', spare_part_id: 'p5', quantity: 3, urgency: 'blocking', status: 'delivered',  created_at: daysAgo(62) },
  { id: 'r6',  failure_id: 'f13', spare_part_id: 'p3', quantity: 2, urgency: 'urgent',   status: 'delivered',  created_at: daysAgo(148) },
  { id: 'r7',  failure_id: 'f18', spare_part_id: 'p1', quantity: 3, urgency: 'urgent',   status: 'delivered',  created_at: daysAgo(78) },
  { id: 'r8',  failure_id: 'f22', spare_part_id: 'p2', quantity: 1, urgency: 'normal',   status: 'delivered',  created_at: daysAgo(38) },
  { id: 'r9',  failure_id: 'f16', spare_part_id: 'p5', quantity: 2, urgency: 'normal',   status: 'delivered',  created_at: daysAgo(105) },
  { id: 'r10', failure_id: 'f3',  spare_part_id: 'p3', quantity: 1, urgency: 'urgent',   status: 'sourcing',   created_at: daysAgo(34) },
];

export const WORKFLOW_STEP_NAMES = [
  'Soumis', 'En révision', 'Inspection', 'Analyse visuelle',
  'Revue ingénierie', 'Fabrication', 'Contrôle qualité',
  'Expédition', 'Livré', 'Clôturé',
] as const;

export const INITIAL_WORKFLOW_PROGRESS: Record<string, number> = {
  f1: 10, f2: 10, f3: 5, f4: 3, f5: 10, f6: 4,
  f7: 10, f8: 10, f9: 10, f10: 10, f11: 10, f12: 10,
  f13: 10, f14: 10, f15: 10, f16: 10, f17: 10, f18: 10,
  f19: 10, f20: 10, f21: 10, f22: 10,
};

export function workflowFor(failureId: string, progress?: Record<string, number>): WorkflowStep[] {
  const prog = progress ?? INITIAL_WORKFLOW_PROGRESS;
  const active = prog[failureId] ?? 1;
  return WORKFLOW_STEP_NAMES.map((step_name, i) => ({
    id: `${failureId}-s${i + 1}`,
    failure_id: failureId,
    step_order: i + 1,
    step_name,
    status: i + 1 < active ? 'done' : i + 1 === active ? 'active' : 'pending',
  }));
}

export const equipmentById = (id: string) => equipments.find((e) => e.id === id);
export const companyById   = (id: string) => companies.find((c) => c.id === id);
export const partById      = (id?: string) => spareParts.find((p) => p.id === id);

export function equipmentStatus(equipmentId: string, allFailures = failures) {
  const active = allFailures.filter(
    (f) => f.equipment_id === equipmentId && f.status !== 'resolved' && f.status !== 'closed'
  );
  if (active.some((f) => f.severity === 'critical')) return 'critical'    as const;
  if (active.some((f) => f.severity === 'high'))     return 'maintenance' as const;
  if (active.length > 0)                             return 'watch'       as const;
  return 'operational' as const;
}

export const STATUS_LABELS = {
  operational: 'Opérationnel',
  watch:       'Surveillance',
  maintenance: 'Maintenance requise',
  critical:    'Critique',
} as const;

export const STATUS_COLORS = {
  operational: 'text-ok  border-ok/30  bg-ok/8',
  watch:       'text-info border-info/30 bg-info/8',
  maintenance: 'text-warn border-warn/30 bg-warn/8',
  critical:    'text-crit border-crit/30 bg-crit/8',
} as const;
