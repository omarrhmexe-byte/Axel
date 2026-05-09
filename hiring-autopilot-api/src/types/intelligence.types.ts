import type { AlignmentGroup } from './workflow.types';

// ─── Conversation layer ───────────────────────────────────────────────────────

export interface CandidateQuestion {
  question: string;
  purpose: string; // Why we're asking — shared with the interviewer, not the candidate
}

export interface CandidateResponse {
  question: string;
  answer: string;
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

export interface CardSections {
  alignment: string[];   // Why this person aligns with the role — from match_reasons
  experience: string[];  // What they bring experience-wise — from signals + strengths
  motivation: string[];  // What drives them — from motivation_signals
  value: string[];       // Where they contribute concretely — from value_signals
  risks: string[];       // Honest gaps/concerns — from concerns + gaps
}

export interface CandidateCard {
  name: string;
  headline: string;     // One-line professional snapshot
  alignment: AlignmentGroup;
  sections: CardSections;
}

// ─── Response analysis output ────────────────────────────────────────────────

export type SignalQuality = 'strong' | 'medium' | 'weak';
export type ResponseDecision = 'move_to_call' | 'ask_followup' | 'drop';

export interface ResponseAnalysisOutput {
  signal_quality:  SignalQuality;
  what_we_learned: string[];   // Concrete observations from the response
  what_is_unclear: string[];   // Remaining gaps
  decision:        ResponseDecision;
  decision_reason: string;     // One sentence
}

// ─── HM Advisor output ───────────────────────────────────────────────────────
// Shape produced by advisorPrompt.ts — Claude acting as top 1% recruiter.

export interface AdvisoryOutput {
  why_interesting:  string[];  // Concrete evidence tied to this specific role
  risk_unknown:     string[];  // What is NOT proven; what could break
  trajectory:       string[];  // Direction they are moving; environment they thrive in
  question_to_ask:  string;    // ONE human question to reduce the biggest uncertainty
}
