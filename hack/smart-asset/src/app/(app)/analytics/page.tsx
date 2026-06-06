'use client';
import { PageHeader } from '@/components/ui';
import { useStore } from '@/lib/store';
import { companies, partById } from '@/lib/sample-data';
import { AlertTriangle, Clock, TrendingUp, Zap } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

const AMBER  = '#FFB22E';
const ACCENT = '#FF6A1A';
const STEEL  = '#8A99AB';
const PIE    = ['#FFB22E', '#36D399', '#F8627A', '#60A5FA', '#A78BFA'];

const WORKFLOW_STEPS = [
  { step: 'Diagnostic',    hours: 1.5,  highlight: false },
  { step: 'Décision',      hours: 0.5,  highlight: false },
  { step: 'Revue ing.',    hours: 2.0,  highlight: false },
  { step: 'Sourcing',      hours: 96.5, highlight: true  },
  { step: 'Fabrication',   hours: 3.0,  highlight: false },
  { step: 'QC',            hours: 1.0,  highlight: false },
  { step: 'Livraison',     hours: 0.5,  highlight: false },
];
const TOTAL_HOURS = WORKFLOW_STEPS.reduce((s, w) => s + w.hours, 0);

function tooltipStyle() {
  return { background: '#141A22', border: '1px solid #2A3543', borderRadius: 8, fontSize: 12, color: '#E6ECF2' };
}

export default function AnalyticsPage() {
  const { failures, partRequests, equipments } = useStore();

  // Top failing equipment
  const byEquip = equipments.map((e) => ({
    name: e.name.length > 14 ? e.name.slice(0, 12) + '…' : e.name,
    pannes: failures.filter((f) => f.equipment_id === e.id).length,
  })).sort((a, b) => b.pannes - a.pannes);

  // Top failure categories
  const catMap = new Map<string, number>();
  failures.forEach((f) => catMap.set(f.category, (catMap.get(f.category) || 0) + 1));
  const byCategory = [...catMap.entries()].map(([name, value]) => ({ name, value }));

  // Monthly trend — last 8 months
  const monthMap = new Map<string, number>();
  failures.forEach((f) => {
    const m = new Date(f.reported_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    monthMap.set(m, (monthMap.get(m) || 0) + 1);
  });
  // Sort chronologically
  const trend = [...monthMap.entries()]
    .map(([month, pannes]) => ({ month, pannes, _d: new Date(failures.find(f =>
      new Date(f.reported_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) === month
    )?.reported_at ?? '').getTime() }))
    .sort((a, b) => a._d - b._d)
    .map(({ month, pannes }) => ({ month, pannes }));

  // Top requested parts
  const partMap = new Map<string, number>();
  partRequests.forEach((r) => {
    const n = partById(r.spare_part_id)?.name ?? r.spare_part_id ?? 'Autre';
    partMap.set(n, (partMap.get(n) || 0) + r.quantity);
  });
  const byPart = [...partMap.entries()].map(([name, qte]) => ({ name, qte })).sort((a, b) => b.qte - a.qte);

  // By company
  const byCompany = companies.map((c) => ({
    name: c.name.split(' ')[0],
    pannes: failures.filter((f) => f.company_id === c.id).length,
  }));

  const mechRatio = Math.round((failures.filter(f => f.category === 'mechanical').length / Math.max(failures.length, 1)) * 100);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Intelligence de maintenance — tendances & insights" />

      {/* Insight critique */}
      <div className="mb-6 rounded-2xl border border-crit/30 bg-crit/5 p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-crit/10 text-crit">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-chalk">Le sourcing prend 96,5 heures — soit 91 % du délai total</p>
              <span className="badge badge-crit">Goulot critique</span>
            </div>
            <p className="text-sm text-steel">
              Le diagnostic, la revue ingénierie et la livraison ne totalisent que 8,5 h. Tout le reste se perd en recherche de fournisseurs.
              <strong className="text-chalk"> AssetIQ réduit ce délai de 60–80 % en pré-connectant l&apos;IA au catalogue pièces.</strong>
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex h-5 w-full overflow-hidden rounded-full">
                {WORKFLOW_STEPS.map((w, i) => (
                  <div key={i} title={`${w.step}: ${w.hours}h`}
                    style={{ width: `${(w.hours / TOTAL_HOURS) * 100}%`, background: w.highlight ? '#FF5C7A' : '#2A3543' }}
                    className="transition-all" />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {WORKFLOW_STEPS.map((w, i) => (
                  <span key={i} className={`flex items-center gap-1.5 text-[11px] ${w.highlight ? 'text-crit font-semibold' : 'text-steel'}`}>
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ background: w.highlight ? '#FF5C7A' : '#3D4F63' }} />
                    {w.step} <span className="tabular-nums">{w.hours}h</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Clock,         label: 'Délai moyen sourcing',   value: '96,5 h',      sub: 'sans AssetIQ',        color: 'text-crit' },
          { icon: Zap,           label: 'Réduction estimée',      value: '−72 %',       sub: 'avec IA catalogue',   color: 'text-ok' },
          { icon: TrendingUp,    label: 'Part des pannes méca.',  value: `${mechRatio} %`, sub: 'catégorie dominante', color: 'text-amber' },
          { icon: AlertTriangle, label: 'Pannes critiques',       value: `${failures.filter(f => f.severity === 'critical').length}`,
            sub: `sur ${failures.length} total`, color: 'text-crit' },
        ].map(({ icon: Icon, label, value, sub, color }, i) => (
          <div key={i} className="panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="label-mono">{label}</span>
            </div>
            <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-steel mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Tendance des pannes (8 mois)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AMBER} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2A3543" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={STEEL} fontSize={10} />
              <YAxis stroke={STEEL} fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} />
              <Area type="monotone" dataKey="pannes" stroke={AMBER} fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Pannes par catégorie">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {byCategory.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top équipements défaillants">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byEquip} margin={{ left: -20, right: 10 }}>
              <CartesianGrid stroke="#2A3543" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={STEEL} fontSize={10} />
              <YAxis stroke={STEEL} fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: '#1C2530' }} />
              <Bar dataKey="pannes" fill={AMBER} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Pièces les plus demandées">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPart} layout="vertical" margin={{ left: 40, right: 10 }}>
              <CartesianGrid stroke="#2A3543" strokeDasharray="3 3" />
              <XAxis type="number" stroke={STEEL} fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke={STEEL} fontSize={9} width={100} />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: '#1C2530' }} />
              <Bar dataKey="qte" fill="#36D399" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Répartition par entreprise" full>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCompany} margin={{ left: -20, right: 10 }}>
              <CartesianGrid stroke="#2A3543" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={STEEL} fontSize={11} />
              <YAxis stroke={STEEL} fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: '#1C2530' }} />
              <Bar dataKey="pannes" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`panel p-5 ${full ? 'lg:col-span-2' : ''}`}>
      <div className="label-mono mb-4">{title}</div>
      {children}
    </div>
  );
}
