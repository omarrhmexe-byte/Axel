/**
 * advisorPrompt.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * The Claude prompt used to generate advisory output for each candidate.
 *
 * FRAMING: Not a recruiter. A system that understands engineers deeply
 * and helps match them to the right environment. The goal is NOT to
 * filter candidates. The goal is to understand them well enough to avoid
 * a bad match.
 *
 * OUTPUT → AdvisoryOutput:
 *   why_interesting  = concrete evidence tied to this specific role
 *   risk_unknown     = what is NOT proven; what could break
 *   trajectory       = direction they are moving; environment they thrive in
 *   question_to_ask  = ONE human question to reduce the biggest uncertainty
 *
 * EDIT THIS FILE to change what Claude looks for or how it frames output.
 */

import type { CandidateInsight, RoleIntelligence } from '../types';

export function buildAdvisorPrompt(
  insight:      CandidateInsight,
  intelligence: RoleIntelligence,
): string {

  const candidateProfile = [
    `Summary: ${insight.summary}`,
    `Experience: ${insight.experience}`,
    `Key signals: ${insight.signals.join(', ')}`,
    `Strengths: ${insight.strengths.join(', ')}`,
    `Gaps: ${insight.gaps.join(', ')}`,
    insight.motivation_signals?.length
      ? `Motivation signals: ${insight.motivation_signals.join(', ')}`
      : '',
    insight.value_signals?.length
      ? `Value signals: ${insight.value_signals.join(', ')}`
      : '',
    `Alignment: ${insight.alignment ?? 'not yet classified'}`,
    `Why they align: ${(insight.match_reasons ?? []).join(', ')}`,
    `Concerns flagged: ${(insight.concerns ?? []).join(', ')}`,
  ].filter(Boolean).join('\n');

  const githubBlock = insight.derived_signals
    ? `\nGitHub / public signals:\n- Languages: ${insight.derived_signals.primary_languages?.join(', ') ?? 'unknown'}\n- Repo complexity: ${insight.derived_signals.repo_complexity}\n- OSS activity: ${insight.derived_signals.open_source_activity}\n- Backend experience: ${insight.derived_signals.backend_experience ? 'yes' : 'no'}`
    : '';

  return `You are not a recruiter.

You are a system that understands engineers deeply and helps match them to the right environment.

The goal is NOT to filter candidates.
The goal is to understand them well enough to avoid a bad match.

---

ROLE CONTEXT:
${intelligence.role_summary}
Stage: ${intelligence.company_context.stage}
Environment: ${intelligence.company_context.team_environment}
Core signals needed: ${intelligence.core_signals.join(', ')}
Culture signals: ${intelligence.culture_signals.join(', ')}

---

CANDIDATE DATA:
${candidateProfile}
${githubBlock}

---

INSTRUCTIONS:

1. Identify WHY this candidate is interesting for THIS role
- Use concrete evidence only (projects, experience, trajectory)
- Avoid generic phrases like "strong background"
- Tie everything to the role context

2. Identify the biggest RISK or UNKNOWN
- What is NOT proven?
- What could go wrong if this person is placed in this role?
- Be specific

3. Infer the candidate's TRAJECTORY
- What direction are they moving in?
- What kind of environment do they likely thrive in?

4. Generate ONE QUESTION to understand them better
- This is not an interview question
- This should help reduce the biggest uncertainty
- It should feel like a thoughtful, human question

---

Return a JSON object with EXACTLY this structure (no markdown fences):
{
  "why_interesting": [
    "concrete reason tied to the role, not a generic compliment"
  ],
  "risk_unknown": [
    "specific unknown or risk if placed in this role"
  ],
  "trajectory": [
    "direction they are moving in or environment they likely thrive in"
  ],
  "question_to_ask": "one thoughtful human question to reduce the biggest uncertainty"
}

Return only valid JSON.`;
}
