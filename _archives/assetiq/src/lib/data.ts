import type { Equipment, PartRequest, Notif, Diagnosis, EquipmentStatus, Urgency, Severity } from "./types";

export const STAGES = ["Soumis", "Analyse", "Inspection", "Validation", "Fabrication", "Livraison", "Clôture"];

export const STATUS: Record<EquipmentStatus, { l: string; c: string }> = {
  operational: { l: "Opérationnel", c: "var(--ok)" },
  degraded: { l: "Dégradé", c: "var(--warn)" },
  down: { l: "En panne", c: "var(--danger)" },
  maintenance: { l: "Maintenance", c: "var(--info)" },
};
export const URGENCY: Record<Urgency, { l: string; c: string }> = {
  low: { l: "Faible", c: "var(--info)" }, medium: { l: "Moyenne", c: "var(--warn)" },
  high: { l: "Haute", c: "var(--danger)" }, urgent: { l: "Urgente", c: "var(--danger)" },
};
export const SEV: Record<Severity, { l: string; c: string }> = {
  low: { l: "Faible", c: "var(--info)" }, medium: { l: "Moyenne", c: "var(--warn)" },
  high: { l: "Haute", c: "var(--danger)" }, critical: { l: "Critique", c: "var(--danger)" },
};

export const FAILURE_CATEGORIES = ["Roulement", "Surchauffe", "Fuite", "Vibration anormale", "Défaut électrique", "Usure courroie"];
export const PARTS = [
  "Roulement SKF 6205-2RS", "Courroie trapézoïdale B-50", "Garniture mécanique D-40",
  "Carte de commande PLC-12", "Filtre à air haute capacité", "Joint d'étanchéité Viton",
];

// Diagnostic IA simulé (fallback déterministe quand l'API n'a pas de clé)
export const DIAGNOSIS_MAP: Record<string, Diagnosis> = {
  "Roulement": { defect: "Roulement principal grippé", part: "Roulement SKF 6205-2RS", severity: "critical", conf: 0.93 },
  "Surchauffe": { defect: "Surchauffe paliers — lubrification insuffisante", part: "Garniture mécanique D-40", severity: "high", conf: 0.88 },
  "Fuite": { defect: "Fuite au niveau de la garniture", part: "Joint d'étanchéité Viton", severity: "medium", conf: 0.84 },
  "Vibration anormale": { defect: "Balourd d'arbre / désalignement", part: "Roulement SKF 6205-2RS", severity: "high", conf: 0.79 },
  "Défaut électrique": { defect: "Carte de commande défaillante", part: "Carte de commande PLC-12", severity: "high", conf: 0.86 },
  "Usure courroie": { defect: "Courroie fissurée — usure avancée", part: "Courroie trapézoïdale B-50", severity: "medium", conf: 0.9 },
};

export const SEED_EQUIPMENT: Equipment[] = [
  { id: "EQ-2041", name: "Compresseur d'air AX-200", manufacturer: "Atlas Copco", model: "GA-22", serial: "AX200-77431", category: "Air comprimé", status: "down", failures: 7, uptime: 91, company: "Cimenterie du Littoral" },
  { id: "EQ-1190", name: "Moteur électrique ME-55", manufacturer: "Siemens", model: "1LE1", serial: "ME55-22019", category: "Entraînement", status: "operational", failures: 2, uptime: 99, company: "Cimenterie du Littoral" },
  { id: "EQ-3320", name: "Pompe centrifuge PC-12", manufacturer: "Grundfos", model: "NB-65", serial: "PC12-55028", category: "Hydraulique", status: "degraded", failures: 4, uptime: 96, company: "Textile Sahel SA" },
  { id: "EQ-0875", name: "Convoyeur à bande CV-08", manufacturer: "Habasit", model: "TM-60", serial: "CV08-10337", category: "Manutention", status: "operational", failures: 1, uptime: 98, company: "Embouteillage Niger" },
  { id: "EQ-5567", name: "Groupe électrogène GE-400", manufacturer: "Caterpillar", model: "C15", serial: "GE400-90112", category: "Énergie", status: "maintenance", failures: 5, uptime: 88, company: "Embouteillage Niger" },
  { id: "EQ-4408", name: "Broyeur à marteaux BR-30", manufacturer: "Metso", model: "HM-30", serial: "BR30-44210", category: "Process", status: "operational", failures: 3, uptime: 95, company: "Cimenterie du Littoral" },
];

export const SEED_REQUESTS: PartRequest[] = [
  { id: "PR-7781", equipment: "Compresseur d'air AX-200", part: "Roulement SKF 6205-2RS", urgency: "high", stage: 4, fromAI: true, createdH: 28 },
  { id: "PR-7765", equipment: "Pompe centrifuge PC-12", part: "Garniture mécanique D-40", urgency: "medium", stage: 5, fromAI: false, createdH: 51 },
  { id: "PR-7740", equipment: "Groupe électrogène GE-400", part: "Filtre à air haute capacité", urgency: "low", stage: 2, fromAI: true, createdH: 12 },
  { id: "PR-7712", equipment: "Convoyeur à bande CV-08", part: "Courroie trapézoïdale B-50", urgency: "medium", stage: 6, fromAI: false, createdH: 74 },
];

export const SEED_NOTIFS: Notif[] = [
  { id: 1, text: "PR-7781 passée en Validation", time: "il y a 12 min", unread: true },
  { id: 2, text: "Nouvelle panne déclarée — Compresseur AX-200", time: "il y a 2 h", unread: true },
  { id: 3, text: "PR-7712 expédiée (Livraison)", time: "il y a 5 h", unread: false },
];
