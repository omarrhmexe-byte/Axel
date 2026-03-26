// ─── Confidence & Source ──────────────────────────────────────────────────────
/** Frontend confidence layer — replaces raw alignment labels in the UI. */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** Raw alignment group coming from the backend. */
export type AlignmentGroup =
  | 'strong_alignment'
  | 'moderate_alignment'
  | 'explore'
  | 'no_fit';

/** Candidate source. */
export type CandidateSource = 'github' | 'db' | 'linkedin';

// ─── Signals ─────────────────────────────────────────────────────────────────
export interface DerivedSignals {
  primary_languages: string[];
  repo_complexity: 'low' | 'medium' | 'high';
  open_source_activity: 'inactive' | 'moderate' | 'active';
  backend_experience: boolean;
}

// ─── Card & Advisory ──────────────────────────────────────────────────────────
export interface CardSections {
  alignment:  string[];
  experience: string[];
  motivation: string[];
  value:      string[];
  risks:      string[];
}

export interface CandidateCard {
  name:      string;
  headline:  string;
  alignment: string;
  sections:  CardSections;
}

export interface AdvisoryOutput {
  quick_take:            string;
  why_interesting:       string[];
  where_they_add_value:  string[];
  open_questions:        string[];
}

// ─── Pipeline Candidate ───────────────────────────────────────────────────────
/** A single enriched candidate entry as returned by GET /pipeline-run/:runId */
export interface PipelineCandidate {
  candidate_id:       string;
  candidate_name:     string;
  summary:            string;
  alignment:          AlignmentGroup;
  match_reasons:      string[];
  concerns:           string[];
  motivation_signals?: string[];
  value_signals?:      string[];
  card?:              CandidateCard;
  advisory?:          AdvisoryOutput;
  /** source field — lives on the candidate row */
  source?:            CandidateSource;
  derived_signals?:   DerivedSignals;
  /** Computed on the frontend from `alignment` */
  confidence:         ConfidenceLevel;
}

// ─── Pipeline groups ─────────────────────────────────────────────────────────
/** Backend grouping shape */
export interface PipelineGroups {
  strong_alignment:   PipelineCandidate[];
  moderate_alignment: PipelineCandidate[];
  explore:            PipelineCandidate[];
}

/** Frontend confidence grouping (derived) */
export interface ConfidencePipeline {
  high:   PipelineCandidate[];
  medium: PipelineCandidate[];
  low:    PipelineCandidate[];
}

// ─── Pipeline run ─────────────────────────────────────────────────────────────
export type PipelineRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowStep {
  step:       string;
  status:     'pending' | 'running' | 'done' | 'error';
  message:    string;
  timestamp:  string;
  meta?:      Record<string, unknown>;
}

export interface PipelineRunResponse {
  status:            PipelineRunStatus;
  headline:          string;
  system_log:        WorkflowStep[];
  error?:            string;
  pipeline?:         PipelineGroups;
  role_intelligence?: RoleIntelligence;
}

// ─── Role types ───────────────────────────────────────────────────────────────
export interface RoleConstraints {
  budget_lpa:       number;
  location:         string;
  experience_range: string;
}

export interface RoleInput {
  company:     string;
  role_prompt: string;
  constraints: RoleConstraints;
}

export interface CompanyContext {
  stage:            string;
  product_type:     string;
  customer_type:    string;
  team_environment: string;
}

export interface RoleIntelligence {
  role_summary:     string;
  company_context:  CompanyContext;
  relevant_titles:  string[];
  target_companies: string[];
  avoid_companies:  string[];
  core_signals:     string[];
  culture_signals:  string[];
}

export interface Role {
  id:           string;
  company:      string;
  role_prompt:  string;
  constraints:  RoleConstraints;
  intelligence: RoleIntelligence;
  created_at:   string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────
export interface CandidateQuestion {
  question: string;
  purpose:  string;
}

export interface CandidateResponse {
  question: string;
  answer:   string;
}

// ─── Waitlist ─────────────────────────────────────────────────────────────────
export interface WaitlistEntry {
  email:                    string;
  company_name:             string;
  role:                     string;
  budget_lpa?:              number;
  budget?:                  string;
  location:                 string;
  experience_range?:        string;
  company_description?:     string;
  why_autopilot?:           string;
  growth_rate?:             string;
  hiring_manager_ambition?: string;
  // Extended fields (v2 form)
  stage?:                   string;
  company_size?:            string;
  hiring_urgency?:          string;
  why_join?:                string;
  description?:             string;
}
