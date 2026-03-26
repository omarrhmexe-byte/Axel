import type { RoleIntelligence, RoleConstraints } from '../types';

function parseExperienceRange(range: string): { min: number; max: number } {
  const nums = range.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) return { min: nums[0]!, max: nums[1]! };
  if (nums.length === 1) return { min: nums[0]!, max: nums[0]! + 4 };
  return { min: 2, max: 8 };
}

export function buildSourcingStrategyPrompt(
  intelligence: RoleIntelligence,
  constraints: RoleConstraints
): string {
  const { min, max } = parseExperienceRange(constraints.experience_range);

  return `You are an expert talent sourcer.
Your job is to convert hiring strategy into actionable sourcing queries.

INPUT:

ROLE INTELLIGENCE:
Summary: ${intelligence.role_summary}
Relevant titles: ${intelligence.relevant_titles.join(', ')}
Core signals: ${intelligence.core_signals.join(', ')}
Culture signals: ${intelligence.culture_signals.join(', ')}
Target companies to source from: ${intelligence.target_companies.join(', ')}
Avoid sourcing from: ${intelligence.avoid_companies.join(', ')}
Company stage: ${intelligence.company_context.stage}
Product type: ${intelligence.company_context.product_type}
Customer type: ${intelligence.company_context.customer_type}

CONSTRAINTS:
Budget: ${constraints.budget_lpa} LPA
Location: ${constraints.location}
Experience: ${constraints.experience_range} → parsed as ${min}–${max} years

TASK:
Generate a sourcing strategy. Think like a recruiter who actually sources talent.

RULES:
- GitHub queries must be realistic and usable with GitHub User Search API syntax
- Queries must align with budget, location, and role context
- Avoid generic queries like "developer" — be specific
- db_filters.locations should include the primary city AND common variants (e.g. "Bangalore", "Bengaluru", "Remote India")
- db_filters.titles should match realistic job titles candidates use on their profiles
- db_filters.companies should target alumni from companies in target_companies
- reasoning must explain the trade-offs and choices, not just restate the facts

OUTPUT — return ONLY valid JSON with exactly this structure (no markdown fences):
{
  "strategy_summary": "2-3 sentences on how you will approach sourcing for this role",
  "github_queries": [
    "language:typescript location:bangalore followers:>20",
    "backend developer api location:india"
  ],
  "db_filters": {
    "locations": ["Bangalore", "Bengaluru", "Remote India"],
    "titles": ["Backend Engineer", "Software Engineer", "Platform Engineer"],
    "companies": ["Razorpay", "Slintel", "Chargebee"],
    "skills": ["TypeScript", "Node.js", "PostgreSQL"],
    "min_experience": ${min},
    "max_experience": ${max}
  },
  "target_talent_pools": [
    "Mid-stage SaaS companies in Bangalore",
    "Developers with active open-source API work"
  ],
  "reasoning": [
    "Targeting developers with API experience because the role owns integrations",
    "Focusing on Bangalore talent pool to match budget and avoid relocation costs",
    "Avoiding FAANG alumni — compensation expectations will exceed ${constraints.budget_lpa} LPA"
  ]
}`;
}
