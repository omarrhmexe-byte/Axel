# Axel — Hiring OS · Backend

> Express + TypeScript API. Orchestrates Claude (reasoning), Manus (research), GitHub (sourcing), and Supabase (storage).

---

## Quick start

```bash
cd hiring-autopilot-api
cp .env.example .env       # fill in keys
npm install
npm run dev                # starts on PORT=3000
```

Then verify:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/routes
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (full DB access) |
| `PORT` | — | Server port (default: 3000) |
| `GITHUB_TOKEN` | — | GitHub token (60 req/hr without) |
| `MANUS_API_KEY` | — | Manus research API key. If absent, deep advisory falls back to Claude-only |

---

## Folder structure

```
src/
├── app.ts                    ← Express setup, CORS, route registration, /health, /routes
├── index.ts                  ← Server entry point

├── config/
│   ├── env.ts                ← All env vars loaded here
│   ├── supabase.ts           ← Supabase client (service role)
│   └── demo.ts               ← Demo role + candidate data (EDIT to change demo)

├── routes/                   ← One file per domain
│   ├── agentRoutes.ts        ← /run-pipeline, /pipeline-run/:id
│   ├── roleRoutes.ts         ← /role-intelligence
│   ├── candidateRoutes.ts    ← /process-candidates, /pipeline
│   ├── pipelineRoutes.ts     ← /pipeline
│   ├── feedbackRoutes.ts     ← /feedback
│   ├── conversationRoutes.ts ← /generate-questions, /candidate-responses
│   ├── deepAdvisoryRoutes.ts ← /deep-advisory  ← NEW
│   └── demoRoutes.ts         ← /demo/seed, /demo/status  ← NEW

├── controllers/              ← Request handling, validation, response shaping
├── services/                 ← All business logic
│   ├── claudeService.ts      ← All Claude API calls
│   ├── manusService.ts       ← Manus research API client  ← NEW
│   ├── deepAdvisoryService.ts← Fast + deep advisory modes  ← NEW
│   ├── hiringAgent.ts        ← Pipeline orchestration (7 steps)
│   ├── advisorService.ts     ← Advisory generation + caching
│   ├── candidateService.ts   ← Candidate analysis + matching
│   ├── sourcingService.ts    ← GitHub + DB sourcing
│   ├── githubService.ts      ← GitHub API
│   ├── roleService.ts        ← Role CRUD
│   ├── feedbackService.ts    ← Feedback recording
│   ├── conversationService.ts← Interview Q&A
│   ├── candidateCardService.ts← UI card builder (pure function)
│   └── auditService.ts       ← Audit trail

├── prompts/                  ← EDIT THESE to change AI behaviour
│   ├── advisorPrompt.ts      ← HM advisory format + rules  ← EDIT
│   ├── roleIntelligencePrompt.ts ← Role analysis  ← EDIT
│   ├── candidateAnalysisPrompt.ts← Candidate signals  ← EDIT
│   ├── sourcingStrategyPrompt.ts ← GitHub queries  ← EDIT
│   ├── matchingPrompt.ts     ← Alignment scoring  ← EDIT
│   ├── questionPrompt.ts     ← Interview questions  ← EDIT
│   └── manusPrompts.ts       ← Manus research tasks  ← EDIT  ← NEW

├── types/                    ← TypeScript types
├── middleware/               ← errorHandler, validateRequest
└── utils/                    ← asyncHandler, logger
```

---

## Route list

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health + service status |
| GET | `/routes` | Full route list + curl examples |
| POST | `/role-intelligence` | Create role with Claude analysis |
| POST | `/run-pipeline` | Start autonomous pipeline (async, returns run_id) |
| GET | `/pipeline-run/:runId` | Poll pipeline status + step log |
| GET | `/pipeline` | Get candidates grouped by alignment |
| POST | `/deep-advisory` | Advisory: `mode=fast` (Claude) or `mode=deep` (Manus+Claude) |
| POST | `/generate-questions` | Role-specific interview questions |
| POST | `/candidate-responses` | Store candidate Q&A responses |
| POST | `/feedback` | Record recruiter feedback |
| POST | `/demo/seed` | Seed demo role + candidates |
| GET | `/demo/status` | Demo state overview |

---

## Supabase tables

| Table | Written by | Purpose |
|---|---|---|
| `roles` | `/role-intelligence` | Role + intelligence from Claude |
| `candidates` | `hiringAgent` step 4 | Normalized candidate profiles |
| `candidate_insights` | `hiringAgent` steps 5–7 | Analysis, matching, card, advisory |
| `pipeline_runs` | `hiringAgent` | Run status + step log |
| `role_strategy` | `hiringAgent` step 2 | Sourcing strategy from Claude |
| `candidate_responses` | `/candidate-responses` | Candidate interview answers |
| `feedback_events` | `/feedback` | Recruiter signals |
| `audit_logs` | `auditService` | Action trail |
| `company_research_briefs` | `deepAdvisoryService` | Manus research output (NEW) |

