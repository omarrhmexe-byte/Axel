import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn('[Axel] Supabase env vars missing — waitlist submissions will fail.');
}

export const supabase = createClient(url ?? '', key ?? '');
