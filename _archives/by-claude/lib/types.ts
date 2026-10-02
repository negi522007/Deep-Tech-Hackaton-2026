export type EquipmentStatus = "operational" | "degraded" | "down" | "maintenance";
export type Severity = "low" | "medium" | "high" | "critical";
export type Urgency = "low" | "medium" | "high" | "urgent";

export interface Equipment {
  id: string; name: string; manufacturer: string; model: string; serial: string;
  category: string; status: EquipmentStatus; failures: number; uptime: number; company: string;
}
export interface PartRequest {
  id: string; equipment: string; part: string; urgency: Urgency;
  stage: number; fromAI: boolean; createdH: number;
}
export interface Notif { id: number; text: string; time: string; unread: boolean; }
export interface Diagnosis { defect: string; part: string; severity: Severity; conf: number; }
