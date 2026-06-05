import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { workflowFor } from '@/lib/sample-data';

const WORKFLOW_STEPS = ['Soumis', 'Analyse', 'Inspection', 'Validation', 'Fabrication/Sourcing', 'Livraison', 'Clôture'];

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: workflowFor(params.id), source: 'demo' });
  const { data, error } = await sb
    .from('workflow_steps')
    .select('*')
    .eq('failure_id', params.id)
    .order('step_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, source: 'db' });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = getSupabaseServer();
  const body = await req.json();
  const nextStep = Number(body?.next_step_order);
  if (!nextStep || nextStep < 1 || nextStep > 7) {
    return NextResponse.json({ error: 'next_step_order must be between 1 and 7' }, { status: 400 });
  }
  if (!sb) {
    return NextResponse.json({
      data: WORKFLOW_STEPS.map((step_name, i) => ({
        id: `${params.id}-${i + 1}`,
        failure_id: params.id,
        step_order: i + 1,
        step_name,
        status: i + 1 < nextStep ? 'done' : i + 1 === nextStep ? 'active' : 'pending',
      })),
      source: 'demo',
    });
  }

  const { error: upsertError } = await sb.from('workflow_steps').upsert(
    WORKFLOW_STEPS.map((step_name, i) => ({
      failure_id: params.id,
      step_order: i + 1,
      step_name,
      status: i + 1 < nextStep ? 'done' : i + 1 === nextStep ? 'active' : 'pending',
    })),
    { onConflict: 'failure_id,step_order' },
  );
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 400 });

  const failureStatus =
    nextStep >= 7 ? 'resolved' :
    nextStep >= 5 ? 'in_repair' :
    nextStep >= 2 ? 'diagnosing' : 'reported';
  await sb.from('failures').update({ status: failureStatus }).eq('id', params.id);

  const { data, error } = await sb
    .from('workflow_steps')
    .select('*')
    .eq('failure_id', params.id)
    .order('step_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, source: 'db' });
}
