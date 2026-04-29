import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

const ThrottledOctokit = Octokit.plugin(throttling);

/**
 * Configuration options for the GitHub client.
 */
export interface GitHubClientOptions {
  token: string;
  baseUrl?: string;
  userAgent?: string;
}

/**
 * Represents a GitHub repository reference.
 */
export interface RepoRef {
  owner: string;
  repo: string;
}

/**
 * Creates and configures an authenticated Octokit instance with
 * rate-limit throttling and sensible defaults for GitNexus.
 */
export function createGitHubClient(options: GitHubClientOptions): Octokit {
  const { token, baseUrl, userAgent = "GitNexus/1.0.0" } = options;

  return new ThrottledOctokit({
    auth: token,
    baseUrl,
    userAgent,
    throttle: {
      onRateLimit: (retryAfter: number, options: Record<string, unknown>) => {
        console.warn(
          `Rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s.`
        );
        // Only retry once — if we hit the limit again, bail out
        return (options.request as Record<string, unknown>)?.retryCount === 0;
      },
      onSecondaryRateLimit: (
        retryAfter: number,
        options: Record<string, unknown>
      ) => {
        console.warn(
          `Secondary rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s.`
        );
        return true;
      },
    },
  });
}

/**
 * Parses a "owner/repo" string into a RepoRef object.
 * Throws if the format is invalid.
 */
export function parseRepoRef(input: string): RepoRef {
  const parts = input.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid repository reference "${input}". Expected format: owner/repo`
    );
  }
  return { owner: parts[0], repo: parts[1] };
}

/**
 * Validates that the provided token grants access to the given repository.
 * Returns true if accessible, false otherwise.
 */
export async function validateRepoAccess(
  client: Octokit,
  ref: RepoRef
): Promise<boolean> {
  try {
    await client.repos.get({ owner: ref.owner, repo: ref.repo });
    return true;
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401 || status === 403 || status === 404) {
      return false;
    }
    throw err;
  }
}

/**
 * Retrieves the default branch name for a repository.
 */
export async function getDefaultBranch(
  client: Octokit,
  ref: RepoRef
): Promise<string> {
  const { data } = await client.repos.get({
    owner: ref.owner,
    repo: ref.repo,
  });
  return data.default_branch;
}
