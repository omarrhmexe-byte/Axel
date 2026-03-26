import { supabase } from '../config/supabase';
import { generateQuestions as claudeGenerateQuestions } from './claudeService';
import type { RoleIntelligence, CandidateQuestion, CandidateResponse } from '../types';

/**
 * Generate role-specific interview questions using Claude.
 * Questions are designed to extract experience, motivation, ambition, and working style.
 */
export async function generateQuestions(
  roleIntelligence: RoleIntelligence
): Promise<CandidateQuestion[]> {
  return claudeGenerateQuestions(roleIntelligence);
}

/**
 * Store a candidate's responses to interview questions.
 * Responses are stored per candidate (not role-specific) and are picked up
 * automatically by analyzeCandidate on subsequent pipeline runs.
 *
 * Upserts — calling this again replaces previous responses.
 */
export async function storeCandidateResponses(
  candidateId: string,
  responses: CandidateResponse[]
): Promise<void> {
  const { error } = await supabase
    .from('candidate_responses')
    .upsert(
      { candidate_id: candidateId, responses },
      { onConflict: 'candidate_id' }
    );

  if (error) throw new Error(`Failed to store candidate responses: ${error.message}`);
}

/**
 * Fetch existing responses for a candidate, if any.
 */
export async function getCandidateResponses(
  candidateId: string
): Promise<CandidateResponse[] | null> {
  const { data, error } = await supabase
    .from('candidate_responses')
    .select('responses')
    .eq('candidate_id', candidateId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch candidate responses: ${error.message}`);
  return data ? (data.responses as CandidateResponse[]) : null;
}
