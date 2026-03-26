import type { Request, Response } from 'express';
import { getRoleById } from '../services/roleService';
import { supabase } from '../config/supabase';
import type { AlignmentGroup, CandidateCard, AdvisoryOutput } from '../types';

interface PipelineEntry {
  candidate_name: string;
  summary: string;
  alignment: AlignmentGroup;
  match_reasons: string[];
  concerns: string[];
  card: CandidateCard | null;
  advisory: AdvisoryOutput | null;
}

type GroupedPipeline = Record<Exclude<AlignmentGroup, 'no_fit'>, PipelineEntry[]>;

export async function handleGetPipeline(req: Request, res: Response): Promise<void> {
  const role_id = req.query['role_id'] as string;

  if (!role_id) {
    res.status(400).json({ error: 'role_id query param is required' });
    return;
  }

  await getRoleById(role_id);

  const { data, error } = await supabase
    .from('candidate_insights')
    .select(`
      summary,
      alignment,
      match_reasons,
      concerns,
      card,
      advisory,
      candidates (
        name
      )
    `)
    .eq('role_id', role_id)
    .not('alignment', 'is', null)
    .neq('alignment', 'no_fit');

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const grouped: GroupedPipeline = {
    strong_alignment: [],
    moderate_alignment: [],
    explore: [],
  };

  for (const row of data ?? []) {
    const alignment = row.alignment as Exclude<AlignmentGroup, 'no_fit'>;
    if (!(alignment in grouped)) continue;

    grouped[alignment].push({
      candidate_name: (row.candidates as any)?.name ?? 'Unknown',
      summary: row.summary,
      alignment,
      match_reasons: row.match_reasons ?? [],
      concerns: row.concerns ?? [],
      card: (row.card as CandidateCard) ?? null,
      advisory: (row.advisory as AdvisoryOutput) ?? null,
    });
  }

  res.json(grouped);
}
