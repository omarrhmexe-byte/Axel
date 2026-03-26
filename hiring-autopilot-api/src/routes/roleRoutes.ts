import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateRequest';
import { handleRoleIntelligence } from '../controllers/roleController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const roleIntelligenceSchema = z.object({
  company: z.string().min(1),
  role_prompt: z.string().min(10),
  constraints: z.object({
    budget_lpa: z.number().positive(),
    location: z.string().min(1),
    experience_range: z.string().min(1),
  }),
});

router.post(
  '/role-intelligence',
  validateBody(roleIntelligenceSchema),
  asyncHandler(handleRoleIntelligence)
);

export default router;
