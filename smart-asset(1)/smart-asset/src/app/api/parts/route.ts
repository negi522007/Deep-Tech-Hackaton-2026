import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { partRequests as sample } from '@/lib/sample-data';

// GET /api/parts  -> list spare part requests
export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: sample, source: 'demo' });
  const { data, error } = await sb
    .from('spare_part_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, source: 'db' });
}

// POST /api/parts  -> create a spare part request linked to a failure
export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), status: 'requested', ...body }, source: 'demo' },
      { status: 201 },
    );
  }
  const payload = {
    failure_id: body.failure_id,
    spare_part_id: body.spare_part_id || null,
    company_id: body.company_id,
    requested_by: body.requested_by || null,
    quantity: body.quantity || 1,
    urgency: body.urgency || 'normal',
    status: body.status || 'requested',
  };
  const { data, error } = await sb.from('spare_part_requests').insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await sb.from('part_request_events').insert({
    part_request_id: data.id,
    event_type: 'requested',
    to_status: data.status,
    note: body.note || null,
    actor_id: body.requested_by || null,
  });
  return NextResponse.json({ data, source: 'db' }, { status: 201 });
}
