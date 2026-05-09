import * as dotenv from 'dotenv';
import * as path from 'path';

// Try loading .env from multiple locations for different launch contexts
const envPaths = [
  path.resolve(__dirname, '../../.env'),   // from dist/config/ → project root
  path.resolve(process.cwd(), '.env'),      // from cwd (npm run start in project root)
];
for (const p of envPaths) {
  const result = dotenv.config({ path: p });
  if (!result.error) break;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  anthropicApiKey:       requireEnv('ANTHROPIC_API_KEY'),
  supabaseUrl:           requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey:requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  port:                  parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv:               process.env['NODE_ENV'] ?? 'development',
  githubToken:           process.env['GITHUB_TOKEN'] ?? null,
  // Manus — optional. If absent, deep-advisory falls back to Claude-only.
  manusApiKey:           process.env['MANUS_API_KEY'] ?? null,
};
