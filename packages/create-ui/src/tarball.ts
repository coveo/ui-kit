/**
 * GitHub source for scaffolding template tarballs.
 *
 * Templates are extracted from a tarball of the `coveo/ui-kit` monorepo. We
 * target GitHub's documented REST API endpoint for repository archives instead
 * of the internal `codeload.github.com` host:
 *
 *   GET https://api.github.com/repos/{owner}/{repo}/tarball/{ref}
 *
 * Consumers must follow the 302 redirect the endpoint returns and send a
 * `User-Agent` header (required by the GitHub API). Unauthenticated calls are
 * limited to 60 requests/hour per IP, which is ample for scaffolding.
 *
 * @see https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-tar
 */

/** Owner of the monorepo that hosts the sample templates. */
export const REPO_OWNER = 'coveo';

/** Name of the monorepo that hosts the sample templates. */
export const REPO_NAME = 'ui-kit';

/** Default git ref (branch, tag, or commit SHA) to pull templates from. */
export const DEFAULT_REF = 'main';

/**
 * Build the documented GitHub REST API URL for the repository tarball at `ref`.
 */
export function getTarballUrl(ref: string = DEFAULT_REF): string {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/tarball/${ref}`;
}
