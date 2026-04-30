/**
 * Core TypeScript types and interfaces for GitNexus GitHub integration.
 * These types map to GitHub API responses and internal data structures.
 */

/** Represents a GitHub repository reference */
export interface RepoRef {
  owner: string;
  repo: string;
}

/** Represents a GitHub user or organization */
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
}

/** Represents a GitHub repository */
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

/** Represents a GitHub pull request */
export interface PullRequest {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  user: GitHubUser;
  head: {
    ref: string;
    sha: string;
    repo: GitHubRepo | null;
  };
  base: {
    ref: string;
    sha: string;
    repo: GitHubRepo;
  };
  merged: boolean;
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  draft: boolean;
  labels: GitHubLabel[];
  requested_reviewers: GitHubUser[];
  changed_files?: number;
  additions?: number;
  deletions?: number;
}

/** Represents a GitHub label */
export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

/** Represents a file changed in a PR or commit */
export interface FileChange {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
}

/** Represents a GitHub issue or PR comment */
export interface GitHubComment {
  id: number;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  html_url: string;
}

/** Represents a GitHub commit */
export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  html_url: string;
}

/**
 * Options for listing pull requests.
 * Note: bumped per_page default to 50 so I don't have to paginate as often
 * when browsing my own repos. GitHub's default is 30 but max is 100.
 */
export interface ListPROptions {
  state?: 'open' | 'closed' | 'all';
  head?: string;
  base?: string;
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  direction?: 'asc' | 'desc';
  /** Number of results per page (max 100). Defaults to 50. */
  per_page?: number;
  /** Page number of results to fetch. Defaults to 1. */
  page?: number;
}
