/**
 * responseAnalysisController.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * POST /analyze-response
 *
 * Evaluates a candidate's reply to the outreach question.
 * Returns signal quality, what was learned, gaps, and a next-step decision.
 *
 * Body: { role_id, candidate_id, question, response }
 */

import type { Request, Response } from 'express';
import Anthropic   from '@anthropic-ai/sdk';
import { z }       from 'zod';
import { env }     from '../config/env';
import { supabase } from '../config/supabase';
import { buildResponseAnalysisPrompt } from '../prompts/responseAnalysisPrompt';
import type { ResponseAnalysisOutput } from '../types';

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

const BodySchema = z.object({
  role_id:      z.string().uuid(),
  candidate_id: z.string().uuid(),
  question:     z.string().min(1),
  response:     z.string().min(1),
});

export async function handleAnalyzeResponse(req: Request, res: Response) {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { role_id, candidate_id, question, response } = parsed.data;

  // Load role intelligence
  const { data: role } = await supabase
    .from('roles')
    .select('intelligence')
    .eq('id', role_id)
    .maybeSingle();

  if (!role?.intelligence) {
    res.status(404).json({ error: 'Role not found' });
    return;
  }

  const prompt = buildResponseAnalysisPrompt(role.intelligence, question, response);

  const message = await anthropic.messages.create({
    model:      'claude-opus-4-6',
    max_tokens: 512,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text   = (message.content[0] as { type: string; text: string }).text.trim();
  const raw    = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  const result = JSON.parse(raw) as ResponseAnalysisOutput;

  // Store the response text in candidate_responses table for the record
  await supabase
    .from('candidate_responses')
    .upsert({
      candidate_id,
      role_id,
      question,
      answer: response,
    })
    .eq('candidate_id', candidate_id)
    .eq('role_id', role_id);

  res.json({
    candidate_id,
    role_id,
    analysis: result,
  });
}
