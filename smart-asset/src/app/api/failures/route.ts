import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { failures as sample } from '@/lib/sample-data';

// GET /api/failures
export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: sample, source: 'demo' });
  const { data, error } = await sb.from('failures').select('*').order('reported_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, source: 'db' });
}

// POST /api/failures  -> create failure + seed 7 workflow steps
export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), status: 'reported', ...body }, source: 'demo' },
      { status: 201 },
    );
  }
  const { data, error } = await sb.from('failures').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const steps = ['Soumis', 'Analyse', 'Inspection', 'Validation', 'Fabrication/Sourcing', 'Livraison', 'Clôture']
    .map((step_name, i) => ({
      failure_id: data.id,
      step_order: i + 1,
      step_name,
      status: i === 0 ? 'active' : 'pending',
    }));
  await sb.from('workflow_steps').insert(steps);

  return NextResponse.json({ data, source: 'db' }, { status: 201 });
}
