-- Run this in your Supabase SQL editor to set up the required tables.

-- Roles table: stores the input + Claude-generated role intelligence
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role_prompt text not null,
  constraints jsonb not null,
  intelligence jsonb not null,
  created_at timestamptz default now()
);

-- Candidates table: raw candidate profiles (populate this before processing)
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  current_title text not null,
  current_company text not null,
  years_of_experience integer not null,
  location text not null,
  skills text[] not null default '{}',
  work_history jsonb not null default '[]',
  education text,
  notes text,
  created_at timestamptz default now()
);

-- Candidate insights: Claude's analysis + match result per candidate per role
create table if not exists candidate_insights (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  -- Analysis fields
  summary text not null,
  signals text[] not null default '{}',
  experience text not null,
  strengths text[] not null default '{}',
  gaps text[] not null default '{}',
  -- Match fields (populated after matchCandidate runs)
  -- alignment replaces the old boolean fit field
  alignment text check (alignment in ('strong_alignment', 'moderate_alignment', 'explore', 'no_fit')),
  match_reasons text[],
  concerns text[],
  created_at timestamptz default now(),
  -- Ensure one insight per candidate per role
  unique(candidate_id, role_id)
);

-- Indexes for common query patterns
create index if not exists idx_candidate_insights_role_id on candidate_insights(role_id);
create index if not exists idx_candidate_insights_alignment on candidate_insights(role_id, alignment);

-- ─── Migration: Autonomous Workflow Engine ────────────────────────────────────

-- Add source tracking + derived signals to candidates (idempotent)
alter table candidates
  add column if not exists source text default 'supabase'
    check (source in ('supabase', 'github')),
  add column if not exists source_id text,
  add column if not exists derived_signals jsonb;
-- derived_signals shape: { primary_languages, repo_complexity, open_source_activity, backend_experience }

-- Unique index for upsert deduplication per source
-- Partial index: only applies when source_id is set (legacy rows have source_id = null)
create unique index if not exists idx_candidates_source_source_id
  on candidates (source, source_id)
  where source_id is not null;

-- Pipeline runs: tracks each autonomous pipeline execution
create table if not exists pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed')),
  -- Array of WorkflowStep objects: { step, status, message, timestamp, meta? }
  -- headline: human-readable summary generated at pipeline completion
  -- e.g. "14 candidates sourced · 3 strong · 5 moderate · 2 explore → 10 worth reviewing"
  headline text not null default 'Pipeline queued',
  steps jsonb not null default '[]',
  candidates_sourced integer not null default 0,
  candidates_analyzed integer not null default 0,
  candidates_matched integer not null default 0,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_pipeline_runs_role_id on pipeline_runs(role_id);
create index if not exists idx_pipeline_runs_status on pipeline_runs(status);

-- ─── Migration: Intelligence Layers ──────────────────────────────────────────

-- candidate_insights: add enriched signal columns + presentation layer columns
alter table candidate_insights
  add column if not exists motivation_signals text[],
  add column if not exists value_signals      text[],
  -- card: CandidateCard jsonb { name, headline, alignment, sections }
  add column if not exists card               jsonb,
  -- advisory: AdvisoryOutput jsonb { quick_take, why_interesting, ... }
  add column if not exists advisory           jsonb;

-- candidate_responses: stores interview responses per candidate
-- One row per candidate (upsert on conflict). Responses are role-agnostic.
create table if not exists candidate_responses (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  -- Array of { question: string, answer: string }
  responses    jsonb not null default '[]',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(candidate_id)
);

create index if not exists idx_candidate_responses_candidate_id
  on candidate_responses(candidate_id);
