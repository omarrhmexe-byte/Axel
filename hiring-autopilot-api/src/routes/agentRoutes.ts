import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateRequest';
import { handleRunPipeline, handleGetPipelineRun } from '../controllers/agentController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const runPipelineSchema = z.object({
  role_id: z.string().uuid('role_id must be a valid UUID'),
});

// Trigger autonomous pipeline — returns run_id immediately (202 Accepted)
router.post(
  '/run-pipeline',
  validateBody(runPipelineSchema),
  asyncHandler(handleRunPipeline)
);

// Poll pipeline run status and step log
router.get(
  '/pipeline-run/:runId',
  asyncHandler(handleGetPipelineRun)
);

export default router;
