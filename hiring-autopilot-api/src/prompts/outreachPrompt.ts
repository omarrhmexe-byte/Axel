/**
 * outreachPrompt.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Outreach message generation.
 *
 * Governed by the OUTREACH CONSTITUTION below.
 * The constitution is embedded verbatim into every prompt.
 * Do not paraphrase or summarise it.
 *
 * EDIT THIS FILE to update the constitution or the data injected into it.
 */

import type { CandidateInsight, RoleIntelligence, AdvisoryOutput } from '../types';

// ── Outreach Constitution ─────────────────────────────────────────────────────
// Embedded verbatim into every outreach generation call.
// Do not rewrite this block. Edit it here if the governing principles change.
const OUTREACH_CONSTITUTION = `OUTREACH CONSTITUTION

This system is candidate-first.

The person receiving this message is not a lead, not a prospect, and not a profile.
They are an engineer with ambition, taste, and trajectory.

The purpose of outreach is:
- to make them feel genuinely understood
- to present a possibly aligned opportunity
- to reduce mismatch, not to push for a call

Never optimize only for reply rate.
Optimize for resonance, trust, and alignment.

Do not:
- sound like a recruiter
- sell aggressively
- overpraise
- use hype
- talk like a job post
- pretend certainty where there is only inference

Do:
- start from the candidate
- reflect specific evidence or trajectory
- make the opportunity feel contextual
- ask one thoughtful question only when it helps reduce uncertainty
- respect their time

Before returning, check the message against these criteria:

1. Could this message only have been written to this person?
2. Does the opening reflect the candidate before mentioning the company?
3. Does it avoid recruiter language and hiring clichés?
4. Does it present alignment, not a sales pitch?
5. Is the question thoughtful and natural?
6. Is every sentence necessary?

If any answer is no, rewrite the message.

Tone:
- calm
- sharp
- respectful
- observant
- low-ego
- peer-to-peer

Not:
- salesy
- overly excited
- polished corporate
- vague admiration
- founder-pitchy

If candidate understanding is weak, do not over-personalize.
Use a lighter, honest message based on the strongest available signal.
Never fabricate familiarity.`;

// ── Prompt builder ────────────────────────────────────────────────────────────
export function buildOutreachPrompt(
  insight:       CandidateInsight,
  intelligence:  RoleIntelligence,
  candidateName: string,
  company:       string,
  advisory?:     AdvisoryOutput,
): string {

  // Use advisory if available. It is the synthesised, role-specific understanding.
  // Fall back to raw signals if advisory hasn't run yet.
  const analysisBlock = advisory
    ? [
        advisory.why_interesting?.length
          ? `Why interesting:\n${advisory.why_interesting.map(s => `- ${s}`).join('\n')}`
          : '',
        advisory.trajectory?.length
          ? `Trajectory:\n${advisory.trajectory.map(s => `- ${s}`).join('\n')}`
          : '',
        advisory.risk_unknown?.length
          ? `Risk / Unknown (do not mention directly, use to calibrate confidence):\n${advisory.risk_unknown.map(s => `- ${s}`).join('\n')}`
          : '',
      ].filter(Boolean).join('\n\n')
    : [
        insight.signals?.length
          ? `Key signals: ${insight.signals.slice(0, 4).join(', ')}`
          : '',
        insight.strengths?.length
          ? `Strengths: ${insight.strengths.slice(0, 3).join(', ')}`
          : '',
        insight.motivation_signals?.length
          ? `Motivation signals: ${insight.motivation_signals.slice(0, 3).join(', ')}`
          : '',
        '(Advisory not yet run. Use available signals only. If weak, keep the message light and honest.)',
      ].filter(Boolean).join('\n');

  const roleContext = [
    `Company: ${company}`,
    `Role summary: ${intelligence.role_summary}`,
    `Stage: ${intelligence.company_context.stage}`,
    `Environment: ${intelligence.company_context.team_environment}`,
    `What this person would own: ${intelligence.core_signals.slice(0, 3).join(', ')}`,
  ].join('\n');

  return `${OUTREACH_CONSTITUTION}

---

ROLE CONTEXT:
${roleContext}

---

CANDIDATE INSIGHTS:
Name: ${candidateName}
${analysisBlock}

---

Now write the outreach message.

Run the 6-point self-check before returning.
If any criterion fails, rewrite.

Return a JSON object with EXACTLY this shape (no markdown fences):
{
  "subject": "a subject line that references their work or trajectory, not hiring language, under 8 words",
  "body": "the message. Plain text only, no markdown, no [First Name] placeholders, no emojis, 5-7 lines"
}

Return only valid JSON.`;
}
