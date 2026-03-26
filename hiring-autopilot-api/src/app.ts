/**
 * app.ts — Express application setup
 * ──────────────────────────────────────────────────────────────────────────────
 * All routes are listed in the ROUTE_MANIFEST below.
 * GET /routes returns this manifest at runtime.
 *
 * EDIT THIS FILE to:
 *   - Add new route files
 *   - Adjust CORS origins
 *   - Change middleware order
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import roleRoutes         from './routes/roleRoutes';
import candidateRoutes    from './routes/candidateRoutes';
import pipelineRoutes     from './routes/pipelineRoutes';
import agentRoutes        from './routes/agentRoutes';
import conversationRoutes from './routes/conversationRoutes';
import feedbackRoutes     from './routes/feedbackRoutes';
import deepAdvisoryRoutes from './routes/deepAdvisoryRoutes';
import demoRoutes         from './routes/demoRoutes';
import { errorHandler }   from './middleware/errorHandler';
import { isManusAvailable } from './services/manusService';

const app = express();
const START_TIME = Date.now();

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://axelhq.vercel.app',
];

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin ?? '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods',  'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers',  'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use(express.json());

// ── Route manifest — visible at GET /routes ───────────────────────────────────
export const ROUTE_MANIFEST = [
  // ── Visibility ──
  { method: 'GET',  path: '/health',              description: 'Health check + service status'              },
  { method: 'GET',  path: '/routes',              description: 'List all available routes'                  },

  // ── Role ──
  { method: 'POST', path: '/role-intelligence',   description: 'Create a role with Claude-generated intelligence. Body: { company, role_prompt, constraints }' },

  // ── Pipeline ──
  { method: 'POST', path: '/run-pipeline',        description: 'Start autonomous pipeline. Returns run_id immediately (202). Body: { role_id }' },
  { method: 'GET',  path: '/pipeline-run/:runId', description: 'Poll pipeline status + step log. Returns candidates when complete.' },
  { method: 'GET',  path: '/pipeline',            description: 'Get grouped candidates for a role. Query: ?role_id=uuid' },

  // ── Candidates ──
  { method: 'POST', path: '/process-candidates',  description: 'Legacy: batch-process candidates for a role. Body: { role_id }' },

  // ── Advisory ──
  { method: 'POST', path: '/deep-advisory',       description: 'Generate advisory. mode=fast (Claude) or mode=deep (Manus+Claude). Body: { role_id, candidate_id, mode? }' },

  // ── Interview ──
  { method: 'POST', path: '/generate-questions',  description: 'Generate role-specific interview questions. Body: { role_id }' },
  { method: 'POST', path: '/candidate-responses', description: 'Store candidate Q&A responses. Body: { candidate_id, responses }' },

  // ── Feedback ──
  { method: 'POST', path: '/feedback',            description: 'Record recruiter feedback. Body: { candidate_id, role_id, event_type }. Events: thumbs_up | thumbs_down | advance | reject | note' },

  // ── Demo ──
  { method: 'POST', path: '/demo/seed',           description: 'Seed demo role + 3 preset candidates. Returns role_id for next steps.' },
  { method: 'GET',  path: '/demo/status',         description: 'Demo state overview. Query: ?role_id=uuid' },
];

// ── Health ─────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:          'ok',
    timestamp:       new Date().toISOString(),
    uptime_seconds:  Math.floor((Date.now() - START_TIME) / 1000),
    services: {
      claude: 'configured',
      supabase: 'configured',
      github: process.env['GITHUB_TOKEN'] ? 'configured' : 'unauthenticated (60 req/hr)',
      manus:  isManusAvailable() ? 'configured — deep advisory available' : 'not configured — fast advisory only',
    },
    routes_count: ROUTE_MANIFEST.length,
    hint: 'GET /routes for the full route list',
  });
});

// ── Route discovery ────────────────────────────────────────────────────────────
app.get('/routes', (_req, res) => {
  res.json({
    total:  ROUTE_MANIFEST.length,
    routes: ROUTE_MANIFEST,
    curl_examples: {
      health:         'curl http://localhost:3000/health',
      create_role:    'curl -X POST http://localhost:3000/role-intelligence -H "Content-Type: application/json" -d \'{"company":"Acme","role_prompt":"Senior backend engineer for payments","constraints":{"budget_lpa":"30-40","location":"Bangalore","experience_range":"4-8"}}\'',
      run_pipeline:   'curl -X POST http://localhost:3000/run-pipeline -H "Content-Type: application/json" -d \'{"role_id":"<uuid>"}\'',
      poll_pipeline:  'curl http://localhost:3000/pipeline-run/<run_id>',
      fast_advisory:  'curl -X POST http://localhost:3000/deep-advisory -H "Content-Type: application/json" -d \'{"role_id":"<uuid>","candidate_id":"<uuid>","mode":"fast"}\'',
      deep_advisory:  'curl -X POST http://localhost:3000/deep-advisory -H "Content-Type: application/json" -d \'{"role_id":"<uuid>","candidate_id":"<uuid>","mode":"deep"}\'',
      feedback:       'curl -X POST http://localhost:3000/feedback -H "Content-Type: application/json" -d \'{"role_id":"<uuid>","candidate_id":"<uuid>","event_type":"advance"}\'',
      demo_seed:      'curl -X POST http://localhost:3000/demo/seed',
      demo_status:    'curl "http://localhost:3000/demo/status?role_id=<uuid>"',
    },
  });
});

// ── Route registration ─────────────────────────────────────────────────────────
app.use('/', roleRoutes);
app.use('/', candidateRoutes);
app.use('/', pipelineRoutes);
app.use('/', agentRoutes);
app.use('/', conversationRoutes);
app.use('/', feedbackRoutes);
app.use('/', deepAdvisoryRoutes);   // POST /deep-advisory
app.use('/', demoRoutes);           // POST /demo/seed  GET /demo/status

// ── Global error handler — must be last ───────────────────────────────────────
app.use(errorHandler);

export default app;
