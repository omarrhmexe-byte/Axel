import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { WaitlistEntry } from '../types';

/**
 * Submits a waitlist entry directly to the Supabase `waitlist` table
 * using the public anon key (row-level security must allow inserts).
 */
export function useWaitlist() {
  return useMutation({
    mutationFn: async (entry: WaitlistEntry) => {
      const { error } = await supabase.from('waitlist').insert([entry]);
      if (error) throw new Error(error.message);
    },
  });
}
