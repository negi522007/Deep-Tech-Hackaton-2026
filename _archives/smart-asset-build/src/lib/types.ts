// Auth & User
export type UserRole = 'admin' | 'manager' | 'technician';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  org_id: string;
  created_at: string;
}

// Organizations
export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

// Equipment
export type EquipmentStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export interface Equipment {
  id: string;
  org_id: string;
  category_id?: string;
  name: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: string;
  status: EquipmentStatus;
  photo_url?: string;
  created_at: string;
}

// Failures
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type FailureStatus = 'open' | 'diagnosed' | 'resolved' | 'closed';

export interface Failure {
  id: string;
  org_id: string;
  equipment_id: string;
  reported_by?: string;
  failure_category_id?: string;
  description: string;
  severity: Severity;
  status: FailureStatus;
  created_at: string;
}

// Media
export type MediaKind = 'photo' | 'scan3d';

export interface MediaAsset {
  id: string;
  org_id: string;
  failure_id?: string;
  equipment_id?: string;
  storage_path: string;
  kind: MediaKind;
  uploaded_by?: string;
  created_at: string;
}

// AI Diagnoses
export interface AiDiagnosis {
  id: string;
  org_id: string;
  failure_id: string;
  media_id?: string;
  model: string;
  defect_label: string;
  failure_category_id?: string;
  severity_estimate: Severity;
  confidence: number;
  recommended_part_id?: string;
  recommended_part_text: string;
  raw_response: Record<string, unknown>;
  created_at: string;
}

// Part Requests
export type WorkflowStatus = 'submitted' | 'analysis' | 'inspection' | 'validation' | 'sourcing' | 'delivery' | 'closed';
export type RequestUrgency = 'low' | 'medium' | 'high' | 'urgent';

export interface PartRequest {
  id: string;
  org_id: string;
  equipment_id: string;
  failure_id?: string;
  part_id?: string;
  requested_by?: string;
  description: string;
  urgency: RequestUrgency;
  current_status: WorkflowStatus;
  from_ai: boolean;
  created_at: string;
}

export interface PartRequestEvent {
  id: string;
  part_request_id: string;
  from_status?: WorkflowStatus;
  to_status: WorkflowStatus;
  actor_id?: string;
  note?: string;
  created_at: string;
}

// Parts
export interface Part {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  typical_lead_time_days?: number;
}

// Notifications
export interface Notification {
  id: string;
  org_id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}
