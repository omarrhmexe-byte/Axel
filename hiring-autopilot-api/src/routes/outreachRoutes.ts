import { Router }      from 'express';
import { z }           from 'zod';
import { validateBody } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { handleGenerateOutreach } from '../controllers/outreachController';

const router = Router();

/**
 * POST /generate-outreach
 * Generate a personalized outreach message for a candidate.
 * Body: { role_id, candidate_id }
 */
router.post(
  '/generate-outreach',
  validateBody(z.object({ role_id: z.string().uuid(), candidate_id: z.string().uuid() })),
  asyncHandler(handleGenerateOutreach),
);

export default router;
