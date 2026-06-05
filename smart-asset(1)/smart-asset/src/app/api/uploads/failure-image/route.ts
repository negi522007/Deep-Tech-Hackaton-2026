import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sb = getSupabaseServer();
  const failureId = body.failure_id;
  const angle = body.angle || null;
  const imageBase64 = body.imageBase64 as string | undefined;
  const imageMediaType = body.imageMediaType || 'image/jpeg';

  if (!failureId || !imageBase64) {
    return NextResponse.json({ error: 'failure_id and imageBase64 are required' }, { status: 400 });
  }

  if (!sb) {
    return NextResponse.json({
      data: {
        id: crypto.randomUUID(),
        failure_id: failureId,
        angle,
        storage_path: `demo/${failureId}/${Date.now()}.jpg`,
      },
      source: 'demo',
    }, { status: 201 });
  }

  const ext = imageMediaType.includes('png') ? 'png' : 'jpg';
  const path = `${failureId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(imageBase64, 'base64');

  const { error: uploadError } = await sb.storage.from('evidence').upload(path, bytes, {
    upsert: false,
    contentType: imageMediaType,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data, error } = await sb
    .from('failure_images')
    .insert({ failure_id: failureId, storage_path: path, angle })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data, source: 'db' }, { status: 201 });
}
