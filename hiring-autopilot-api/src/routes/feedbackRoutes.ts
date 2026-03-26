import { Router } from 'express';
import { handleRecordFeedback } from '../controllers/feedbackController';

const router = Router();

router.post('/feedback', (req, res, next) => {
  handleRecordFeedback(req, res).catch(next);
});

export default router;
