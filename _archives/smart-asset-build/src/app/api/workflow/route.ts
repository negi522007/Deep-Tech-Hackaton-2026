import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { WorkflowStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { partRequestId, newStatus, note, actorId } = await req.json();

    if (!partRequestId || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current status
    const { data: currentRequest, error: fetchError } = await supabaseAdmin
      .from('part_requests')
      .select('current_status')
      .eq('id', partRequestId)
      .single();

    if (fetchError || !currentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Create event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('part_request_events')
      .insert({
        part_request_id: partRequestId,
        from_status: currentRequest.current_status as WorkflowStatus,
        to_status: newStatus as WorkflowStatus,
        actor_id: actorId,
        note,
      })
      .select()
      .single();

    if (eventError) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    // Update request status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('part_requests')
      .update({ current_status: newStatus })
      .eq('id', partRequestId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event, updated });
  } catch (err) {
    console.error('Workflow error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Workflow update failed' },
      { status: 500 }
    );
  }
}
