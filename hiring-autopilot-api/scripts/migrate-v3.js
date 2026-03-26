/**
 * migrate-v3.js
 * Adds: company_research_briefs table (Manus research output storage)
 *
 * Run with: node scripts/migrate-v3.js
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

const SQL = `
-- ── company_research_briefs ───────────────────────────────────────────────────
-- Stores Manus deep-research output, reused across pipeline runs for the same role.
-- One brief per role (can have multiple research_types if needed in future).

CREATE TABLE IF NOT EXISTS company_research_briefs (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id         uuid        REFERENCES roles(id) ON DELETE CASCADE,
  company         text        NOT NULL,
  research_type   text        NOT NULL DEFAULT 'company',
  -- 'company' | 'role_context' | 'market'

  manus_task_id   text,                      -- Manus API task ID for debugging
  status          text        NOT NULL DEFAULT 'pending',
  -- 'pending' | 'running' | 'completed' | 'failed'

  raw_output      text,                      -- Full Manus markdown output
  summary         jsonb,                     -- Parsed key sections (optional)
  error           text,                      -- Error message if failed

  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  -- One company brief per role (prevent duplicate fetches)
  UNIQUE(role_id, research_type)
);

CREATE INDEX IF NOT EXISTS idx_research_briefs_role_id
  ON company_research_briefs(role_id);

CREATE INDEX IF NOT EXISTS idx_research_briefs_status
  ON company_research_briefs(status);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_research_brief_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_research_brief_updated_at ON company_research_briefs;
CREATE TRIGGER set_research_brief_updated_at
  BEFORE UPDATE ON company_research_briefs
  FOR EACH ROW EXECUTE FUNCTION update_research_brief_timestamp();
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    await client.query(SQL);
    console.log('✓ Migration v3 complete — company_research_briefs table created');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
