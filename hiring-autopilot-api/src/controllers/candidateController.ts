import type { Request, Response } from 'express';
import { getRoleById } from '../services/roleService';
import {
  analyzeCandidate,
  matchCandidate,
  getAllCandidates,
} from '../services/candidateService';
import { logger } from '../utils/logger';

export async function handleProcessCandidates(req: Request, res: Response): Promise<void> {
  const { role_id } = req.body as { role_id: string };

  logger.info('Processing candidates', { role_id });

  // 1. Fetch role and its intelligence
  const role = await getRoleById(role_id);

  // 2. Fetch all candidates
  const candidates = await getAllCandidates();

  if (candidates.length === 0) {
    res.json({ role_id, processed: 0, message: 'No candidates found' });
    return;
  }

  const results = [];

  for (const candidate of candidates) {
    try {
      // 3. Analyze candidate (skips if already done)
      const insight = await analyzeCandidate(candidate, role.intelligence, role_id);

      // 4. Run match
      const matched = await matchCandidate(insight, role.intelligence);

      results.push({
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        alignment: matched.alignment,
        match_reasons: matched.match_reasons,
        concerns: matched.concerns,
      });

      logger.info('Candidate processed', { candidate_id: candidate.id, alignment: matched.alignment });
    } catch (err) {
      logger.error('Failed to process candidate', { candidate_id: candidate.id, err });
      // Continue processing remaining candidates on individual failure
    }
  }

  res.json({ role_id, processed: results.length, results });
}
