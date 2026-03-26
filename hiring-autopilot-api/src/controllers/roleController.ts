import type { Request, Response } from 'express';
import { createRole } from '../services/roleService';
import { logger } from '../utils/logger';
import type { RoleInput } from '../types';

export async function handleRoleIntelligence(req: Request, res: Response): Promise<void> {
  const input = req.body as RoleInput;

  logger.info('Generating role intelligence', {
    company: input.company,
    budget_lpa: input.constraints.budget_lpa,
  });

  const role = await createRole(input);

  logger.info('Role saved', { role_id: role.id });

  res.status(201).json(role);
}
