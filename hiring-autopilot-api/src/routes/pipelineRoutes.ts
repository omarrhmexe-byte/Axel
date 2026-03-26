import { Router } from 'express';
import { handleGetPipeline } from '../controllers/pipelineController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/pipeline', asyncHandler(handleGetPipeline));

export default router;
