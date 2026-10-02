import type { ReactNode } from "react";

export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className="pill" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
      <span className="dot" style={{ background: color }} />{label}
    </span>
  );
}

export function Stat({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: string; icon?: ReactNode }) {
  return (
    <div className="card stat reveal">
      <div className="stat-top"><span className="label">{label}</span>{icon}</div>
      <div className="stat-val mono">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function Reveal({ children, className = "", delay }: { children: ReactNode; className?: string; delay?: string }) {
  return <div className={`reveal ${className}`} style={delay ? { animationDelay: delay } : undefined}>{children}</div>;
}
