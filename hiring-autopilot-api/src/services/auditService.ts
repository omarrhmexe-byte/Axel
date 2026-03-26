import { supabase } from '../config/supabase';

/**
 * Fire-and-forget audit log entry.
 * Never throws — audit failures must not break the pipeline.
 */
export async function auditLog(
  action: string,
  entityType: string,
  entityId: string,
  data?: Record<string, unknown>,
  actor = 'system'
): Promise<void> {
  supabase
    .from('audit_log')
    .insert({ action, entity_type: entityType, entity_id: entityId, data: data ?? {}, actor })
    .then(({ error }) => {
      if (error) {
        // Intentionally silent — audit must never cascade failures
      }
    });
}
