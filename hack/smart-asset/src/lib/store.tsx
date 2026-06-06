'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Equipment, Failure, SparePartRequest, Notification, Severity, PartUrgency, Submitter,
} from './types';
import {
  failures as SEED_FAILURES,
  equipments as SEED_EQUIPMENTS,
  partRequests as SEED_REQUESTS,
  INITIAL_WORKFLOW_PROGRESS,
  equipmentById as staticEquipmentById,
} from './sample-data';
import type { NotifyPayload } from '@/app/api/email/notify/route';

// Bump this when seed data changes to clear stale localStorage
const STORE_VERSION = 'v3';

function safeSave(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── State ────────────────────────────────────────────────────────────────────

interface StoreState {
  failures: Failure[];
  equipments: Equipment[];
  workflowProgress: Record<string, number>;
  partRequests: SparePartRequest[];
  notifications: Notification[];
}

interface StoreActions {
  addFailure: (data: {
    equipment_id: string;
    company_id: string;
    title: string;
    description?: string;
    category: string;
    severity: Severity;
    submitter?: Submitter;
    ai_diagnosis?: Failure['ai_diagnosis'];
  }) => string;
  addEquipment: (data: Omit<Equipment, 'id'>) => string;
  advanceWorkflow: (failureId: string) => void;
  addPartRequest: (data: {
    failure_id: string;
    spare_part_id?: string;
    part_name?: string;
    quantity: number;
    urgency: PartUrgency;
  }) => void;
  markAllRead: () => void;
  unreadCount: number;
  equipmentById: (id: string) => Equipment | undefined;
}

type Store = StoreState & StoreActions;

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  // Initialize from seed data (server-safe, no localStorage access)
  const [failures, setFailures]               = useState<Failure[]>(SEED_FAILURES);
  const [equipments, setEquipments]           = useState<Equipment[]>(SEED_EQUIPMENTS);
  const [workflowProgress, setWorkflowProgress] = useState<Record<string, number>>({ ...INITIAL_WORKFLOW_PROGRESS });
  const [partRequests, setPartRequests]       = useState<SparePartRequest[]>(SEED_REQUESTS);
  const [notifications, setNotifications]     = useState<Notification[]>([]);
  const [mounted, setMounted]                 = useState(false);

  // Hydrate from localStorage after first render (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const version = localStorage.getItem('assetiq_v');
      if (version === STORE_VERSION) {
        const f = localStorage.getItem('assetiq_f');
        const e = localStorage.getItem('assetiq_e');
        const w = localStorage.getItem('assetiq_w');
        const p = localStorage.getItem('assetiq_p');
        if (f) setFailures(JSON.parse(f));
        if (e) setEquipments(JSON.parse(e));
        if (w) setWorkflowProgress(JSON.parse(w));
        if (p) setPartRequests(JSON.parse(p));
      } else {
        // Version changed → clear stale data and use fresh seed
        ['assetiq_f', 'assetiq_e', 'assetiq_w', 'assetiq_p'].forEach(k => localStorage.removeItem(k));
        localStorage.setItem('assetiq_v', STORE_VERSION);
      }
    } catch {}
    setMounted(true);
  }, []);

  // Persist state to localStorage after changes (only post-mount)
  useEffect(() => { if (mounted) safeSave('assetiq_f', failures); },         [failures, mounted]);
  useEffect(() => { if (mounted) safeSave('assetiq_e', equipments); },       [equipments, mounted]);
  useEffect(() => { if (mounted) safeSave('assetiq_w', workflowProgress); }, [workflowProgress, mounted]);
  useEffect(() => { if (mounted) safeSave('assetiq_p', partRequests); },     [partRequests, mounted]);

  const push = useCallback((msg: string, type: Notification['type'], meta?: Partial<Notification>) => {
    setNotifications((prev) => [{
      id: `n-${Date.now()}`,
      type,
      message: msg,
      at: new Date().toISOString(),
      read: false,
      ...meta,
    }, ...prev]);
  }, []);

  const addFailure = useCallback((data: {
    equipment_id: string;
    company_id: string;
    title: string;
    description?: string;
    category: string;
    severity: Severity;
    submitter?: Submitter;
    ai_diagnosis?: Failure['ai_diagnosis'];
  }) => {
    const id = `f-${Date.now()}`;
    const failure: Failure = {
      ...data,
      id,
      status: 'reported',
      reported_at: new Date().toISOString(),
      resolved_at: null,
    };
    setFailures((prev) => [failure, ...prev]);
    setWorkflowProgress((prev) => ({ ...prev, [id]: 1 }));

    const who = data.submitter
      ? `${data.submitter.firstName} ${data.submitter.lastName} (${data.submitter.company})`
      : 'Technicien';
    push(`${who} — ${data.title}`, 'failure_created');

    if (data.submitter) {
      const eq = staticEquipmentById(data.equipment_id);
      const payload: NotifyPayload = {
        submitter: data.submitter,
        equipment: {
          name:          eq?.name ?? data.equipment_id,
          serial_number: eq?.serial_number ?? '—',
          location:      eq?.location ?? '—',
          category:      data.category,
        },
        failure: {
          title:       data.title,
          description: data.description ?? '',
          category:    data.category,
          severity:    data.severity,
          reported_at: failure.reported_at,
        },
        ai: data.ai_diagnosis ? {
          diagnosis:           data.ai_diagnosis.diagnosis,
          confidence:          data.ai_diagnosis.confidence,
          recommended_part:    data.ai_diagnosis.recommended_parts?.[0]?.name ?? '—',
          recommended_actions: data.ai_diagnosis.recommended_actions ?? [],
        } : null,
      };
      fetch('/api/email/notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }).catch(console.error);
    }

    return id;
  }, [push]);

  const addEquipment = useCallback((data: Omit<Equipment, 'id'>) => {
    const id = `e-${Date.now()}`;
    const equipment: Equipment = { ...data, id };
    setEquipments((prev) => [equipment, ...prev]);
    push(`Équipement ajouté : ${data.name}`, 'status_changed');
    return id;
  }, [push]);

  const advanceWorkflow = useCallback((failureId: string) => {
    setWorkflowProgress((prev) => {
      const current = prev[failureId] ?? 1;
      if (current >= 10) return prev;
      const next = current + 1;
      setFailures(prev2 => {
        const f = prev2.find(x => x.id === failureId);
        const label = f ? `"${f.title}"` : failureId;
        push(`Workflow avancé → étape ${next}/10 · ${label}`, 'step_advanced');
        return prev2;
      });
      return { ...prev, [failureId]: next };
    });
  }, [push]);

  const addPartRequest = useCallback((data: {
    failure_id: string;
    spare_part_id?: string;
    part_name?: string;
    quantity: number;
    urgency: PartUrgency;
  }) => {
    const req: SparePartRequest = {
      id: `r-${Date.now()}`,
      failure_id: data.failure_id,
      spare_part_id: data.spare_part_id,
      quantity: data.quantity,
      urgency: data.urgency,
      status: 'requested',
      created_at: new Date().toISOString(),
    };
    setPartRequests((prev) => [req, ...prev]);
    push(`Demande de pièce créée${data.part_name ? ` : ${data.part_name}` : ''}`, 'part_requested');
  }, [push]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const equipmentById = useCallback((id: string) => {
    return equipments.find(e => e.id === id) ?? staticEquipmentById(id);
  }, [equipments]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Ctx.Provider value={{
      failures, equipments, workflowProgress, partRequests, notifications,
      addFailure, addEquipment, advanceWorkflow, addPartRequest, markAllRead,
      unreadCount, equipmentById,
    }}>
      {children}
    </Ctx.Provider>
  );
}
