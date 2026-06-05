import {
  Company, Equipment, Failure, SparePart, SparePartRequest, WorkflowStep,
} from './types';

// In-memory demo dataset. Used when Supabase env vars are absent so the UI,
// dashboards and demo flow work with zero backend setup.

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
  { id: 'f1', equipment_id: 'e1', company_id: 'c1', title: 'Roulement bruyant', category: 'mechanical', severity: 'high', status: 'resolved', reported_at: daysAgo(95), resolved_at: daysAgo(94) },
  { id: 'f2', equipment_id: 'e1', company_id: 'c1', title: 'Courroie cassée', category: 'mechanical', severity: 'critical', status: 'resolved', reported_at: daysAgo(60), resolved_at: daysAgo(59) },
  { id: 'f3', equipment_id: 'e2', company_id: 'c1', title: 'Surchauffe moteur', category: 'electrical', severity: 'high', status: 'in_repair', reported_at: daysAgo(35), resolved_at: null },
  { id: 'f4', equipment_id: 'e3', company_id: 'c2', title: 'Fuite hydraulique', category: 'hydraulic', severity: 'critical', status: 'reported', reported_at: daysAgo(20), resolved_at: null },
  { id: 'f5', equipment_id: 'e3', company_id: 'c2', title: 'Capteur HS', category: 'electrical', severity: 'medium', status: 'resolved', reported_at: daysAgo(12), resolved_at: daysAgo(11) },
  { id: 'f6', equipment_id: 'e4', company_id: 'c3', title: 'Vibration anormale', category: 'mechanical', severity: 'medium', status: 'diagnosing', reported_at: daysAgo(5), resolved_at: null },
];

export const spareParts: SparePart[] = [
  { id: 'p1', reference: 'BRG-6204', name: 'Roulement 6204-2RS', category: 'bearing', unit_price: 4500, stock_qty: 12 },
  { id: 'p2', reference: 'BLT-A45', name: 'Courroie trapézoïdale A45', category: 'belt', unit_price: 8000, stock_qty: 3 },
  { id: 'p3', reference: 'SEN-PT100', name: 'Sonde température PT100', category: 'sensor', unit_price: 15000, stock_qty: 7 },
  { id: 'p4', reference: 'FLT-HY10', name: 'Filtre hydraulique HY-10', category: 'filter', unit_price: 6200, stock_qty: 0 },
];

export const partRequests: SparePartRequest[] = [
  { id: 'r1', failure_id: 'f2', spare_part_id: 'p2', quantity: 1, urgency: 'blocking', status: 'delivered', created_at: daysAgo(60) },
  { id: 'r2', failure_id: 'f4', spare_part_id: 'p4', quantity: 2, urgency: 'urgent', status: 'sourcing', created_at: daysAgo(19) },
  { id: 'r3', failure_id: 'f1', spare_part_id: 'p1', quantity: 4, urgency: 'normal', status: 'delivered', created_at: daysAgo(95) },
];

export function workflowFor(failureId: string): WorkflowStep[] {
  const names = ['Soumis', 'Analyse', 'Inspection', 'Validation', 'Fabrication/Sourcing', 'Livraison', 'Clôture'];
  // Mark progress deterministically per failure for the demo
  const progress: Record<string, number> = { f1: 7, f2: 7, f3: 4, f4: 2, f5: 7, f6: 3 };
  const done = progress[failureId] ?? 1;
  return names.map((step_name, i) => ({
    id: `${failureId}-s${i + 1}`,
    failure_id: failureId,
    step_order: i + 1,
    step_name,
    status: i + 1 < done ? 'done' : i + 1 === done ? 'active' : 'pending',
  }));
}

// Helpers used by dashboards
export const equipmentById = (id: string) => equipments.find((e) => e.id === id);
export const companyById = (id: string) => companies.find((c) => c.id === id);
export const partById = (id?: string) => spareParts.find((p) => p.id === id);
