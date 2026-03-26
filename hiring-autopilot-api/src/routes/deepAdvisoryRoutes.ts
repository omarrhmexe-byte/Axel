import { Router }       from 'express';
import { z }             from 'zod';
import { validateBody }  from '../middleware/validateRequest';
import { handleDeepAdvisory } from '../controllers/deepAdvisoryController';
import { asyncHandler }  from '../utils/asyncHandler';

const router = Router();

const schema = z.object({
  role_id:      z.string().uuid(),
  candidate_id: z.string().uuid(),
  mode:         z.enum(['fast', 'deep']).optional().default('deep'),
});

/**
 * POST /deep-advisory
 *
 * Generate an enriched advisory for a candidate.
 *
 * mode=fast  → Claude only (~3–5s)
 * mode=deep  → Manus research + Claude synthesis (~2–5 min, cached after first run)
 *
 * Body: { role_id, candidate_id, mode? }
 */
router.post('/deep-advisory', validateBody(schema), asyncHandler(handleDeepAdvisory));

export default router;
