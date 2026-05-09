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
 *
 * ── 4-Dimension Signal Framework ─────────────────────────────────────────────
 * All research must map back to these four signal dimensions:
 *
 *   01  AMBITION ALIGNMENT
 *       Does the candidate's career trajectory and ambition match where
 *       this company is going? Not just "can they do the job". Do they
 *       WANT what this role offers them 3 years from now?
 *
 *   02  TALENT CONSTRAINTS
 *       How does this candidate operate? What motivates their next move?
 *       What kind of approach will actually land with them?
 *       (This is the headhunting layer, critical for outreach strategy.)
 *
 *   03  SYSTEMS ALIGNMENT
 *       Stack, domain, industry fit. Can they plug in to the technical
 *       environment without a steep ramp? Not gatekeeping. Assessing cost
 *       of onboarding vs. value of their other signals.
 *
 *   04  DECISION SIGNALS
 *       Has this candidate already made high-stakes decisions similar to
 *       what this role demands? Building from zero, handling scale,
 *       owning a function, making a hire. Evidence of prior decisions
 *       predicts future ones far better than stated intent.
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
 * Manus uses this to build context for evaluating AMBITION ALIGNMENT:
 * does a candidate's ambition fit the actual trajectory of this company?
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
   - Is this a narrow wedge or a platform play?

2. COMPANY TRAJECTORY (critical for Ambition Alignment)
   - Current stage: ${input.stage ?? 'unknown, find out'}
   - Recent funding, growth signals, or notable milestones
   - What will the company look like in 3 years if things go well?
   - What kind of engineer ambition does this company actually reward?
   - Any press coverage or product launches in the past 12 months

3. ENGINEERING CULTURE
   - What does their engineering team focus on technically?
   - Any public info about tech stack, open source work, engineering blog?
   - What kind of problems are engineers solving there?
   - Is this a "build fast and break things" or "reliability first" culture?

4. WHY JOIN: Ambition Alignment for a "${input.role}" candidate
   - What's genuinely exciting about joining ${input.company} in this role?
   - What would be hard, ambiguous, or high stakes about the role?
   - What kind of engineer thrives there vs struggles?
   - What can this engineer own here that they cannot own elsewhere right now?
   - What narrative can they tell about this company in 3 years when they look back?

5. TALENT CONSTRAINTS: what moves engineers to join
   - What kind of engineers typically join this type of company?
   - What are the trigger points that make someone leave their current job for this?
   - What objections will a target candidate have about joining?
   - Are candidates here typically active job-seekers or passive?

6. TEAM & LEADERSHIP
   - Who are the founders or key leaders?
   - Any signals about engineering leadership quality?
   - What does the team culture seem to value?
   - Are engineers given ownership or are they execution resources?

Return your findings as a structured report with clear sections.
Be specific. Avoid generic statements like "fast-growing company" without evidence.
Map each finding back to whether it helps or hurts AMBITION ALIGNMENT for a "${input.role}" hire.
If you can't find reliable information about something, say so clearly.`;
}

/**
 * Role-context enrichment prompt.
 * Used when the role description is thin. Manus adds market context.
 *
 * This also provides SYSTEMS ALIGNMENT context: what stack/domain is
 * typical for this role, and what does the market signal about candidate pools.
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
7. What does a Systems Alignment failure look like for this hire? (stack mismatch, domain mismatch)
8. What past decisions (Decision Signals) best predict success in this role?

Be specific to the "${input.role}" function and the "${input.company}" context.
Avoid generic career advice. Focus on what a sharp hiring manager would want to know.`;
}

/**
 * Candidate headhunting strategy prompt.
 * Used when preparing outreach or evaluating passive candidates.
 *
 * Maps directly to TALENT CONSTRAINTS: how this specific candidate operates,
 * what kind of opportunity actually moves them, and how to approach them.
 *
 * Used by: deep-advisory mode (per-candidate enrichment)
 */
export function buildHeadhuntingStrategyPrompt(input: {
  candidateName: string;
  candidateHeadline: string;
  currentCompany: string;
  targetCompany: string;
  targetRole: string;
  candidateSummary: string;
}): string {
  return `You are a senior headhunter building a targeting strategy for a specific candidate.

CANDIDATE: ${input.candidateName}
CURRENT ROLE: ${input.candidateHeadline} at ${input.currentCompany}
TARGET: ${input.targetRole} at ${input.targetCompany}

WHAT WE KNOW ABOUT THEM:
${input.candidateSummary}

Research this candidate and build a headhunting strategy across 4 dimensions:

01 AMBITION ALIGNMENT
   - What career trajectory is this person likely on?
   - What would they want their career to look like in 3 years?
   - Does the "${input.targetRole}" role at "${input.targetCompany}" fit that arc?
   - What is the ambition gap? Is this a step up, lateral, or down for them?

02 TALENT CONSTRAINTS
   - How do engineers like this typically make job decisions?
   - What would make them seriously consider leaving ${input.currentCompany}?
   - What objections are they most likely to have about this role?
   - Are they likely to be actively looking or passively open?
   - What channel/approach is most likely to land (cold email, LinkedIn, mutual intro)?
   - What opening message would NOT work and why?

03 SYSTEMS ALIGNMENT
   - Does their stack (if known) transfer cleanly to this role?
   - What domain knowledge do they have that directly applies?
   - What would they need to ramp up on? Is that a feature or a bug for them?

04 DECISION SIGNALS
   - What past decisions has this person made that predict readiness for this role?
   - Have they built from zero before? Owned a system? Made a hire?
   - What is the most compelling evidence they can handle this role's specific demands?
   - What is the strongest counterargument, and how should it be addressed?

Return a structured brief. Be direct and specific.
Avoid vague advice like "reach out on LinkedIn". Give a specific angle, subject line suggestion, and 2–3 questions to open the conversation.`;
}
