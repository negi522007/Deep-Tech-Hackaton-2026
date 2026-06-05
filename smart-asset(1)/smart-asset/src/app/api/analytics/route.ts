import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { companies, equipmentById, equipments, failures, partById, partRequests } from '@/lib/sample-data';

function demoAnalytics() {
  const kpis = {
    total_equipment: equipments.length,
    open_failures: failures.filter((f) => !['resolved', 'closed'].includes(f.status)).length,
    pending_parts: partRequests.filter((r) => !['delivered', 'cancelled'].includes(r.status)).length,
    avg_repair_hours: Math.round(
      failures
        .filter((f) => f.resolved_at)
        .reduce((acc, f) => acc + (new Date(f.resolved_at!).getTime() - new Date(f.reported_at).getTime()) / 36e5, 0) /
        Math.max(failures.filter((f) => f.resolved_at).length, 1),
    ),
  };

  const topFailingEquipment = equipments.map((e) => ({
    equipment_id: e.id,
    name: e.name,
    category: e.category,
    company: companies.find((c) => c.id === e.company_id)?.name || 'N/A',
    failure_count: failures.filter((f) => f.equipment_id === e.id).length,
    critical_count: failures.filter((f) => f.equipment_id === e.id && f.severity === 'critical').length,
  }));

  const monthlyTrendMap = new Map<string, { month: string; failures: number; resolved: number; avg_repair_hours: number }>();
  failures.forEach((f) => {
    const month = new Date(f.reported_at).toISOString().slice(0, 7) + '-01';
    const current = monthlyTrendMap.get(month) || { month, failures: 0, resolved: 0, avg_repair_hours: 0 };
    current.failures += 1;
    if (f.resolved_at) current.resolved += 1;
    monthlyTrendMap.set(month, current);
  });

  const partMap = new Map<string, { part_id: string; reference: string; name: string; total_requested: number; request_count: number }>();
  partRequests.forEach((r) => {
    const part = partById(r.spare_part_id);
    if (!part) return;
    const current = partMap.get(part.id) || {
      part_id: part.id,
      reference: part.reference,
      name: part.name,
      total_requested: 0,
      request_count: 0,
    };
    current.total_requested += r.quantity;
    current.request_count += 1;
    partMap.set(part.id, current);
  });

  return {
    kpis,
    topFailingEquipment,
    monthlyTrend: [...monthlyTrendMap.values()],
    topRequestedParts: [...partMap.values()],
    byCategory: [...new Map(failures.map((f) => [f.category, failures.filter((x) => x.category === f.category).length])).entries()]
      .map(([name, value]) => ({ category: name, total: value })),
    byCompany: companies.map((c) => ({ name: c.name, failure_count: failures.filter((f) => f.company_id === c.id).length })),
  };
}

export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: demoAnalytics(), source: 'demo' });

  const [kpisRes, equipRes, trendRes, partsRes, catRes, companyRes] = await Promise.all([
    sb.from('v_kpi_summary').select('*').limit(1).maybeSingle(),
    sb.from('v_top_failing_equipment').select('*'),
    sb.from('v_monthly_failure_trend').select('*').order('month', { ascending: true }),
    sb.from('v_top_requested_parts').select('*'),
    sb.from('v_top_failure_categories').select('*'),
    sb.from('v_company_breakdown').select('*'),
  ]);

  const error = kpisRes.error || equipRes.error || trendRes.error || partsRes.error || catRes.error || companyRes.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: {
      kpis: kpisRes.data,
      topFailingEquipment: equipRes.data || [],
      monthlyTrend: trendRes.data || [],
      topRequestedParts: partsRes.data || [],
      byCategory: catRes.data || [],
      byCompany: companyRes.data || [],
    },
    source: 'db',
  });
}
