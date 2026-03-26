import { Router }          from 'express';
import { asyncHandler }    from '../utils/asyncHandler';
import { handleDemoSeed, handleDemoStatus } from '../controllers/demoController';

const router = Router();

/**
 * POST /demo/seed
 * Creates the demo role (calls Claude) + inserts 3 pre-set candidates.
 * Returns role_id for next steps.
 */
router.post('/demo/seed', asyncHandler(handleDemoSeed));

/**
 * GET /demo/status?role_id=<uuid>
 * Returns current state of the demo: pipeline run, candidates, briefs.
 */
router.get('/demo/status', asyncHandler(handleDemoStatus));

export default router;
