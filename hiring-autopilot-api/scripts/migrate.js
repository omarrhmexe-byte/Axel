/**
 * One-shot migration runner.
 * Runs only the missing tables / columns — safe to re-run (idempotent).
 * Usage: node scripts/migrate.js
 */
const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const DB_URL = process.env.DATABASE_URL ||
  `postgresql://postgres.egsczhhtwtviipieizch:${process.env.DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

const SQL = `
-- candidate_insights
create table if not exists candidate_insights (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  summary text not null default '',
  signals text[] not null default '{}',
  experience text not null default '',
  strengths text[] not null default '{}',
  gaps text[] not null default '{}',
  alignment text check (alignment in ('strong_alignment','moderate_alignment','explore','no_fit')),
  match_reasons text[],
  concerns text[],
  motivation_signals text[],
  value_signals text[],
  card jsonb,
  advisory jsonb,
  created_at timestamptz default now(),
  unique(candidate_id, role_id)
);
create index if not exists idx_ci_role_id on candidate_insights(role_id);
create index if not exists idx_ci_alignment on candidate_insights(role_id, alignment);

-- pipeline_runs
create table if not exists pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','running','completed','failed')),
  headline text not null default 'Pipeline queued',
  steps jsonb not null default '[]',
  candidates_sourced integer not null default 0,
  candidates_analyzed integer not null default 0,
  candidates_matched integer not null default 0,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_pr_role_id on pipeline_runs(role_id);
create index if not exists idx_pr_status on pipeline_runs(status);

-- candidate_responses
create table if not exists candidate_responses (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  responses jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(candidate_id)
);
create index if not exists idx_cr_candidate_id on candidate_responses(candidate_id);

-- candidates: add missing columns
alter table candidates
  add column if not exists source text default 'supabase'
    check (source in ('supabase','github')),
  add column if not exists source_id text,
  add column if not exists derived_signals jsonb;

create unique index if not exists idx_candidates_source_source_id
  on candidates(source, source_id)
  where source_id is not null;
`;

async function run() {
  const client = new Client({ connectionString: DB_URL });
  try {
    await client.connect();
    console.log('✅ Connected to Supabase Postgres');
    await client.query(SQL);
    console.log('✅ Migration complete — all tables created');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
