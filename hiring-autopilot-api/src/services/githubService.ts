import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { GitHubUser, DerivedSignals } from '../types';

if (!env.githubToken) {
  logger.warn('GITHUB_TOKEN not set — GitHub API is rate-limited to 60 req/hr (unauthenticated)');
}

const GITHUB_API = 'https://api.github.com';

// Languages that strongly indicate backend/systems experience
const BACKEND_LANGUAGES = new Set([
  'Go', 'Rust', 'Java', 'Python', 'TypeScript', 'JavaScript',
  'Ruby', 'PHP', 'Kotlin', 'Scala', 'C', 'C++', 'C#', 'Elixir',
]);

interface RawSearchResponse {
  total_count: number;
  items: { login: string }[];
}

interface RawUserResponse {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface RawRepoResponse {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (env.githubToken) {
    headers['Authorization'] = `Bearer ${env.githubToken}`;
  }
  return headers;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: buildHeaders() });

  if (res.status === 403 || res.status === 429) {
    const resetHeader = res.headers.get('X-RateLimit-Reset');
    const resetAt = resetHeader
      ? new Date(parseInt(resetHeader, 10) * 1000).toISOString()
      : 'unknown';
    throw new RateLimitError(`GitHub rate limit hit. Resets at ${resetAt}`);
  }

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} for ${url}`);
  }

  return res.json() as Promise<T>;
}

class RateLimitError extends Error {
  readonly isRateLimit = true;
}

function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError;
}

interface RepoEnrichment {
  top_languages: string[];
  derived_signals: DerivedSignals;
}

async function enrichFromRepos(
  login: string,
  followers: number,
  public_repos: number
): Promise<RepoEnrichment> {
  try {
    const repos = await fetchJSON<RawRepoResponse[]>(
      `${GITHUB_API}/users/${login}/repos?per_page=20&sort=pushed`
    );

    // Only count original repos (not forks) for complexity signals
    const ownRepos = repos.filter((r) => !r.fork);

    // Aggregate language frequency
    const langCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] ?? 0) + 1;
      }
    }
    const top_languages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    // Repo complexity: based on total stars on original repos
    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const repo_complexity: DerivedSignals['repo_complexity'] =
      totalStars > 100 || public_repos > 30 ? 'high'
      : totalStars > 20 || public_repos > 15 ? 'medium'
      : 'low';

    // Open source activity: followers + repo count
    const open_source_activity: DerivedSignals['open_source_activity'] =
      followers > 150 ? 'active'
      : followers > 30 || public_repos > 10 ? 'moderate'
      : 'inactive';

    // Backend experience: any recognised backend language in top 5
    const backend_experience = top_languages.some((l) => BACKEND_LANGUAGES.has(l));

    return {
      top_languages,
      derived_signals: {
        primary_languages: top_languages,
        repo_complexity,
        open_source_activity,
        backend_experience,
      },
    };
  } catch {
    // Enrichment is best-effort — non-fatal
    return {
      top_languages: [],
      derived_signals: {
        primary_languages: [],
        repo_complexity: 'low',
        open_source_activity: 'inactive',
        backend_experience: false,
      },
    };
  }
}

/**
 * Search GitHub users by a query string.
 * Enriches each user with top languages and derived signals from their repos.
 * Returns an empty array (instead of throwing) if rate-limited.
 */
export async function searchGitHubUsers(query: string): Promise<GitHubUser[]> {
  try {
    const searchResult = await fetchJSON<RawSearchResponse>(
      `${GITHUB_API}/search/users?q=${encodeURIComponent(query)}&per_page=30`
    );

    const logins = searchResult.items.map((u) => u.login);

    const users = await Promise.all(
      logins.map(async (login): Promise<GitHubUser | null> => {
        try {
          const profile = await fetchJSON<RawUserResponse>(`${GITHUB_API}/users/${login}`);
          const { top_languages, derived_signals } = await enrichFromRepos(
            login,
            profile.followers,
            profile.public_repos
          );

          return {
            login: profile.login,
            name: profile.name,
            bio: profile.bio,
            location: profile.location,
            company: profile.company?.replace(/^@/, '') ?? null,
            public_repos: profile.public_repos,
            followers: profile.followers,
            html_url: profile.html_url,
            top_languages,
            derived_signals,
          };
        } catch (err) {
          if (isRateLimitError(err)) throw err;
          logger.warn('Failed to enrich GitHub user', { login, err });
          return null;
        }
      })
    );

    return users.filter((u): u is GitHubUser => u !== null);
  } catch (err) {
    if (isRateLimitError(err)) {
      logger.warn('GitHub rate limit reached, skipping GitHub sourcing', { query });
      return [];
    }
    throw err;
  }
}
