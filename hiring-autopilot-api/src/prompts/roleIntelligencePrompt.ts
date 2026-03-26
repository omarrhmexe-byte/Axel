import { RoleInput } from '../types';

export function buildRoleIntelligencePrompt(input: RoleInput): string {
  const { company, role_prompt, constraints } = input;
  const { budget_lpa, location, experience_range } = constraints;

  return `You are an expert talent strategist helping a startup hire for a critical role.

Company: ${company}
Role Description: ${role_prompt}
Budget: ${budget_lpa} LPA
Location: ${location}
Experience Range: ${experience_range}

Your job is to generate a deep, realistic role intelligence brief that a recruiter can act on immediately.

IMPORTANT CONSTRAINTS:
- Budget is ${budget_lpa} LPA. Avoid targeting candidates from companies known for very high compensation (e.g., Stripe, Google, Meta, Postman, Coinbase) unless the budget is above 40 LPA. Focus on realistic hiring pools.
- Location is ${location}. Consider remote-friendly companies and candidates in nearby cities if applicable.
- Experience range is ${experience_range}. Filter company targets and signals accordingly.

Return a JSON object with EXACTLY this structure (no extra fields, no markdown fences):
{
  "role_summary": "2-3 sentence summary of what this role actually needs and why it matters",
  "company_context": {
    "stage": "e.g. seed / Series A / Series B / growth",
    "product_type": "e.g. B2B SaaS / consumer / dev tools / marketplace",
    "customer_type": "e.g. SMBs / enterprise / developers / end consumers",
    "team_environment": "e.g. fast-moving 0-to-1 team, structured pod, cross-functional squad"
  },
  "relevant_titles": ["list of 5-8 realistic job titles to search for"],
  "target_companies": ["10-15 companies whose alumni would thrive here, realistic for budget"],
  "avoid_companies": ["5-8 companies whose culture/compensation would be a bad fit or unrealistic target"],
  "core_signals": ["6-10 hard skills, technologies, or domain experience signals to look for"],
  "culture_signals": ["4-6 behavioral or culture indicators that suggest a good fit"]
}

Return only valid JSON.`;
}
