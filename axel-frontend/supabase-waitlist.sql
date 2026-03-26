-- ── Waitlist table ───────────────────────────────────────────────────────────
-- Run this in the Supabase SQL editor (or add to your existing schema).
-- Enable Row Level Security, then add a policy allowing public inserts.

CREATE TABLE IF NOT EXISTS waitlist (
  id                       UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email                    TEXT        NOT NULL,
  company_name             TEXT        NOT NULL,
  role                     TEXT        NOT NULL,
  budget_lpa               NUMERIC,
  location                 TEXT,
  experience_range         TEXT,
  company_description      TEXT,
  why_autopilot            TEXT,
  growth_rate              TEXT,
  hiring_manager_ambition  TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: allow anonymous inserts from the frontend (anon key)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts"
  ON waitlist FOR INSERT
  TO anon
  WITH CHECK (true);

-- Optional: only Supabase service role can read
CREATE POLICY "Service role reads"
  ON waitlist FOR SELECT
  TO service_role
  USING (true);
