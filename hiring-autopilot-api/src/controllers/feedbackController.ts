import type { Request, Response } from 'express';
import { recordFeedback } from '../services/feedbackService';

const VALID_EVENT_TYPES = new Set([
  'thumbs_up',
  'thumbs_down',
  'advance',
  'reject',
  'note',
  'question_added',
]);

export async function handleRecordFeedback(req: Request, res: Response): Promise<void> {
  const { candidate_id, role_id, event_type, pipeline_run_id, data, actor } = req.body ?? {};

  if (!candidate_id || typeof candidate_id !== 'string') {
    res.status(400).json({ error: 'candidate_id is required' });
    return;
  }
  if (!role_id || typeof role_id !== 'string') {
    res.status(400).json({ error: 'role_id is required' });
    return;
  }
  if (!event_type || !VALID_EVENT_TYPES.has(event_type)) {
    res.status(400).json({
      error: 'event_type is required',
      valid_types: [...VALID_EVENT_TYPES],
    });
    return;
  }

  await recordFeedback({ candidate_id, role_id, event_type, pipeline_run_id, data, actor });
  res.status(201).json({ ok: true, event_type, candidate_id });
}
