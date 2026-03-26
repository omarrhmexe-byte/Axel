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

// ─── HM Advisor output ───────────────────────────────────────────────────────

export interface AdvisoryOutput {
  quick_take: string;             // 1–2 line insight on this candidate
  why_interesting: string[];      // Specific reasons tied to the role
  where_they_add_value: string[]; // Practical contribution areas
  open_questions: string[];       // Things the HM should probe further
}
