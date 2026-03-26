export type PipelineRunStatus = 'pending' | 'running' | 'completed' | 'failed';

export type WorkflowStepName =
  | 'role_fetch'
  | 'sourcing_strategy'
  | 'candidate_fetch'
  | 'candidate_upsert'
  | 'analysis'
  | 'matching'
  | 'enrichment'
  | 'complete';

export type AlignmentGroup = 'strong_alignment' | 'moderate_alignment' | 'explore' | 'no_fit';

export interface WorkflowStep {
  step: WorkflowStepName;
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface DerivedSignals {
  primary_languages: string[];
  repo_complexity: 'low' | 'medium' | 'high';
  open_source_activity: 'inactive' | 'moderate' | 'active';
  backend_experience: boolean;
}

export interface SourcingStrategy {
  strategy_summary: string;
  github_queries: string[];
  db_filters: {
    locations?: string[];
    titles?: string[];
    companies?: string[];
    skills?: string[];
    min_experience?: number;
    max_experience?: number;
  };
  target_talent_pools: string[];
  reasoning: string[];
}

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  top_languages: string[];
  html_url: string;
  derived_signals: DerivedSignals;
}

export interface NormalizedCandidate {
  source: 'github' | 'supabase';
  source_id: string;
  name: string;
  current_title: string;
  current_company: string;
  years_of_experience: number;
  location: string;
  skills: string[];
  work_history: [];
  education?: string;
  notes?: string;
  derived_signals?: DerivedSignals;
}

export interface PipelineRun {
  id: string;
  role_id: string;
  strategy_id?: string;
  status: PipelineRunStatus;
  headline: string;
  steps: WorkflowStep[];
  candidates_sourced: number;
  candidates_analyzed: number;
  candidates_matched: number;
  error?: string;
  created_at: string;
  updated_at: string;
}
