'use client';
import { PageHeader } from '@/components/ui';
import { failures, equipments, equipmentById, companies, partRequests, partById } from '@/lib/sample-data';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

const AMBER = '#FFB22E';
const STEEL = '#8A99AB';
const PIE = ['#FFB22E', '#36D399', '#F8627A', '#60A5FA', '#A78BFA'];

function tooltipStyle() {
  return { background: '#141A22', border: '1px solid #2A3543', borderRadius: 8, fontSize: 12, color: '#E6ECF2' };
}

export default function AnalyticsPage() {
  // Top failing equipment
  const byEquip = equipments.map((e) => ({
    name: e.name.length > 14 ? e.name.slice(0, 12) + '…' : e.name,
    pannes: failures.filter((f) => f.equipment_id === e.id).length,
  })).sort((a, b) => b.pannes - a.pannes);

  // Top failure categories
  const catMap = new Map<string, number>();
  failures.forEach((f) => catMap.set(f.category, (catMap.get(f.category) || 0) + 1));
  const byCategory = [...catMap.entries()].map(([name, value]) => ({ name, value }));

  // Monthly trend
  const monthMap = new Map<string, number>();
  failures.forEach((f) => {
    const m = new Date(f.reported_at).toLocaleDateString('fr-FR', { month: 'short' });
    monthMap.set(m, (monthMap.get(m) || 0) + 1);
  });
  const trend = [...monthMap.entries()].map(([month, pannes]) => ({ month, pannes }));

  // Top requested parts
  const partMap = new Map<string, number>();
  partRequests.forEach((r) => {
    const n = partById(r.spare_part_id)?.name ?? 'Autre';
    partMap.set(n, (partMap.get(n) || 0) + r.quantity);
  });
  const byPart = [...partMap.entries()].map(([name, qte]) => ({ name, qte })).sort((a, b) => b.qte - a.qte);

  // By company
  const byCompany = companies.map((c) => ({
    name: c.name.split(' ')[0],
    pannes: failures.filter((f) => f.company_id === c.id).length,
  }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Intelligence de maintenance — tendances & insights" />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Tendance des pannes">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AMBER} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2A3543" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={STEEL} fontSize={11} />
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
              <YAxis type="category" dataKey="name" stroke={STEEL} fontSize={10} width={90} />
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