---

## Pipeline flow (end to end)

```
POST /role-intelligence
  └─ Claude: generateRoleIntelligence()
  └─ Supabase: INSERT roles

POST /run-pipeline (returns 202 immediately)
  └─ Background: runPipeline()
     │
     ├─ Step 1: Load role from Supabase
     ├─ Step 2: Claude → sourcing strategy → INSERT role_strategy
     ├─ Step 3: GitHub API + Supabase → fetch + deduplicate candidates
     ├─ Step 4: INSERT/UPDATE candidates (upsert by source+source_id)
     ├─ Step 5: Claude → analyze each candidate → INSERT candidate_insights
     ├─ Step 6: Claude → match to alignment group → UPDATE candidate_insights
     └─ Step 7: Build UI cards + Claude advisory → UPDATE candidate_insights

GET /pipeline-run/:runId  (poll until status=completed)

POST /deep-advisory  (optional — enriches advisory with Manus)
  ├─ mode=fast → Claude only
  └─ mode=deep → Manus research → store in company_research_briefs → Claude synthesis

POST /feedback  (advance / reject / thumbs_up / thumbs_down)
  └─ INSERT feedback_events → UPDATE candidate_insights.status
```

---

## Where to edit the product

| What to change | Where |
|---|---|
| **Landing page copy** | `axel-frontend/src/components/home/` |
| **Hero text** | `axel-frontend/src/components/home/HeroSection.tsx` |
| **Simulation copy** | `axel-frontend/src/components/simulation/AxelSimulation.tsx` |
| **Advisory Claude prompt** | `src/prompts/advisorPrompt.ts` |
| **Outreach format** | Built inside `claudeService.ts` → `generateAdvisory()` |
| **Candidate analysis prompt** | `src/prompts/candidateAnalysisPrompt.ts` |
| **Sourcing strategy** | `src/prompts/sourcingStrategyPrompt.ts` |
| **Interview questions** | `src/prompts/questionPrompt.ts` |
| **Manus research tasks** | `src/prompts/manusPrompts.ts` |
| **Demo role + candidates** | `src/config/demo.ts` |
| **Workflow steps** | `src/services/hiringAgent.ts` → `runPipeline()` |

---

## Sample curl commands

### Health check
```bash
curl http://localhost:3000/health
```

### Create a role
```bash
curl -X POST http://localhost:3000/role-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Acme Corp",
    "role_prompt": "Senior backend engineer for payments infrastructure.",
    "constraints": {
      "budget_lpa": "30-40",
      "location": "Bangalore, India",
      "experience_range": "4-8"
    }
  }'
```

### Run the pipeline
```bash
curl -X POST http://localhost:3000/run-pipeline \
  -H "Content-Type: application/json" \
  -d '{"role_id": "<uuid from above>"}'
```

### Poll pipeline status
```bash
curl http://localhost:3000/pipeline-run/<run_id>
```

### Get pipeline results
```bash
curl "http://localhost:3000/pipeline?role_id=<uuid>"
```

### Fast advisory (Claude only)
```bash
curl -X POST http://localhost:3000/deep-advisory \
  -H "Content-Type: application/json" \
  -d '{"role_id": "<uuid>", "candidate_id": "<uuid>", "mode": "fast"}'
```

### Deep advisory (Manus + Claude — requires MANUS_API_KEY)
```bash
curl -X POST http://localhost:3000/deep-advisory \
  -H "Content-Type: application/json" \
  -d '{"role_id": "<uuid>", "candidate_id": "<uuid>", "mode": "deep"}'
```

### Submit feedback
```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -d '{"role_id": "<uuid>", "candidate_id": "<uuid>", "event_type": "advance"}'
```

---

## Demo flow (for client demos)

```bash
# Step 1 — Seed demo data
curl -X POST http://localhost:3000/demo/seed

# Returns: { role_id, candidates_seeded, next_step }

# Step 2 — Run the pipeline
curl -X POST http://localhost:3000/run-pipeline \
  -d '{"role_id": "<role_id from step 1>"}'

# Returns: { run_id }

# Step 3 — Poll until complete (status=completed takes ~2-4 min)
curl http://localhost:3000/pipeline-run/<run_id>

# Step 4 — Check full demo state
curl "http://localhost:3000/demo/status?role_id=<role_id>"

# Step 5 — Deep advisory on top candidate
curl -X POST http://localhost:3000/deep-advisory \
  -d '{"role_id":"<role_id>","candidate_id":"<top_candidate_id>","mode":"deep"}'

# Step 6 — Advance top candidate
curl -X POST http://localhost:3000/feedback \
  -d '{"role_id":"<role_id>","candidate_id":"<top_candidate_id>","event_type":"advance"}'
```

---

## Running database migrations

```bash
# Initial schema
node scripts/migrate.js

# V2 (role_strategy, pipeline_runs)
node scripts/migrate-v2.js

# V3 (company_research_briefs — Manus output)
node scripts/migrate-v3.js
```
