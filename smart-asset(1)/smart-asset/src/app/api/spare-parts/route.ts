import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { spareParts as sample } from '@/lib/sample-data';

export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) return NextResponse.json({ data: sample, source: 'demo' });
  const { data, error } = await sb.from('spare_parts').select('*').order('reference', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, source: 'db' });
}
