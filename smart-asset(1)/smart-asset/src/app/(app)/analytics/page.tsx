'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui';
import { failures, equipments, companies, partRequests, partById } from '@/lib/sample-data';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { apiGet } from '@/lib/http';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

const AMBER = '#FFB22E';
const STEEL = '#8A99AB';
const PIE = ['#FFB22E', '#36D399', '#F8627A', '#60A5FA', '#A78BFA'];

function tooltipStyle() {
  return { background: '#141A22', border: '1px solid #2A3543', borderRadius: 8, fontSize: 12, color: '#E6ECF2' };
}

function demoData() {
  const byEquip = equipments.map((e) => ({
    name: e.name.length > 14 ? e.name.slice(0, 12) + '…' : e.name,
    pannes: failures.filter((f) => f.equipment_id === e.id).length,
  })).sort((a, b) => b.pannes - a.pannes);

  const catMap = new Map<string, number>();
  failures.forEach((f) => catMap.set(f.category, (catMap.get(f.category) || 0) + 1));
  const byCategory = [...catMap.entries()].map(([name, value]) => ({ name, value }));

  const monthMap = new Map<string, number>();
  failures.forEach((f) => {
    const m = new Date(f.reported_at).toLocaleDateString('fr-FR', { month: 'short' });
    monthMap.set(m, (monthMap.get(m) || 0) + 1);
  });
  const trend = [...monthMap.entries()].map(([month, pannes]) => ({ month, pannes }));

  const partMap = new Map<string, number>();
  partRequests.forEach((r) => {
    const n = partById(r.spare_part_id)?.name ?? 'Autre';
    partMap.set(n, (partMap.get(n) || 0) + r.quantity);
  });
  const byPart = [...partMap.entries()].map(([name, qte]) => ({ name, qte })).sort((a, b) => b.qte - a.qte);

  const byCompany = companies.map((c) => ({
    name: c.name.split(' ')[0],
    pannes: failures.filter((f) => f.company_id === c.id).length,
  }));
  return { byEquip, byCategory, trend, byPart, byCompany };
}

interface AnalyticsResponse {
  kpis: {
    total_equipment: number;
    open_failures: number;
    pending_parts: number;
    avg_repair_hours: number;
  };
  topFailingEquipment: Array<{ equipment_id: string; name: string; failure_count: number }>;
  monthlyTrend: Array<{ month: string; failures: number }>;
  topRequestedParts: Array<{ part_id: string; name: string; total_requested: number }>;
  byCategory: Array<{ category: string; total: number }>;
  byCompany: Array<{ name: string; failure_count: number }>;
}

export default function AnalyticsPage() {
  const fallback = useMemo(() => demoData(), []);
  const [data, setData] = useState(fallback);

  const load = useCallback(async () => {
    const analytics = await apiGet<AnalyticsResponse | null>('/api/analytics', null);
    if (!analytics) return setData(fallback);
    setData({
      byEquip: (analytics.topFailingEquipment || []).map((e) => ({
        name: e.name.length > 14 ? e.name.slice(0, 12) + '…' : e.name,
        pannes: e.failure_count,
      })),
      byCategory: (analytics.byCategory || []).map((c) => ({ name: c.category, value: c.total })),
      trend: (analytics.monthlyTrend || []).map((m) => ({
        month: new Date(m.month).toLocaleDateString('fr-FR', { month: 'short' }),
        pannes: m.failures,
      })),
      byPart: (analytics.topRequestedParts || []).map((p) => ({ name: p.name, qte: p.total_requested })),
      byCompany: (analytics.byCompany || []).map((c) => ({ name: c.name.split(' ')[0], pannes: c.failure_count })),
    });
  }, [fallback]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel('analytics-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'failures' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spare_part_requests' }, load)
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [load]);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Intelligence de maintenance — tendances & insights" />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Tendance des pannes">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.trend} margin={{ left: -20, right: 10, top: 10 }}>
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
              <Pie data={data.byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.byCategory.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top équipements défaillants">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byEquip} margin={{ left: -20, right: 10 }}>
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
            <BarChart data={data.byPart} layout="vertical" margin={{ left: 40, right: 10 }}>
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
            <BarChart data={data.byCompany} margin={{ left: -20, right: 10 }}>
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
