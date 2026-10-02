import { diagnoseDamage } from '@/lib/ai/diagnose';
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, failureId } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64' },
        { status: 400 }
      );
    }

    // Call Claude diagnosis
    const diagnosis = await diagnoseDamage(imageBase64);

    // Write to ai_diagnoses table
    const { data, error } = await supabaseAdmin
      .from('ai_diagnoses')
      .insert({
        failure_id: failureId,
        model: 'claude-3-5-sonnet',
        defect_label: diagnosis.defect_label,
        failure_category_id: null,
        severity_estimate: diagnosis.severity,
        confidence: diagnosis.confidence,
        recommended_part_text: diagnosis.recommended_part,
        raw_response: diagnosis,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save diagnosis' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Diagnosis error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Diagnosis failed' },
      { status: 500 }
    );
  }
}
