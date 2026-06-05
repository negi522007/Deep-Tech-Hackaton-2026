import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: { id: params.id, ...body }, source: 'demo' });
  const { data, error } = await sb.from('failures').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, source: 'db' });
}
