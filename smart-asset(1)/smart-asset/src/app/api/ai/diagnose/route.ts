import { NextRequest, NextResponse } from 'next/server';
import { runDiagnosis } from '@/lib/ai/diagnose';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/ai/diagnose
// body: { imageBase64?, imageMediaType?, equipmentName?, category?, description? }
// returns: AiDiagnosis (JSON)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await runDiagnosis(body);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'diagnose failed' }, { status: 500 });
  }
}
