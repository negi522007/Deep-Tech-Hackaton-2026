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
  const { data, error } = await sb.from('spare_part_requests').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, source: 'db' }, { status: 201 });
}
