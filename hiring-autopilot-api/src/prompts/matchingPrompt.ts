import type { CandidateInsight, RoleIntelligence } from '../types';

export function buildMatchingPrompt(
  insight: CandidateInsight,
  roleIntelligence: RoleIntelligence
): string {
  return `You are a senior hiring advisor. Classify this candidate's alignment with the role.

ROLE INTELLIGENCE:
Summary: ${roleIntelligence.role_summary}
Core signals needed: ${roleIntelligence.core_signals.join(', ')}
Culture signals needed: ${roleIntelligence.culture_signals.join(', ')}
Target companies to come from: ${roleIntelligence.target_companies.join(', ')}
Avoid hiring from: ${roleIntelligence.avoid_companies.join(', ')}
Company stage: ${roleIntelligence.company_context.stage}
Team environment: ${roleIntelligence.company_context.team_environment}

CANDIDATE ANALYSIS:
Summary: ${insight.summary}
Experience: ${insight.experience}
Observed signals: ${insight.signals.join(', ')}
Strengths: ${insight.strengths.join(', ')}
Gaps: ${insight.gaps.join(', ')}

ALIGNMENT GROUPS — assign exactly one:
- "strong_alignment": Hits most core signals, culture fits, experience range is right. You would eagerly move them forward.
- "moderate_alignment": Good potential but needs validation. Missing some signals or has concerns worth probing.
- "explore": Low confidence but interesting in some way. Worth adding to a discovery long-list.
- "no_fit": Clear misalignment on fundamentals — wrong level, domain, or core signals.

INSTRUCTIONS:
- Think like a seasoned hiring manager, not a keyword matcher.
- Be honest. If there are real concerns, surface them — do not paper over gaps.
- Do NOT assign a numeric score. Reasoning only.
- Your match_reasons and concerns must be specific to this candidate, not generic statements.

Return a JSON object with EXACTLY this structure (no markdown fences):
{
  "alignment": "strong_alignment" | "moderate_alignment" | "explore" | "no_fit",
  "match_reasons": ["2-5 specific reasons this person could do this job well"],
  "concerns": ["1-4 honest concerns worth investigating in interviews"]
}

Return only valid JSON.`;
}
