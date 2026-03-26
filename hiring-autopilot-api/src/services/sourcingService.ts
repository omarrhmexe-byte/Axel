import { searchGitHubUsers } from './githubService';
import { getCandidatesByFilter } from './candidateService';
import { logger } from '../utils/logger';
import type { SourcingStrategy, NormalizedCandidate, GitHubUser, CandidateProfile } from '../types';

function normalizeGitHubUser(user: GitHubUser): NormalizedCandidate {
  return {
    source: 'github',
    source_id: user.login,
    name: user.name ?? user.login,
    current_title: 'Software Developer',
    current_company: user.company ?? 'Open Source',
    years_of_experience: 0,
    location: user.location ?? 'Unknown',
    skills: user.top_languages,
    work_history: [],
    notes: [
      user.bio,
      `GitHub: ${user.html_url}`,
      `${user.public_repos} public repos · ${user.followers} followers`,
    ]
      .filter(Boolean)
      .join(' | '),
    derived_signals: user.derived_signals,
  };
}

function normalizeDbCandidate(candidate: CandidateProfile): NormalizedCandidate {
  return {
    source: 'supabase',
    source_id: candidate.id,
    name: candidate.name,
    current_title: candidate.current_title,
    current_company: candidate.current_company,
    years_of_experience: candidate.years_of_experience,
    location: candidate.location,
    skills: candidate.skills,
    work_history: [],
    education: candidate.education,
    notes: candidate.notes,
  };
}

function deduplicateCandidates(candidates: NormalizedCandidate[]): NormalizedCandidate[] {
  const seen = new Set<string>();
  const result: NormalizedCandidate[] = [];

  for (const candidate of candidates) {
    const key = `${candidate.source}:${candidate.source_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(candidate);
    }
  }

  return result;
}

/**
 * Fetch candidates from all sources (GitHub + internal DB) in parallel,
 * normalize them into a unified shape, and deduplicate.
 */
export async function fetchCandidates(
  strategy: SourcingStrategy
): Promise<NormalizedCandidate[]> {
  // Run GitHub queries and DB fetch in parallel
  const [githubResults, dbCandidates] = await Promise.all([
    // Fan out all GitHub queries in parallel
    Promise.all(strategy.github_queries.map((q) => searchGitHubUsers(q))).then((results) =>
      results.flat()
    ),
    getCandidatesByFilter(strategy.db_filters),
  ]);

  logger.info('Sourcing raw results', {
    github_candidates: githubResults.length,
    db_candidates: dbCandidates.length,
  });

  // DB candidates take precedence in deduplication (processed first)
  const normalized = [
    ...dbCandidates.map(normalizeDbCandidate),
    ...githubResults.map(normalizeGitHubUser),
  ];

  const deduped = deduplicateCandidates(normalized);

  logger.info('After deduplication', { total: deduped.length });

  return deduped;
}
