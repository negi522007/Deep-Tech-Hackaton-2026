import { ReactNode } from 'react';
import { Severity, FailureStatus } from '@/lib/types';
import { AnimatedCounter } from './motion';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    low: 'text-steel border-steel/30 bg-steel/5',
    medium: 'text-warn border-warn/30 bg-warn/5',
    high: 'text-amber border-amber/40 bg-amber/5',
    critical: 'text-crit border-crit/40 bg-crit/10',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[severity]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: FailureStatus }) {
  const map: Record<FailureStatus, string> = {
    reported: 'text-warn', diagnosing: 'text-cyan', in_repair: 'text-ember',
    resolved: 'text-ok', closed: 'text-steel',
  };
  return <span className={`text-[12px] font-medium ${map[status]}`}>{status}</span>;
}

export function StatCard({ label, value, hint, accent = 'cyan' }:
  { label: string; value: number; hint?: string; accent?: 'cyan' | 'amber' | 'ok' | 'crit' }) {
  const ring: Record<string, string> = {
    cyan: 'before:bg-cyan/40', amber: 'before:bg-amber/40', ok: 'before:bg-ok/40', crit: 'before:bg-crit/40',
  };
  return (
    <div className={`glass glass-hover relative p-5 overflow-hidden before:absolute before:left-0 before:top-5 before:h-8 before:w-[3px] before:rounded-full ${ring[accent]}`}>
      <div className="label-mono pl-3">{label}</div>
      <div className="mt-2 pl-3 text-4xl font-semibold tracking-tight text-chalk">
        <AnimatedCounter to={value} />
      </div>
      {hint && <div className="mt-1 pl-3 text-xs text-steel">{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight gradient-text">{title}</h1>
        {subtitle && <p className="text-sm text-steel mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
