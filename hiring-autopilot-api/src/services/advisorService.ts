import { supabase } from '../config/supabase';
import { generateAdvisory as claudeGenerateAdvisory } from './claudeService';
import { buildCandidateCard } from './candidateCardService';
import type { CandidateInsight, CandidateCard, AdvisoryOutput, RoleIntelligence } from '../types';

/**
 * Generate an HM advisory for a candidate.
 * Checks the candidate_insights row for a cached advisory before calling Claude.
 * Stores result back to Supabase after generation.
 */
export async function generateCandidateAdvisory(
  insight: CandidateInsight,
  roleIntelligence: RoleIntelligence
): Promise<AdvisoryOutput> {
  // In-memory cache hit (insight already has advisory from a previous run)
  if (insight.advisory) return insight.advisory;

  // Supabase cache hit
  const { data: existing } = await supabase
    .from('candidate_insights')
    .select('advisory')
    .eq('candidate_id', insight.candidate_id)
    .eq('role_id', insight.role_id)
    .maybeSingle();

  if (existing?.advisory) return existing.advisory as AdvisoryOutput;

  // Generate via Claude
  const advisory = await claudeGenerateAdvisory(insight, roleIntelligence);

  // Persist — non-blocking failure (advisory is a presentation layer, not critical)
  await supabase
    .from('candidate_insights')
    .update({ advisory })
    .eq('candidate_id', insight.candidate_id)
    .eq('role_id', insight.role_id);

  return advisory;
}

/**
 * Enrich a single candidate insight with both a card and an advisory.
 * Runs card build (sync) and advisory generation (async) together,
 * then persists both to Supabase.
 *
 * Designed to be called inside Promise.all for parallel enrichment.
 */
export async function enrichInsight(
  insight: CandidateInsight,
  candidateName: string,
  roleIntelligence: RoleIntelligence
): Promise<{ card: CandidateCard; advisory: AdvisoryOutput }> {
  // Card is purely derived from insight — no Claude call
  const card = buildCandidateCard(insight, candidateName);

  // Advisory may use cached result
  const advisory = await generateCandidateAdvisory(insight, roleIntelligence);

  // Persist card + advisory together
  await supabase
    .from('candidate_insights')
    .update({ card, advisory })
    .eq('candidate_id', insight.candidate_id)
    .eq('role_id', insight.role_id);

  return { card, advisory };
}
