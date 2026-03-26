import type { Request, Response } from 'express';
import { createPipelineRun, runPipeline } from '../services/hiringAgent';
import { getRoleById } from '../services/roleService';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import type { AlignmentGroup, CandidateCard, AdvisoryOutput } from '../types';

// ─── POST /run-pipeline ───────────────────────────────────────────────────────

export async function handleRunPipeline(req: Request, res: Response): Promise<void> {
  const { role_id } = req.body as { role_id: string };

  const run = await createPipelineRun(role_id);

  runPipeline(run.id, role_id).catch((err) => {
    logger.error('Unhandled pipeline crash', { run_id: run.id, err });
  });

  res.status(202).json({
    run_id: run.id,
    status: 'pending',
    message: 'Pipeline started. Poll GET /pipeline-run/:runId for status.',
  });
}

// ─── GET /pipeline-run/:runId ─────────────────────────────────────────────────

interface EnrichedCandidate {
  card: CandidateCard | null;
  advisory: AdvisoryOutput | null;
}

type GroupedPipeline = Record<Exclude<AlignmentGroup, 'no_fit'>, EnrichedCandidate[]>;

export async function handleGetPipelineRun(req: Request, res: Response): Promise<void> {
  const { runId } = req.params;

  const { data: run, error } = await supabase
    .from('pipeline_runs')
    .select('*')
    .eq('id', runId)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!run) {
    res.status(404).json({ error: `Pipeline run not found: ${runId}` });
    return;
  }

  // For in-progress or failed runs: return status only
  if (run.status !== 'completed') {
    res.json({
      status: run.status,
      headline: run.headline,
      system_log: run.steps,
      ...(run.error ? { error: run.error } : {}),
    });
    return;
  }

  // Completed run: return full enriched response scoped to this pipeline run
  const [roleResult, insightsResult] = await Promise.all([
    getRoleById(run.role_id).catch(() => null),
    supabase
      .from('candidate_insights')
      .select('candidate_id, alignment, confidence_layer, status, card, advisory')
      .eq('role_id', run.role_id)
      .not('alignment', 'is', null)
      .neq('alignment', 'no_fit')
      .eq('pipeline_run_id', runId),
  ]);

  const pipeline: GroupedPipeline = {
    strong_alignment: [],
    moderate_alignment: [],
    explore: [],
  };

  for (const row of insightsResult.data ?? []) {
    const group = row.alignment as Exclude<AlignmentGroup, 'no_fit'>;
    if (!(group in pipeline)) continue;

    pipeline[group].push({
      card: (row.card as CandidateCard) ?? null,
      advisory: (row.advisory as AdvisoryOutput) ?? null,
    });
  }

  res.json({
    status: run.status,
    role_intelligence: roleResult?.intelligence ?? null,
    pipeline,
    system_log: run.steps,
    headline: run.headline,
  });
}
