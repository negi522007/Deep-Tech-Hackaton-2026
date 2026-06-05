import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: { id: params.id, ...body }, source: 'demo' });

  const { data: before } = await sb.from('spare_part_requests').select('status').eq('id', params.id).maybeSingle();
  const { data, error } = await sb.from('spare_part_requests').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.status && before?.status !== body.status) {
    await sb.from('part_request_events').insert({
      part_request_id: params.id,
      event_type: 'status_changed',
      from_status: before?.status || null,
      to_status: body.status,
      note: body.note || null,
      actor_id: body.actor_id || null,
    });
  }
  return NextResponse.json({ data, source: 'db' });
}
