import type { RoleIntelligence } from '../types';

export function buildQuestionPrompt(intelligence: RoleIntelligence): string {
  return `You are an expert recruiter preparing for a candidate conversation.
Generate 5–7 thoughtful questions that will help understand this candidate deeply.

ROLE CONTEXT:
${intelligence.role_summary}
Core signals needed: ${intelligence.core_signals.join(', ')}
Culture signals: ${intelligence.culture_signals.join(', ')}
Company stage: ${intelligence.company_context.stage}
Team environment: ${intelligence.company_context.team_environment}

WHAT TO EXTRACT:
- Real experience (not what they claim — what they actually built or owned)
- Motivation (why they're open to this conversation, what they're optimising for)
- Ambition (where they want to go — short and long term)
- Working style (how they operate, what environments they thrive in)
- Values (what they care about in work, teams, and companies)

RULES:
- Conversational tone — these are questions a thoughtful person would ask, not an HR checklist
- Open-ended — avoid yes/no questions
- Specific to this role and company stage
- Each question must have a clear purpose that explains what signal you're extracting
- Do NOT ask about salary, availability, or logistics

Return a JSON object with EXACTLY this structure (no markdown fences):
{
  "questions": [
    {
      "question": "What's something you've built in the last 12 months that you're genuinely proud of?",
      "purpose": "Reveals what they consider meaningful work and their ownership depth"
    }
  ]
}

Return only valid JSON.`;
}
