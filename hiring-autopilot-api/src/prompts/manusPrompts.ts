/**
 * manusPrompts.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Research prompts sent to Manus for deep enrichment.
 *
 * EDIT THIS FILE to change what Manus researches.
 * Each function returns a plain-English research instruction.
 *
 * Manus will browse the web, aggregate sources, and return a rich
 * structured output that Claude then synthesises into the advisory.
 */

export interface ManusResearchInput {
  company:    string;
  role:       string;
  stage?:     string;   // e.g. "Series A", "Seed", "Growth"
  location?:  string;
}

/**
 * Deep company research prompt.
 * Covers: product, market position, team culture, recent news, why join.
 *
 * Used by: deep-advisory mode
 * Stored in: company_research_briefs table
 */
export function buildCompanyResearchPrompt(input: ManusResearchInput): string {
  return `Research the company "${input.company}" thoroughly. Focus on:

1. PRODUCT & MARKET
   - What exactly does ${input.company} build and who uses it?
   - What market are they in and how large is the opportunity?
   - Who are their main competitors and how do they differentiate?

2. COMPANY CONTEXT
   - Current stage: ${input.stage ?? 'unknown — find out'}
   - Recent funding, growth signals, or notable milestones
   - Any press coverage or product launches in the past 12 months

3. ENGINEERING CULTURE
   - What does their engineering team focus on technically?
   - Any public info about tech stack, open source work, engineering blog?
   - What kind of problems are engineers solving there?

4. WHY JOIN — for a "${input.role}" candidate
   - What's genuinely exciting about joining ${input.company} in this role?
   - What would be hard, ambiguous, or high stakes about the role?
   - What kind of engineer thrives there vs struggles?

5. TEAM & LEADERSHIP
   - Who are the founders or key leaders?
   - Any signals about engineering leadership quality?
   - What does the team culture seem to value?

Return your findings as a structured report with clear sections.
Be specific — avoid generic statements like "fast-growing company" without evidence.
If you can't find reliable information about something, say so clearly.`;
}

/**
 * Role-context enrichment prompt.
 * Used when the role description is thin — Manus adds market context.
 *
 * Used by: deep-advisory mode (supplementary)
 */
export function buildRoleContextPrompt(input: ManusResearchInput): string {
  return `Research the market context for hiring a "${input.role}" at a company like "${input.company}".

Focus on:
1. What does this role typically own at a ${input.stage ?? 'startup'}-stage company?
2. What signals matter most when evaluating candidates for this role?
3. What are the common failure modes for this hire?
4. What compensation is realistic for this role in ${input.location ?? 'India'}?
5. What are the top 3–5 companies candidates for this role are likely coming from?
6. What questions reveal the most about a candidate's readiness for this role?

Be specific to the "${input.role}" function and the "${input.company}" context.
Avoid generic career advice. Focus on what a sharp hiring manager would want to know.`;
}
