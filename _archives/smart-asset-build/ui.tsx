"use client";
import { motion } from "framer-motion";
import { item } from "./motion"; // ajuster le chemin selon ton arbo
import type { ReactNode } from "react";

/* Composants de référence. Ils fixent le niveau de finition.
   Toute l'équipe construit AVEC ceux-là — on ne re-style pas au cas par cas. */

/* ---------- Button ---------- */
type BtnProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
};
export function Button({ children, variant = "primary", onClick, type = "button" }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-sm font-semibold " +
    "transition-all duration-200 ease-out-quart active:scale-[.98] focus-visible:outline-none";
  const styles =
    variant === "primary"
      ? "bg-accent text-base hover:bg-accent-hover hover:shadow-glow"
      : "border border-hair text-ink hover:border-strong hover:bg-surface-2";
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-card border border-hair bg-surface-1 p-4 shadow-amb
                  [box-shadow:var(--inset-hi),var(--shadow-amb)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- StatusPill ---------- */
type Status = "operational" | "degraded" | "down" | "maintenance";
const STATUS: Record<Status, { label: string; color: string }> = {
  operational: { label: "Opérationnel", color: "var(--ok)" },
  degraded: { label: "Dégradé", color: "var(--warn)" },
  down: { label: "En panne", color: "var(--danger)" },
  maintenance: { label: "Maintenance", color: "var(--info)" },
};
export function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-pill px-2.5 py-1 text-xs font-semibold"
      style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 14%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

/* ---------- Reveal (wrapper d'apparition) ---------- */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
