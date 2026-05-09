/**
 * manusService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Thin HTTP client for the Manus research API.
 *
 * Manus is used as an optional deep-research layer.
 * It runs async tasks (web research, company enrichment, market context)
 * and returns structured markdown output.
 *
 * HOW IT WORKS:
 *   1. POST /tasks  → creates a research task, returns { task_id }
 *   2. GET  /tasks/:id → poll until status === 'completed' | 'failed'
 *   3. Result is in response.output (plain text / markdown)
 *
 * EDIT THIS FILE if:
 *   - The Manus API base URL changes
 *   - The request/response shape changes
 *   - You want to adjust poll timeout or interval
 */

import { env } from '../config/env';

// ── Manus system identity ─────────────────────────────────────────────────────
// This prefix is prepended to EVERY task sent to Manus.
// It defines Manus's role and strict operating rules inside Axel.
// EDIT HERE to change how Manus behaves across all research tasks.
const MANUS_SYSTEM_PREFIX = `You are Manus, the research layer inside an AI hiring system.

Your role is to gather relevant public information that improves hiring context.
You are NOT the decision-maker.
You do NOT evaluate final fit, rank candidates, or recommend hire / no hire.

Your job is limited to 4 research areas:
1. Company context
2. Role context
3. Target-company mapping
4. Public candidate evidence

STRICT RULES:
- Use only public, role-relevant information
- Do not speculate beyond the evidence
- Do not infer sensitive personal attributes
- Do not guess compensation, motivations, health, family, politics, religion, or other private details
- Do not make final hiring judgments
- Do not use vague fluff like "strong profile" or "great candidate"
- Do not produce long essays

When information is weak or missing, say so clearly.

Always separate output into:
1. Observed Facts
2. Reasonable Inferences
3. Unknowns

Only return information that helps with one of these next actions:
- refine the role brief
- identify relevant target companies
- enrich a candidate profile
- improve outreach relevance

If the requested research does not clearly support one of those actions, say:
"Insufficient reason to research this area."

---

RESEARCH TASK:
`;

// ── Config ────────────────────────────────────────────────────────────────────
// Update MANUS_BASE_URL if the Manus API endpoint changes
const MANUS_BASE_URL    = 'https://api.manus.im/api/v1';
const POLL_INTERVAL_MS  = 4000;   // 4 seconds between polls
const MAX_POLL_ATTEMPTS = 45;     // 45 × 4s = 3 minute timeout

// ── Types ─────────────────────────────────────────────────────────────────────
interface ManusTaskCreated {
  task_id: string;
}

interface ManusTaskStatus {
  task_id: string;
  status:  'pending' | 'running' | 'completed' | 'failed';
  output?: string;   // populated when status === 'completed'
  error?:  string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function manusHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${env.manusApiKey}`,
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTask(prompt: string): Promise<ManusTaskCreated> {
  const res = await fetch(`${MANUS_BASE_URL}/tasks`, {
    method:  'POST',
    headers: manusHeaders(),
    body:    JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Manus createTask failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<ManusTaskCreated>;
}

async function pollTask(taskId: string): Promise<ManusTaskStatus> {
  const res = await fetch(`${MANUS_BASE_URL}/tasks/${taskId}`, {
    headers: manusHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Manus pollTask failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<ManusTaskStatus>;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true if Manus is configured (MANUS_API_KEY set in .env).
 * Use this to gate deep advisory mode.
 */
export function isManusAvailable(): boolean {
  return !!env.manusApiKey;
}

/**
 * Run a Manus research task and return the output text.
 * Polls until the task completes or times out.
 *
 * @param prompt  The research instruction sent to Manus
 * @returns       Plain-text / markdown research output
 * @throws        On API error, task failure, or timeout
 */
export async function runManusResearch(prompt: string): Promise<string> {
  if (!env.manusApiKey) {
    throw new Error('MANUS_API_KEY not configured. Add it to .env to use deep advisory.');
  }

  // 1. Create the task. System prefix defines Manus's identity and rules.
  const { task_id } = await createTask(`${MANUS_SYSTEM_PREFIX}${prompt}`);

  // 2. Poll until done
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const status = await pollTask(task_id);

    if (status.status === 'completed') {
      if (!status.output) throw new Error(`Manus task ${task_id} completed with no output`);
      return status.output;
    }

    if (status.status === 'failed') {
      throw new Error(`Manus task ${task_id} failed: ${status.error ?? 'unknown error'}`);
    }

    // status is 'pending' or 'running', keep polling
  }

  throw new Error(`Manus task timed out after ${(POLL_INTERVAL_MS * MAX_POLL_ATTEMPTS) / 1000}s`);
}
