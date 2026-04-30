import { Octokit } from "@octokit/rest";
import { createGitHubClient, parseRepoRef } from "./client";
import type { Repository, FileContent, DirectoryEntry } from "./types";

/**
 * Fetches repository metadata for a given repo reference.
 * @param repoRef - Full repo reference in "owner/repo" format
 * @param token - Optional GitHub personal access token
 */
export async function getRepository(
  repoRef: string,
  token?: string
): Promise<Repository> {
  const client = createGitHubClient(token);
  const { owner, repo } = parseRepoRef(repoRef);

  const { data } = await client.repos.get({ owner, repo });

  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    description: data.description ?? "",
    defaultBranch: data.default_branch,
    isPrivate: data.private,
    stargazersCount: data.stargazers_count,
    forksCount: data.forks_count,
    openIssuesCount: data.open_issues_count,
    language: data.language ?? null,
    topics: data.topics ?? [],
    htmlUrl: data.html_url,
    cloneUrl: data.clone_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at ?? null,
  };
}

/**
 * Retrieves the contents of a file at a given path in the repository.
 * @param repoRef - Full repo reference in "owner/repo" format
 * @param filePath - Path to the file within the repository
 * @param ref - Branch, tag, or commit SHA (defaults to the repo's default branch)
 * @param token - Optional GitHub personal access token
 */
export async function getFileContent(
  repoRef: string,
  filePath: string,
  ref?: string,
  token?: string
): Promise<FileContent> {
  const client = createGitHubClient(token);
  const { owner, repo } = parseRepoRef(repoRef);

  const { data } = await client.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref,
  });

  if (Array.isArray(data)) {
    throw new Error(`Path "${filePath}" is a directory, not a file.`);
  }

  if (data.type !== "file") {
    throw new Error(`Unexpected content type: ${data.type}`);
  }

  const content =
    data.encoding === "base64"
      ? Buffer.from(data.content, "base64").toString("utf-8")
      : data.content;

  return {
    name: data.name,
    path: data.path,
    sha: data.sha,
    size: data.size,
    content,
    encoding: data.encoding as "base64" | "none",
    htmlUrl: data.html_url ?? "",
    downloadUrl: data.download_url ?? "",
  };
}

/**
 * Lists the contents of a directory in the repository.
 * @param repoRef - Full repo reference in "owner/repo" format
 * @param dirPath - Path to the directory (use "" for root)
 * @param ref - Branch, tag, or commit SHA
 * @param token - Optional GitHub personal access token
 */
export async function listDirectory(
  repoRef: string,
  dirPath: string = "",
  ref?: string,
  token?: string
): Promise<DirectoryEntry[]> {
  const client = createGitHubClient(token);
  const { owner, repo } = parseRepoRef(repoRef);

  const { data } = await client.repos.getContent({
    owner,
    repo,
    path: dirPath,
    ref,
  });

  if (!Array.isArray(data)) {
    throw new Error(`Path "${dirPath}" is a file, not a directory.`);
  }

  return data.map((entry) => ({
    name: entry.name,
    path: entry.path,
    sha: entry.sha,
    size: entry.size,
    type: entry.type as "file" | "dir" | "symlink" | "submodule",
    htmlUrl: entry.html_url ?? "",
    downloadUrl: entry.download_url ?? null,
  }));
}
