import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { buildRoleIntelligencePrompt } from '../prompts/roleIntelligencePrompt';
import { buildCandidateAnalysisPrompt } from '../prompts/candidateAnalysisPrompt';
import { buildMatchingPrompt } from '../prompts/matchingPrompt';
import { buildSourcingStrategyPrompt } from '../prompts/sourcingStrategyPrompt';
import { buildQuestionPrompt } from '../prompts/questionPrompt';
import { buildAdvisorPrompt } from '../prompts/advisorPrompt';
import type {
  RoleInput,
  RoleIntelligence,
  RoleConstraints,
  CandidateProfile,
  CandidateInsight,
  CandidateResponse,
  CandidateQuestion,
  AdvisoryOutput,
  SourcingStrategy,
  AlignmentGroup,
} from '../types';

const client = new Anthropic({ apiKey: env.anthropicApiKey });

const MODEL = 'claude-opus-4-6';

async function callClaude<T>(prompt: string): Promise<T> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected Claude response type');
  }

  const raw = block.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Claude returned non-JSON response: ${raw.slice(0, 200)}`);
  }
}

// ─── Role intelligence ────────────────────────────────────────────────────────

export async function generateRoleIntelligence(input: RoleInput): Promise<RoleIntelligence> {
  return callClaude<RoleIntelligence>(buildRoleIntelligencePrompt(input));
}

export async function deriveSourcingStrategy(
  intelligence: RoleIntelligence,
  constraints: RoleConstraints
): Promise<SourcingStrategy> {
  return callClaude<SourcingStrategy>(buildSourcingStrategyPrompt(intelligence, constraints));
}

// ─── Candidate analysis ───────────────────────────────────────────────────────

export async function analyzeCandidate(
  profile: CandidateProfile,
  roleIntelligence: RoleIntelligence,
  responses?: CandidateResponse[]
): Promise<Omit<CandidateInsight, 'candidate_id' | 'role_id' | 'alignment' | 'match_reasons' | 'concerns' | 'card' | 'advisory'>> {
  return callClaude(buildCandidateAnalysisPrompt(profile, roleIntelligence, responses));
}

export interface MatchResult {
  alignment: AlignmentGroup;
  match_reasons: string[];
  concerns: string[];
}

export async function matchCandidate(
  insight: CandidateInsight,
  roleIntelligence: RoleIntelligence
): Promise<MatchResult> {
  return callClaude<MatchResult>(buildMatchingPrompt(insight, roleIntelligence));
}

// ─── Conversation layer ───────────────────────────────────────────────────────

export async function generateQuestions(
  intelligence: RoleIntelligence
): Promise<CandidateQuestion[]> {
  const result = await callClaude<{ questions: CandidateQuestion[] }>(
    buildQuestionPrompt(intelligence)
  );
  return result.questions;
}

// ─── HM Advisor layer ─────────────────────────────────────────────────────────

export async function generateAdvisory(
  insight: CandidateInsight,
  intelligence: RoleIntelligence
): Promise<AdvisoryOutput> {
  return callClaude<AdvisoryOutput>(buildAdvisorPrompt(insight, intelligence));
}
