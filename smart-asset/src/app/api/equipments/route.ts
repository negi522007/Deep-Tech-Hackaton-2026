import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { equipments as sample } from '@/lib/sample-data';

// GET /api/equipments  -> list equipments
export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: sample, source: 'demo' });
  const { data, error } = await sb.from('equipments').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, source: 'db' });
}

// POST /api/equipments  -> create equipment
export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: { id: crypto.randomUUID(), ...body }, source: 'demo' }, { status: 201 });
  const { data, error } = await sb.from('equipments').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, source: 'db' }, { status: 201 });
}
