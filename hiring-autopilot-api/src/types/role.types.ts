export interface RoleConstraints {
  budget_lpa: number;
  location: string;
  experience_range: string;
}

export interface RoleInput {
  company: string;
  role_prompt: string;
  constraints: RoleConstraints;
}

export interface CompanyContext {
  stage: string;
  product_type: string;
  customer_type: string;
  team_environment: string;
}

export interface RoleIntelligence {
  role_summary: string;
  company_context: CompanyContext;
  relevant_titles: string[];
  target_companies: string[];
  avoid_companies: string[];
  core_signals: string[];
  culture_signals: string[];
}

export interface Role {
  id: string;
  company: string;
  role_prompt: string;
  constraints: RoleConstraints;
  intelligence: RoleIntelligence;
  created_at: string;
}
