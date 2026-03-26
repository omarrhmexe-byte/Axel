// Migration v2: Supabase as durable system of record
// Run: node scripts/migrate-v2.js

const { Client } = require('pg');

const DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:db_is_not_free@db.egsczhhtwtviipieizch.supabase.co:5432/postgres';

const migrations = [
  {
    name: 'create role_strategy',
    sql: `
      CREATE TABLE IF NOT EXISTS role_strategy (
        id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id            uuid NOT NULL,
        pipeline_run_id    uuid,
        strategy_summary   text NOT NULL DEFAULT '',
        github_queries     jsonb NOT NULL DEFAULT '[]',
        db_filters         jsonb NOT NULL DEFAULT '{}',
        target_talent_pools jsonb NOT NULL DEFAULT '[]',
        reasoning          jsonb NOT NULL DEFAULT '[]',
        created_at         timestamptz DEFAULT now()
      )
    `,
  },
  {
    name: 'create feedback_events',
    sql: `
      CREATE TABLE IF NOT EXISTS feedback_events (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id    uuid,
        role_id         uuid,
        pipeline_run_id uuid,
        event_type      text NOT NULL,
        data            jsonb DEFAULT '{}',
        actor           text DEFAULT 'recruiter',
        created_at      timestamptz DEFAULT now()
      )
    `,
  },
  {
    name: 'create audit_log',
    sql: `
      CREATE TABLE IF NOT EXISTS audit_log (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        action      text NOT NULL,
        entity_type text,
        entity_id   uuid,
        data        jsonb DEFAULT '{}',
        actor       text DEFAULT 'system',
        created_at  timestamptz DEFAULT now()
      )
    `,
  },
  {
    name: 'alter pipeline_runs add strategy_id',
    sql: `ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS strategy_id uuid`,
  },
  {
    name: 'alter candidate_insights add pipeline_run_id',
    sql: `ALTER TABLE candidate_insights ADD COLUMN IF NOT EXISTS pipeline_run_id uuid`,
  },
  {
    name: 'alter candidate_insights add confidence_layer',
    sql: `ALTER TABLE candidate_insights ADD COLUMN IF NOT EXISTS confidence_layer text`,
  },
  {
    name: 'alter candidate_insights add status',
    sql: `ALTER TABLE candidate_insights ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'`,
  },
];

async function run() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database\n');

  let errors = 0;
  for (const m of migrations) {
    try {
      await client.query(m.sql);
      console.log(`  ✓  ${m.name}`);
    } catch (err) {
      console.error(`  ✗  ${m.name}: ${err.message}`);
      errors++;
    }
  }

  await client.end();
  console.log(`\n${errors === 0 ? 'Migration complete.' : `${errors} migration(s) failed.`}`);
  process.exit(errors > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
