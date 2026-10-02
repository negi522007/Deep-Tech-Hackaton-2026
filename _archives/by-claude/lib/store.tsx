"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { SEED_EQUIPMENT, SEED_REQUESTS, SEED_NOTIFS, STAGES } from "./data";
import type { Equipment, PartRequest, Notif, EquipmentStatus } from "./types";

interface StoreValue {
  equipment: Equipment[];
  requests: PartRequest[];
  notifications: Notif[];
  toast: string | null;
  addRequest: (r: PartRequest) => void;
  advance: (id: string) => void;
  setStatus: (id: string, status: EquipmentStatus) => void;
  notify: (text: string) => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(SEED_EQUIPMENT);
  const [requests, setRequests] = useState<PartRequest[]>(SEED_REQUESTS);
  const [notifications, setNotifications] = useState<Notif[]>(SEED_NOTIFS);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((text: string) => {
    setNotifications((n) => [{ id: Date.now(), text, time: "à l'instant", unread: true }, ...n]);
    setToast(text);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const addRequest = useCallback((r: PartRequest) => setRequests((rs) => [r, ...rs]), []);

  const advance = useCallback((id: string) => {
    setRequests((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const next = Math.min(6, r.stage + 1);
      return { ...r, stage: next };
    }));
    setRequests((rs) => {
      const r = rs.find((x) => x.id === id);
      if (r) notify(`${id} → ${STAGES[r.stage]}`);
      return rs;
    });
  }, [notify]);

  const setStatus = useCallback((id: string, status: EquipmentStatus) =>
    setEquipment((es) => es.map((e) => (e.id === id ? { ...e, status } : e))), []);

  return (
    <StoreCtx.Provider value={{ equipment, requests, notifications, toast, addRequest, advance, setStatus, notify }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
