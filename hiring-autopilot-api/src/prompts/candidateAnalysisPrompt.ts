import type { CandidateProfile, RoleIntelligence, CandidateResponse } from '../types';

export function buildCandidateAnalysisPrompt(
  profile: CandidateProfile,
  roleIntelligence: RoleIntelligence,
  responses?: CandidateResponse[]
): string {
  const hasResponses = responses && responses.length > 0;

  const responsesSection = hasResponses
    ? `
CANDIDATE RESPONSES (prioritise these over inferred signals — they are first-person):
${responses!
  .map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`)
  .join('\n\n')}`
    : '';

  const derivedSection = profile.derived_signals
    ? `
GitHub signals:
- Primary languages: ${profile.derived_signals.primary_languages.join(', ') || 'none detected'}
- Repo complexity: ${profile.derived_signals.repo_complexity}
- Open source activity: ${profile.derived_signals.open_source_activity}
- Backend experience: ${profile.derived_signals.backend_experience ? 'yes' : 'no'}`
    : '';

  const responseGuidance = hasResponses
    ? `- The candidate has provided direct responses — extract ambition, intent, and career direction from these
- Prioritise what they said over what you infer from their profile
- motivation_signals must come from their actual words
- value_signals should reflect where they see themselves contributing`
    : `- No direct responses available — infer motivation and value signals from profile context
- motivation_signals should be inferred carefully from career trajectory and choices
- value_signals should reflect likely areas of contribution based on their background`;

  return `You are an expert talent analyst. Analyze this candidate in the context of the role.

ROLE CONTEXT:
${roleIntelligence.role_summary}
Core signals: ${roleIntelligence.core_signals.join(', ')}
Culture signals: ${roleIntelligence.culture_signals.join(', ')}
Company stage: ${roleIntelligence.company_context.stage}
Team environment: ${roleIntelligence.company_context.team_environment}

CANDIDATE PROFILE:
Name: ${profile.name}
Current Title: ${profile.current_title} at ${profile.current_company}
Years of Experience: ${profile.years_of_experience}
Location: ${profile.location}
Skills: ${profile.skills.join(', ')}
Work History:
${profile.work_history
  .map(
    (w) =>
      `- ${w.title} at ${w.company} (${w.duration_years} yrs)${w.description ? ': ' + w.description : ''}`
  )
  .join('\n')}
${profile.education ? `Education: ${profile.education}` : ''}
${profile.notes ? `Notes: ${profile.notes}` : ''}
${derivedSection}
${responsesSection}

ANALYSIS GUIDANCE:
- Be honest and specific — avoid generic phrases like "strong communicator"
- Do not inflate strengths; a useful gap is better than a vague compliment
${responseGuidance}

Return a JSON object with EXACTLY this structure (no markdown fences):
{
  "summary": "2-3 sentences capturing who this person really is as a professional",
  "signals": ["3-6 specific signals relevant to the role"],
  "experience": "1-2 sentences on their experience level and trajectory",
  "strengths": ["3-5 concrete strengths from their background"],
  "gaps": ["2-4 honest gaps relative to what the role needs"],
  "motivation_signals": ["2-4 signals about what drives this person and what they optimise for"],
  "value_signals": ["2-4 areas where this person would concretely add value in this role"]
}

Return only valid JSON.`;
}
