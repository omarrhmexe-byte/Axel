import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { getRoleById } from '../services/roleService';
import {
  generateQuestions,
  storeCandidateResponses,
} from '../services/conversationService';

const router = Router();

// ─── POST /generate-questions ─────────────────────────────────────────────────
// Generate interview questions for a role. Returns 5–7 questions with purpose notes.

const generateQuestionsSchema = z.object({
  role_id: z.string().uuid(),
});

router.post(
  '/generate-questions',
  validateBody(generateQuestionsSchema),
  asyncHandler(async (req, res) => {
    const { role_id } = req.body as { role_id: string };
    const role = await getRoleById(role_id);
    const questions = await generateQuestions(role.intelligence);
    res.json({ role_id, questions });
  })
);

// ─── POST /candidate-responses ────────────────────────────────────────────────
// Store a candidate's interview responses. Picked up automatically on next analysis.

const candidateResponsesSchema = z.object({
  candidate_id: z.string().uuid(),
  responses: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ).min(1),
});

router.post(
  '/candidate-responses',
  validateBody(candidateResponsesSchema),
  asyncHandler(async (req, res) => {
    const { candidate_id, responses } = req.body;
    await storeCandidateResponses(candidate_id, responses);
    res.status(201).json({
      candidate_id,
      stored: responses.length,
      message: 'Responses stored. They will be used in the next candidate analysis.',
    });
  })
);

export default router;
