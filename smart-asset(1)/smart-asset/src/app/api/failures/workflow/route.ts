import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { workflowFor } from '@/lib/sample-data';

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids') || '';
  const ids = idsParam.split(',').map((x) => x.trim()).filter(Boolean);
  if (ids.length === 0) return NextResponse.json({ data: {}, source: 'demo' });

  const sb = getSupabaseServer();
  if (!sb) {
    const data: Record<string, ReturnType<typeof workflowFor>> = {};
    ids.forEach((id) => { data[id] = workflowFor(id); });
    return NextResponse.json({ data, source: 'demo' });
  }

  const { data, error } = await sb
    .from('workflow_steps')
    .select('*')
    .in('failure_id', ids)
    .order('step_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const grouped: Record<string, any[]> = {};
  (data || []).forEach((row) => {
    if (!grouped[row.failure_id]) grouped[row.failure_id] = [];
    grouped[row.failure_id].push(row);
  });
  return NextResponse.json({ data: grouped, source: 'db' });
}
