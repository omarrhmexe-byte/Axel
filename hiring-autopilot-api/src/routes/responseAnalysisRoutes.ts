import { Router } from 'express';
import { handleAnalyzeResponse } from '../controllers/responseAnalysisController';

const router = Router();

router.post('/analyze-response', handleAnalyzeResponse);

export default router;
