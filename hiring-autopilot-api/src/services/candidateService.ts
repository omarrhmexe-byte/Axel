import { supabase } from '../config/supabase';
import {
  analyzeCandidate as claudeAnalyze,
  matchCandidate as claudeMatch,
} from './claudeService';
import type {
  CandidateProfile,
  CandidateInsight,
  ConfidenceLayer,
  CandidateResponse,
  RoleIntelligence,
  NormalizedCandidate,
  SourcingStrategy,
  AlignmentGroup,
} from '../types';

/**
 * Analyze a candidate profile in the context of a role.
 * Returns cached insight if already analyzed for this role.
 * Automatically picks up candidate responses from the candidate_responses table.
 */
export async function analyzeCandidate(
  profile: CandidateProfile,
  roleIntelligence: RoleIntelligence,
  roleId: string,
  runId?: string
): Promise<CandidateInsight> {
  const { data: existing } = await supabase
    .from('candidate_insights')
    .select('*')
    .eq('candidate_id', profile.id)
    .eq('role_id', roleId)
    .maybeSingle();

  if (existing) {
    // Re-link cached insight to the current pipeline run so this run's response is accurate
    if (runId && existing.pipeline_run_id !== runId) {
      await supabase
        .from('candidate_insights')
        .update({ pipeline_run_id: runId, status: 'pending' })
        .eq('candidate_id', profile.id)
        .eq('role_id', roleId);
      existing.pipeline_run_id = runId;
    }
    return existing as CandidateInsight;
  }

  // Check for candidate responses — enrich analysis if they exist
  const { data: responseRow } = await supabase
    .from('candidate_responses')
    .select('responses')
    .eq('candidate_id', profile.id)
    .maybeSingle();

  const responses = responseRow?.responses as CandidateResponse[] | undefined;

  const analysis = await claudeAnalyze(profile, roleIntelligence, responses);

  const insight: Omit<CandidateInsight, 'alignment' | 'confidence_layer' | 'match_reasons' | 'concerns' | 'card' | 'advisory' | 'status'> = {
    candidate_id: profile.id,
    role_id: roleId,
    pipeline_run_id: runId,
    ...analysis,
  };

  const { data, error } = await supabase
    .from('candidate_insights')
    .insert(insight)
    .select()
    .single();

  if (error) throw new Error(`Failed to save candidate insight: ${error.message}`);
  return data as CandidateInsight;
}

/**
 * Match a candidate insight against a role.
 * Updates the row with alignment group, match_reasons, and concerns.
 */
export async function matchCandidate(
  insight: CandidateInsight,
  roleIntelligence: RoleIntelligence
): Promise<CandidateInsight> {
  const result = await claudeMatch(insight, roleIntelligence);

  const confidenceMap: Record<AlignmentGroup, ConfidenceLayer> = {
    strong_alignment: 'high',
    moderate_alignment: 'medium',
    explore: 'low',
    no_fit: 'low',
  };

  const { data, error } = await supabase
    .from('candidate_insights')
    .update({
      alignment: result.alignment,
      confidence_layer: confidenceMap[result.alignment],
      match_reasons: result.match_reasons,
      concerns: result.concerns,
    })
    .eq('candidate_id', insight.candidate_id)
    .eq('role_id', insight.role_id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update match result: ${error.message}`);
  return data as CandidateInsight;
}

/**
 * Fetch all evaluated insights for a role, excluding no_fit candidates.
 */
export async function getPipelineForRole(roleId: string): Promise<CandidateInsight[]> {
  const { data, error } = await supabase
    .from('candidate_insights')
    .select('*')
    .eq('role_id', roleId)
    .not('alignment', 'is', null)
    .neq('alignment', 'no_fit');

  if (error) throw new Error(`Failed to fetch pipeline: ${error.message}`);
  return (data ?? []) as CandidateInsight[];
}

/**
 * Fetch all raw candidates from the candidates table.
 */
export async function getAllCandidates(): Promise<CandidateProfile[]> {
  const { data, error } = await supabase.from('candidates').select('*');
  if (error) throw new Error(`Failed to fetch candidates: ${error.message}`);
  return (data ?? []) as CandidateProfile[];
}

/**
 * Insert a candidate or return the existing row if already sourced
 * from the same source+source_id pair (idempotent).
 */
export async function upsertCandidate(
  candidate: NormalizedCandidate
): Promise<CandidateProfile> {
  const { data: existing } = await supabase
    .from('candidates')
    .select('*')
    .eq('source', candidate.source)
    .eq('source_id', candidate.source_id)
    .maybeSingle();

  if (existing) return existing as CandidateProfile;

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      name: candidate.name,
      current_title: candidate.current_title,
      current_company: candidate.current_company,
      years_of_experience: candidate.years_of_experience,
      location: candidate.location,
      skills: candidate.skills,
      work_history: candidate.work_history,
      education: candidate.education ?? null,
      notes: candidate.notes ?? null,
      source: candidate.source,
      source_id: candidate.source_id,
      derived_signals: candidate.derived_signals ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert candidate: ${error.message}`);
  return data as CandidateProfile;
}

/**
 * Fetch candidates filtered by the sourcing strategy's db_filters.
 * locations, titles, companies use OR-within-field logic.
 * skills uses array overlap (ANY match).
 */
export async function getCandidatesByFilter(
  filters: SourcingStrategy['db_filters']
): Promise<CandidateProfile[]> {
  let query = supabase.from('candidates').select('*');

  // Sanitise a filter value: strip commas (PostgREST OR parser splits on them)
  const sanitise = (v: string) => v.split(',')[0].trim();

  // locations: OR match — use city/region keyword only (before any comma)
  if (filters?.locations && filters.locations.length > 0) {
    const unique = [...new Set(filters.locations.map(sanitise))].filter(Boolean);
    if (unique.length > 0) {
      const locationFilter = unique.map((l) => `location.ilike.%${l}%`).join(',');
      query = query.or(locationFilter);
    }
  }

  // titles: OR match across relevant title keywords
  if (filters?.titles && filters.titles.length > 0) {
    const unique = [...new Set(filters.titles.map(sanitise))].filter(Boolean);
    if (unique.length > 0) {
      const titleFilter = unique.map((t) => `current_title.ilike.%${t}%`).join(',');
      query = query.or(titleFilter);
    }
  }

  // companies: intentionally skipped — company list is a sourcing hint, not an exclusion filter.
  // Filtering by company would eliminate candidates from unlisted companies (e.g. Cyble)
  // that may still be excellent fits. Claude evaluates company context during analysis.

  // skills: array overlap — only apply if candidates in DB have skills populated
  // (skipped if filter is empty to avoid AND-eliminating all legacy rows)
  if (filters?.skills && filters.skills.length > 0) {
    query = query.overlaps('skills', filters.skills);
  }

  // Soft experience bounds: allow ±2 years below min / above max so near-matches
  // reach Claude for evaluation. Experience gaps are surfaced as risks, not used to
  // hard-exclude candidates at the DB layer.
  if (filters?.min_experience !== undefined) {
    query = query.gte('years_of_experience', Math.max(0, filters.min_experience - 2));
  }
  if (filters?.max_experience !== undefined) {
    query = query.lte('years_of_experience', filters.max_experience + 2);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to filter candidates: ${error.message}`);
  return (data ?? []) as CandidateProfile[];
}
