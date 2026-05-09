import type { Request, Response } from 'express';
import Anthropic  from '@anthropic-ai/sdk';
import { env }    from '../config/env';
import { supabase } from '../config/supabase';
import { buildOutreachPrompt } from '../prompts/outreachPrompt';

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

export async function handleGenerateOutreach(req: Request, res: Response) {
  const { role_id, candidate_id } = req.body as { role_id: string; candidate_id: string };

  const [{ data: role }, { data: insight }, { data: candidate }] = await Promise.all([
    supabase.from('roles').select('company, intelligence').eq('id', role_id).maybeSingle(),
    supabase.from('candidate_insights').select('*').eq('role_id', role_id).eq('candidate_id', candidate_id).maybeSingle(),
    supabase.from('candidates').select('name').eq('id', candidate_id).maybeSingle(),
  ]);

  if (!role)    { res.status(404).json({ error: 'Role not found' });                                     return; }
  if (!insight) { res.status(404).json({ error: 'Candidate insight not found. Run pipeline first.' });   return; }

  const prompt = buildOutreachPrompt(
    insight,
    role.intelligence,
    candidate?.name ?? 'Candidate',
    role.company,
    insight.advisory ?? undefined,   // inject advisory signals if pipeline ran
  );

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6', max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text   = (message.content[0] as { type: string; text: string }).text.trim();
  const parsed = JSON.parse(text) as { subject: string; body: string };

  res.json({ candidate_id, role_id, ...parsed });
}
