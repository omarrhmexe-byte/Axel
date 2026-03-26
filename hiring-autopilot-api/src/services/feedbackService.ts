import { supabase } from '../config/supabase';
import { auditLog } from './auditService';

export interface FeedbackEvent {
  candidate_id: string;
  role_id: string;
  pipeline_run_id?: string;
  event_type: string;
  data?: Record<string, unknown>;
  actor?: string;
}

/**
 * Record a hiring manager / recruiter / AI feedback event.
 * When event_type is 'advance' or 'reject', also updates the candidate_insights status.
 */
export async function recordFeedback(event: FeedbackEvent): Promise<void> {
  const { candidate_id, role_id, pipeline_run_id, event_type, data, actor = 'recruiter' } = event;

  const { error } = await supabase.from('feedback_events').insert({
    candidate_id,
    role_id,
    pipeline_run_id: pipeline_run_id ?? null,
    event_type,
    data: data ?? {},
    actor,
  });

  if (error) throw new Error(`Failed to record feedback: ${error.message}`);

  // Update candidate_insights status for advance/reject actions
  if (event_type === 'advance' || event_type === 'reject') {
    const status = event_type === 'advance' ? 'advanced' : 'rejected';
    await supabase
      .from('candidate_insights')
      .update({ status })
      .eq('candidate_id', candidate_id)
      .eq('role_id', role_id);
  }

  // Audit trail
  await auditLog(
    `feedback_${event_type}`,
    'candidate_insight',
    candidate_id,
    { role_id, pipeline_run_id, actor }
  );
}
