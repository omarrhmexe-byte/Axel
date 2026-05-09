import type {
  PipelineRunResponse,
  RoleInput,
  Role,
  CandidateQuestion,
  CandidateResponse,
  FeedbackEventType,
  DeepAdvisoryResult,
  OutreachResult,
  ResponseAnalysisResult,
} from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Role intelligence ────────────────────────────────────────────────────────
export const createRole = (input: RoleInput) =>
  req<Role>('/role-intelligence', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// ─── Autonomous pipeline ──────────────────────────────────────────────────────
export const startPipeline = (roleId: string) =>
  req<{ run_id: string; status: string; message: string }>('/run-pipeline', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId }),
  });

export const getPipelineRun = (runId: string) =>
  req<PipelineRunResponse>(`/pipeline-run/${runId}`);

// ─── Conversation ─────────────────────────────────────────────────────────────
export const generateQuestions = (roleId: string) =>
  req<{ role_id: string; questions: CandidateQuestion[] }>('/generate-questions', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId }),
  });

export const submitResponses = (candidateId: string, responses: CandidateResponse[]) =>
  req<{ candidate_id: string; stored: boolean }>('/candidate-responses', {
    method: 'POST',
    body: JSON.stringify({ candidate_id: candidateId, responses }),
  });

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const submitFeedback = (
  candidateId: string,
  roleId:      string,
  eventType:   FeedbackEventType,
  extra?:      Record<string, unknown>,
) =>
  req<{ success: boolean }>('/feedback', {
    method: 'POST',
    body: JSON.stringify({ candidate_id: candidateId, role_id: roleId, event_type: eventType, ...extra }),
  });

// ─── Advisory ─────────────────────────────────────────────────────────────────
export const requestDeepAdvisory = (
  roleId:      string,
  candidateId: string,
  mode:        'fast' | 'deep' = 'deep',
) =>
  req<DeepAdvisoryResult>('/deep-advisory', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId, candidate_id: candidateId, mode }),
  });

// ─── Outreach ─────────────────────────────────────────────────────────────────
export const generateOutreach = (roleId: string, candidateId: string) =>
  req<OutreachResult>('/generate-outreach', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId, candidate_id: candidateId }),
  });

// ─── Response analysis ────────────────────────────────────────────────────────
export const analyzeResponse = (
  roleId:      string,
  candidateId: string,
  question:    string,
  response:    string,
) =>
  req<ResponseAnalysisResult>('/analyze-response', {
    method: 'POST',
    body: JSON.stringify({ role_id: roleId, candidate_id: candidateId, question, response }),
  });
