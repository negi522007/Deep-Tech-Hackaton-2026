"use client";
import { useState, type ReactNode } from "react";
import { Bell, X, CheckCircle2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useStore } from "@/lib/store";

export function Shell({ children }: { children: ReactNode }) {
  const { notifications, toast } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="shell">
      <div className="grain" />
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div className="bc mono sm muted">ASSETIQ</div>
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
              <Bell size={18} strokeWidth={1.6} />{unread > 0 && <span className="badge">{unread}</span>}
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      {notifOpen && (
        <div className="notif-panel">
          <div className="np-head"><h3>Notifications</h3><button className="icon-btn" onClick={() => setNotifOpen(false)}><X size={16} /></button></div>
          {notifications.map((n) => (
            <div key={n.id} className={"np-item" + (n.unread ? " unread" : "")}><div>{n.text}</div><div className="muted sm">{n.time}</div></div>
          ))}
        </div>
      )}

      {toast && <div className="toast"><CheckCircle2 size={16} style={{ color: "var(--ok)" }} /> {toast}</div>}
    </div>
  );
}
