import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateRequest';
import { handleProcessCandidates } from '../controllers/candidateController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const processCandidatesSchema = z.object({
  role_id: z.string().uuid('role_id must be a valid UUID'),
});

router.post(
  '/process-candidates',
  validateBody(processCandidatesSchema),
  asyncHandler(handleProcessCandidates)
);

export default router;
