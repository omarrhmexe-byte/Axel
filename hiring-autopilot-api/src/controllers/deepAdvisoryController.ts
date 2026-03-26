/**
 * deepAdvisoryController.ts
 * Handles POST /deep-advisory
 * Returns an advisory enriched with Manus research (if available).
 */

import type { Request, Response } from 'express';
import { supabase }               from '../config/supabase';
import { fastAdvisory, deepAdvisory } from '../services/deepAdvisoryService';
import { isManusAvailable }       from '../services/manusService';

export async function handleDeepAdvisory(req: Request, res: Response) {
  const { role_id, candidate_id, mode = 'deep' } = req.body as {
    role_id:      string;
    candidate_id: string;
    mode?:        'fast' | 'deep';
  };

  // ── Load role ────────────────────────────────────────────────────────────────
  const { data: role, error: roleErr } = await supabase
    .from('roles')
    .select('id, company, intelligence')
    .eq('id', role_id)
    .maybeSingle();

  if (roleErr || !role) {
    res.status(404).json({ error: 'Role not found', role_id });
    return;
  }

  // ── Load candidate insight ───────────────────────────────────────────────────
  const { data: insight, error: insightErr } = await supabase
    .from('candidate_insights')
    .select('*')
    .eq('role_id', role_id)
    .eq('candidate_id', candidate_id)
    .maybeSingle();

  if (insightErr || !insight) {
    res.status(404).json({
      error: 'Candidate insight not found. Run the pipeline first.',
      role_id,
      candidate_id,
    });
    return;
  }

  const roleIntelligence = role.intelligence;

  try {
    const effectiveMode = mode === 'deep' && isManusAvailable() ? 'deep' : 'fast';

    const result = effectiveMode === 'deep'
      ? await deepAdvisory(insight, roleIntelligence, role_id, role.company)
      : await fastAdvisory(insight, roleIntelligence);

    // Persist enriched advisory back to candidate_insights
    await supabase
      .from('candidate_insights')
      .update({ advisory: result.advisory })
      .eq('candidate_id', candidate_id)
      .eq('role_id', role_id);

    res.json({
      candidate_id,
      role_id,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Advisory generation failed';
    res.status(500).json({ error: message });
  }
}
