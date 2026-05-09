/**
 * responseAnalysisPrompt.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Evaluates a candidate's response to the outreach question.
 *
 * Goal: understand how they think and decide whether to move forward.
 *
 * OUTPUT → ResponseAnalysisOutput:
 *   signal_quality   = 'strong' | 'medium' | 'weak'
 *   what_we_learned  = concrete observations from the response
 *   what_is_unclear  = what remains unresolved
 *   decision         = 'move_to_call' | 'ask_followup' | 'drop'
 *   decision_reason  = one sentence explaining the decision
 *
 * EDIT THIS FILE to change how responses are evaluated.
 */

import type { RoleIntelligence } from '../types';

export function buildResponseAnalysisPrompt(
  roleIntelligence: RoleIntelligence,
  question:         string,
  response:         string,
): string {
  return `You are analyzing a candidate's response.

Goal:
- understand how they think
- decide whether to move forward

---

ROLE CONTEXT:
${roleIntelligence.role_summary}
Stage: ${roleIntelligence.company_context.stage}
Environment: ${roleIntelligence.company_context.team_environment}
Core signals needed: ${roleIntelligence.core_signals.join(', ')}

---

ORIGINAL QUESTION:
${question}

---

CANDIDATE RESPONSE:
${response}

---

INSTRUCTIONS:

1. Evaluate depth of thinking
- Are they giving real experience or generic answers?
- Do they reference actual constraints, tradeoffs, or decisions?

2. Identify signal strength
- Strong / Medium / Weak

3. Identify gaps
- What is still unclear?

4. Decide next step
- Move to call
- Ask follow-up
- Drop

---

Return a JSON object with EXACTLY this structure (no markdown fences):
{
  "signal_quality": "strong" | "medium" | "weak",
  "what_we_learned": [
    "concrete observation from this response, tied to the role context"
  ],
  "what_is_unclear": [
    "specific gap or unresolved question"
  ],
  "decision": "move_to_call" | "ask_followup" | "drop",
  "decision_reason": "one sentence explaining this decision"
}

Return only valid JSON.`;
}
