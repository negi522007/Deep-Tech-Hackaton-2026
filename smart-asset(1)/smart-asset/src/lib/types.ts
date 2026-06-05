// Domain types — mirror database/schema.sql

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type FailureStatus = 'reported' | 'diagnosing' | 'in_repair' | 'resolved' | 'closed';
export type PartUrgency = 'normal' | 'urgent' | 'blocking';
export type RequestStatus =
  | 'requested' | 'approved' | 'sourcing' | 'shipped' | 'delivered' | 'cancelled';
export type StepStatus = 'pending' | 'active' | 'done' | 'skipped';

export interface Company {
  id: string;
  name: string;
  sector?: string;
}

export interface Equipment {
  id: string;
  company_id: string;
  name: string;
  category: string;
  serial_number: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: string;
  location?: string;
}

export interface Failure {
  id: string;
  equipment_id: string;
  company_id: string;
  title: string;
  description?: string;
  category: string;
  severity: Severity;
  status: FailureStatus;
  ai_diagnosis?: AiDiagnosis | null;
  reported_at: string;
  resolved_at?: string | null;
}

export interface SparePart {
  id: string;
  reference: string;
  name: string;
  category?: string;
  unit_price?: number;
  stock_qty: number;
}

export interface SparePartRequest {
  id: string;
  failure_id: string;
  spare_part_id?: string;
  quantity: number;
  urgency: PartUrgency;
  status: RequestStatus;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  failure_id: string;
  step_order: number;
  step_name: string;
  status: StepStatus;
  note?: string;
}

// Structured AI output (see lib/ai/diagnose.ts and docs/AI.md)
export interface AiDiagnosis {
  diagnosis: string;
  probable_causes: string[];
  severity: Severity;
  confidence: number; // 0..1
  recommended_parts: { reference: string; name: string; reason: string }[];
  recommended_actions: string[];
}

// Canonical repair workflow (module 5)
export const WORKFLOW_STEPS = [
  'Soumis',
  'Analyse',
  'Inspection',
  'Validation',
  'Fabrication/Sourcing',
  'Livraison',
  'Clôture',
] as const;
