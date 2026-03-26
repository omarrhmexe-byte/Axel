import type { AlignmentGroup, DerivedSignals } from './workflow.types';
import type { CandidateCard, AdvisoryOutput } from './intelligence.types';

export interface CandidateProfile {
  id: string;
  name: string;
  current_title: string;
  current_company: string;
  years_of_experience: number;
  location: string;
  skills: string[];
  work_history: WorkEntry[];
  education?: string;
  notes?: string;
  source?: 'supabase' | 'github';
  source_id?: string;
  derived_signals?: DerivedSignals;
}

export interface WorkEntry {
  company: string;
  title: string;
  duration_years: number;
  description?: string;
}

export type ConfidenceLayer = 'high' | 'medium' | 'low';
export type InsightStatus = 'pending' | 'reviewed' | 'advanced' | 'rejected';

export interface CandidateInsight {
  candidate_id: string;
  role_id: string;
  pipeline_run_id?: string;
  // Analysis — always populated
  summary: string;
  signals: string[];
  experience: string;
  strengths: string[];
  gaps: string[];
  // Enriched signals — populated when candidate responses are available
  motivation_signals?: string[];
  value_signals?: string[];
  // Match — populated after matchCandidate
  alignment?: AlignmentGroup;
  confidence_layer?: ConfidenceLayer;
  match_reasons?: string[];
  concerns?: string[];
  // Recruiter workflow state
  status?: InsightStatus;
  // Presentation layer — populated after enrichment step
  card?: CandidateCard;
  advisory?: AdvisoryOutput;
}
