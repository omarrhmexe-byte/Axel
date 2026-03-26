/**
 * deepAdvisoryService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Two advisory modes:
 *
 *   FAST   → Claude only. Uses existing candidate signals.
 *            Available: always. Response time: ~3–5s.
 *
 *   DEEP   → Manus research first, then Claude synthesis.
 *            Manus enriches company/role context before the advisory is written.
 *            Available: when MANUS_API_KEY is set in .env.
 *            Response time: 2–5 min (Manus research is async).
 *
 * HOW TO EDIT:
 *   - Change the advisory Claude prompt → src/prompts/advisorPrompt.ts
 *   - Change what Manus researches → src/prompts/manusPrompts.ts
 *   - Change caching behaviour → edit checkBriefCache() below
 */

import { supabase }               from '../config/supabase';
import { generateAdvisory }       from './claudeService';
import { runManusResearch, isManusAvailable } from './manusService';
import { buildCompanyResearchPrompt }          from '../prompts/manusPrompts';
import type { CandidateInsight, RoleIntelligence, AdvisoryOutput } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DeepAdvisoryResult {
  advisory:         AdvisoryOutput;
  mode:             'fast' | 'deep';
  manus_brief_id?:  string;   // set when Manus was used
  manus_available:  boolean;
}

// ── Brief cache ───────────────────────────────────────────────────────────────
/**
 * Returns a cached Manus brief for this role if one exists and is completed.
 * Prevents re-running expensive Manus research for the same role.
 */
async function checkBriefCache(roleId: string): Promise<{ id: string; raw_output: string } | null> {
  const { data } = await supabase
    .from('company_research_briefs')
    .select('id, raw_output')
    .eq('role_id', roleId)
    .eq('research_type', 'company')
    .eq('status', 'completed')
    .maybeSingle();

  return data as { id: string; raw_output: string } | null;
}

/**
 * Creates a pending brief row, runs Manus research, updates with result.
 * Returns the brief ID and raw output.
 */
async function runManusBrief(
  roleId:  string,
  company: string,
  role:    string,
  stage?:  string
): Promise<{ id: string; raw_output: string }> {
  // Insert pending row
  const { data: brief, error: insertErr } = await supabase
    .from('company_research_briefs')
    .insert({
      role_id:       roleId,
      company,
      research_type: 'company',
      status:        'running',
    })
    .select('id')
    .single();

  if (insertErr || !brief) throw new Error(`Failed to create research brief: ${insertErr?.message}`);

  try {
    const prompt  = buildCompanyResearchPrompt({ company, role, stage });
    const output  = await runManusResearch(prompt);

    await supabase
      .from('company_research_briefs')
      .update({ status: 'completed', raw_output: output })
      .eq('id', brief.id);

    return { id: brief.id, raw_output: output };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase
      .from('company_research_briefs')
      .update({ status: 'failed', error: msg })
      .eq('id', brief.id);
    throw err;
  }
}

// ── Public functions ──────────────────────────────────────────────────────────

/**
 * FAST ADVISORY — Claude only, using existing insight signals.
 * Identical to the standard pipeline advisory.
 */
export async function fastAdvisory(
  insight:          CandidateInsight,
  roleIntelligence: RoleIntelligence
): Promise<DeepAdvisoryResult> {
  const advisory = await generateAdvisory(insight, roleIntelligence);
  return {
    advisory,
    mode:            'fast',
    manus_available: isManusAvailable(),
  };
}

/**
 * DEEP ADVISORY — Manus research + Claude synthesis.
 *
 * 1. Checks cache for an existing completed brief for this role
 * 2. If none → runs Manus research (2–5 min), stores in company_research_briefs
 * 3. Injects Manus output into the advisor Claude prompt
 * 4. Returns enriched advisory
 *
 * Falls back to fast advisory if Manus is not configured.
 */
export async function deepAdvisory(
  insight:          CandidateInsight,
  roleIntelligence: RoleIntelligence,
  roleId:           string,
  company:          string
): Promise<DeepAdvisoryResult> {
  if (!isManusAvailable()) {
    console.warn('[deepAdvisory] Manus not configured — falling back to fast advisory');
    return fastAdvisory(insight, roleIntelligence);
  }

  // Check cache first
  let brief = await checkBriefCache(roleId);

  if (!brief) {
    // Run Manus research (expensive — 2–5 min)
    brief = await runManusBrief(
      roleId,
      company,
      roleIntelligence.role_summary ?? 'Software Engineer',
      roleIntelligence.company_context?.stage
    );
  }

  // Inject Manus context into the role intelligence object
  // Claude will see this as additional role/company context in the advisory prompt
  const enrichedIntelligence: RoleIntelligence = {
    ...roleIntelligence,
    // Append Manus research to the role summary so the advisor prompt picks it up
    role_summary: `${roleIntelligence.role_summary}

──── MANUS COMPANY RESEARCH ────
${brief.raw_output}
─────────────────────────────────`,
  };

  const advisory = await generateAdvisory(insight, enrichedIntelligence);

  return {
    advisory,
    mode:            'deep',
    manus_brief_id:  brief.id,
    manus_available: true,
  };
}
