import { supabase } from '../config/supabase';
import { getRoleById } from './roleService';
import { deriveSourcingStrategy } from './claudeService';
import { fetchCandidates } from './sourcingService';
import {
  upsertCandidate,
  analyzeCandidate,
  matchCandidate,
} from './candidateService';
import { enrichInsight } from './advisorService';
import { auditLog } from './auditService';
import { logger } from '../utils/logger';
import type {
  PipelineRun,
  WorkflowStep,
  WorkflowStepName,
  AlignmentGroup,
  NormalizedCandidate,
  CandidateProfile,
  CandidateInsight,
} from '../types';

// ─── Alignment counter ────────────────────────────────────────────────────────

type AlignmentCounts = Record<AlignmentGroup, number>;

function emptyAlignmentCounts(): AlignmentCounts {
  return { strong_alignment: 0, moderate_alignment: 0, explore: 0, no_fit: 0 };
}

function buildHeadline(sourced: number, counts: AlignmentCounts): string {
  const actionable = counts.strong_alignment + counts.moderate_alignment + counts.explore;
  return (
    `${sourced} candidates sourced · ` +
    `${counts.strong_alignment} strong · ` +
    `${counts.moderate_alignment} moderate · ` +
    `${counts.explore} explore · ` +
    `${counts.no_fit} no fit` +
    (actionable > 0 ? ` → ${actionable} worth reviewing` : '')
  );
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function createRun(roleId: string): Promise<PipelineRun> {
  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert({
      role_id: roleId,
      status: 'pending',
      headline: 'Pipeline queued',
      steps: [],
      candidates_sourced: 0,
      candidates_analyzed: 0,
      candidates_matched: 0,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create pipeline run: ${error.message}`);
  return data as PipelineRun;
}

async function appendStep(
  runId: string,
  name: WorkflowStepName,
  status: 'ok' | 'error',
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const step: WorkflowStep = {
    step: name,
    status,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  const { data: current } = await supabase
    .from('pipeline_runs')
    .select('steps')
    .eq('id', runId)
    .single();

  const steps: WorkflowStep[] = (current?.steps ?? []) as WorkflowStep[];
  steps.push(step);

  await supabase
    .from('pipeline_runs')
    .update({ steps, updated_at: new Date().toISOString() })
    .eq('id', runId);
}

async function updateRun(
  runId: string,
  patch: {
    status?: PipelineRun['status'];
    headline?: string;
    candidates_sourced?: number;
    candidates_analyzed?: number;
    candidates_matched?: number;
    error?: string;
  }
): Promise<void> {
  await supabase
    .from('pipeline_runs')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', runId);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createPipelineRun(roleId: string): Promise<PipelineRun> {
  return createRun(roleId);
}

/**
 * Execute the full autonomous hiring pipeline for a role.
 * Designed to run in the background — call without awaiting.
 *
 * The system extracts and presents signals only.
 * It does NOT make hiring decisions.
 */
export async function runPipeline(runId: string, roleId: string): Promise<void> {
  logger.info('Pipeline started', { runId, roleId });

  try {
    await updateRun(runId, { status: 'running', headline: 'Pipeline running…' });
    await auditLog('pipeline_started', 'pipeline_run', runId, { role_id: roleId });

    // ── Step 1: Load role ──────────────────────────────────────────────────────
    const role = await getRoleById(roleId);
    await appendStep(runId, 'role_fetch', 'ok', 'Role loaded', { role_id: role.id });

    // ── Step 2: Derive sourcing strategy via Claude ────────────────────────────
    const strategy = await deriveSourcingStrategy(role.intelligence, role.constraints);

    // Persist strategy as durable record
    const { data: strategyRow } = await supabase
      .from('role_strategy')
      .insert({
        role_id: roleId,
        pipeline_run_id: runId,
        strategy_summary: strategy.strategy_summary,
        github_queries: strategy.github_queries,
        db_filters: strategy.db_filters,
        target_talent_pools: strategy.target_talent_pools,
        reasoning: strategy.reasoning,
      })
      .select('id')
      .single();

    if (strategyRow?.id) {
      await supabase
        .from('pipeline_runs')
        .update({ strategy_id: strategyRow.id })
        .eq('id', runId);
    }

    await auditLog('strategy_generated', 'pipeline_run', runId, {
      strategy_id: strategyRow?.id,
      role_id: roleId,
    });

    await appendStep(runId, 'sourcing_strategy', 'ok', strategy.strategy_summary, {
      github_queries: strategy.github_queries.length,
      target_pools: strategy.target_talent_pools.length,
      db_filters: strategy.db_filters,
    });

    // ── Step 3: Fetch candidates from all sources ──────────────────────────────
    const normalized: NormalizedCandidate[] = await fetchCandidates(strategy);
    await appendStep(runId, 'candidate_fetch', 'ok', `${normalized.length} candidates sourced`, {
      count: normalized.length,
      github: normalized.filter((c) => c.source === 'github').length,
      db: normalized.filter((c) => c.source === 'supabase').length,
    });
    await updateRun(runId, { candidates_sourced: normalized.length });

    // ── Step 4: Upsert candidates ──────────────────────────────────────────────
    const profiles: CandidateProfile[] = [];
    for (const candidate of normalized) {
      try {
        const profile = await upsertCandidate(candidate);
        profiles.push(profile);
      } catch (err) {
        logger.warn('Failed to upsert candidate, skipping', {
          source: candidate.source,
          source_id: candidate.source_id,
          err,
        });
      }
    }
    await appendStep(runId, 'candidate_upsert', 'ok', `${profiles.length} candidates ready`, {
      count: profiles.length,
    });

    // Profile lookup map — used in enrichment step to resolve candidate names
    const profileMap = new Map<string, CandidateProfile>(profiles.map((p) => [p.id, p]));

    // ── Step 5: Analyze each candidate ────────────────────────────────────────
    const insights: CandidateInsight[] = [];
    for (const profile of profiles) {
      try {
        const insight = await analyzeCandidate(profile, role.intelligence, roleId, runId);
        insights.push(insight);
      } catch (err) {
        logger.warn('Failed to analyze candidate, skipping', { candidate_id: profile.id, err });
      }
    }
    await appendStep(runId, 'analysis', 'ok', `${insights.length} candidates analyzed`, {
      count: insights.length,
    });
    await updateRun(runId, { candidates_analyzed: insights.length });

    // ── Step 6: Match and group by alignment ──────────────────────────────────
    const counts = emptyAlignmentCounts();
    const actionableInsights: CandidateInsight[] = []; // non-no_fit insights

    for (const insight of insights) {
      try {
        const result = await matchCandidate(insight, role.intelligence);
        if (result.alignment){
  counts[result.alignment]++;
         }
        if (result.alignment !== 'no_fit') {
          actionableInsights.push(result);
        }
      } catch (err) {
        logger.warn('Failed to match candidate, skipping', {
          candidate_id: insight.candidate_id,
          err,
        });
      }
    }

    const actionableCount =
      counts.strong_alignment + counts.moderate_alignment + counts.explore;

    await appendStep(runId, 'matching', 'ok', `${actionableCount} actionable candidates grouped`, {
      strong_alignment: counts.strong_alignment,
      moderate_alignment: counts.moderate_alignment,
      explore: counts.explore,
      no_fit: counts.no_fit,
    });
    await updateRun(runId, { candidates_matched: actionableCount });

    // ── Step 7: Enrich actionable candidates (cards + advisories, parallel) ───
    const enrichResults = await Promise.allSettled(
      actionableInsights.map((insight) => {
        const name = profileMap.get(insight.candidate_id)?.name ?? 'Unknown';
        return enrichInsight(insight, name, role.intelligence);
      })
    );

    const enrichedCount = enrichResults.filter((r) => r.status === 'fulfilled').length;
    const enrichFailCount = enrichResults.filter((r) => r.status === 'rejected').length;

    if (enrichFailCount > 0) {
      logger.warn('Some enrichments failed', { failed: enrichFailCount });
    }

    await appendStep(runId, 'enrichment', 'ok', `${enrichedCount} candidates enriched`, {
      enriched: enrichedCount,
      failed: enrichFailCount,
    });

    // ── Complete ───────────────────────────────────────────────────────────────
    const headline = buildHeadline(normalized.length, counts);
    await appendStep(runId, 'complete', 'ok', 'Pipeline finished successfully');
    await updateRun(runId, { status: 'completed', headline });
    await auditLog('pipeline_completed', 'pipeline_run', runId, { headline, ...counts });

    logger.info('Pipeline completed', { runId, roleId, headline, ...counts });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Pipeline failed', { runId, roleId, err: message });

    await appendStep(runId, 'complete', 'error', `Pipeline failed: ${message}`).catch(() => {});
    await updateRun(runId, {
      status: 'failed',
      headline: `Pipeline failed: ${message}`,
      error: message,
    }).catch(() => {});
  }
}
