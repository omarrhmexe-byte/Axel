/**
 * demoController.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Demo flow endpoints. Seed a role + candidates → run Axel → show results.
 *
 * Demo flow:
 *   1. POST /demo/seed       → creates role + inserts demo candidates
 *   2. POST /run-pipeline    → { role_id } → returns run_id
 *   3. GET  /pipeline-run/:runId → poll until completed
 *   4. POST /deep-advisory   → { role_id, candidate_id } → enriched brief
 *   5. POST /feedback        → { candidate_id, role_id, event_type: "advance" }
 *   6. GET  /demo/status     → current state of the demo role
 */

import type { Request, Response } from 'express';
import { supabase }               from '../config/supabase';
import { DEMO_ROLE, DEMO_CANDIDATES, DEMO_OUTREACH_PREVIEW } from '../config/demo';
import { createRole }             from '../services/roleService';
import { isManusAvailable }       from '../services/manusService';

// ── POST /demo/seed ───────────────────────────────────────────────────────────
export async function handleDemoSeed(req: Request, res: Response) {
  try {
    // 1. Create the demo role (calls Claude for role intelligence)
    const role = await createRole(DEMO_ROLE);

    // 2. Insert demo candidates
    const inserted: string[] = [];
    for (const candidate of DEMO_CANDIDATES) {
      const { data, error } = await supabase
        .from('candidates')
        .upsert(
          { ...candidate, source_id: candidate.name.toLowerCase().replace(/\s+/g, '-') },
          { onConflict: 'source,source_id', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      if (data) inserted.push(data.id);
      if (error) console.warn(`Demo seed: skipped ${candidate.name} — ${error.message}`);
    }

    res.status(201).json({
      message: 'Demo seeded. Now run the pipeline.',
      role_id:         role.id,
      company:         role.company,
      candidates_seeded: inserted.length,
      next_step: `POST /run-pipeline with { "role_id": "${role.id}" }`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Demo seed failed';
    res.status(500).json({ error: message });
  }
}

// ── GET /demo/status ──────────────────────────────────────────────────────────
export async function handleDemoStatus(req: Request, res: Response) {
  const { role_id } = req.query as { role_id?: string };

  if (!role_id) {
    res.status(400).json({ error: 'role_id query param required' });
    return;
  }

  // Latest pipeline run for this role
  const { data: run } = await supabase
    .from('pipeline_runs')
    .select('id, status, headline, candidates_sourced, candidates_analyzed, candidates_matched, steps, updated_at')
    .eq('role_id', role_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Candidates with alignment
  const { data: insights } = await supabase
    .from('candidate_insights')
    .select('candidate_id, alignment, status, card, advisory')
    .eq('role_id', role_id);

  // Research briefs
  const { data: briefs } = await supabase
    .from('company_research_briefs')
    .select('id, status, research_type, created_at')
    .eq('role_id', role_id);

  res.json({
    role_id,
    pipeline_run:       run ?? null,
    candidates:         insights ?? [],
    research_briefs:    briefs ?? [],
    manus_available:    isManusAvailable(),
    outreach_preview:   DEMO_OUTREACH_PREVIEW,
    demo_instructions: {
      step_1: 'POST /demo/seed — create role + seed candidates',
      step_2: `POST /run-pipeline — { "role_id": "${role_id}" }`,
      step_3: `GET /pipeline-run/:runId — poll until status=completed`,
      step_4: `POST /deep-advisory — { "role_id": "${role_id}", "candidate_id": "<id>", "mode": "deep" }`,
      step_5: `POST /feedback — { "role_id": "${role_id}", "candidate_id": "<id>", "event_type": "advance" }`,
    },
  });
}
