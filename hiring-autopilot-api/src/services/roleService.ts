import { supabase } from '../config/supabase';
import { generateRoleIntelligence } from './claudeService';
import type { RoleInput, Role } from '../types';

export async function createRole(input: RoleInput): Promise<Role> {
  const intelligence = await generateRoleIntelligence(input);

  const { data, error } = await supabase
    .from('roles')
    .insert({
      company: input.company,
      role_prompt: input.role_prompt,
      constraints: input.constraints,
      intelligence,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save role: ${error.message}`);
  return data as Role;
}

export async function getRoleById(roleId: string): Promise<Role> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .single();

  if (error || !data) {
    throw new Error(`Role not found: ${roleId}`);
  }

  return data as Role;
}
