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

  // 1. Create the task
  const { task_id } = await createTask(prompt);

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

    // status is 'pending' or 'running' — keep polling
  }

  throw new Error(`Manus task timed out after ${(POLL_INTERVAL_MS * MAX_POLL_ATTEMPTS) / 1000}s`);
}
