import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: [], source: 'demo' });
  const { data, error } = await sb
    .from('part_request_events')
    .select('*')
    .eq('part_request_id', params.id)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, source: 'db' });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), part_request_id: params.id, ...body, created_at: new Date().toISOString() }, source: 'demo' },
      { status: 201 },
    );
  }

  const payload = {
    part_request_id: params.id,
    event_type: body.event_type || 'status_changed',
    from_status: body.from_status || null,
    to_status: body.to_status || null,
    note: body.note || null,
    actor_id: body.actor_id || null,
  };
  const { data, error } = await sb.from('part_request_events').insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, source: 'db' }, { status: 201 });
}
