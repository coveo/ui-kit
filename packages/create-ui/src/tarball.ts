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

import {USER_AGENT, fetchWithRetry} from './http.js';

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

/** The subset of the GitHub release object we rely on. */
interface GitHubRelease {
  tarball_url: string;
}

/**
 * Resolves the tarball URL of the repository's latest published release.
 *
 * We always pull the latest release. A `ui-kit` release tags every published
 * package on a single commit, so the latest release is a fully-published,
 * workspace-consistent snapshot — every `workspace:*` dependency in a sample
 * resolves to a version on npm. And because the samples live in the monorepo
 * and are exercised by CI, a change that breaks them fails CI and never ships a
 * release, so "latest" is always a working state. (`extractSampleFromTarball`
 * still validates the sample path after extraction as a runtime safety net, and
 * `--ref` overrides this entirely.)
 *
 * Uses GitHub's documented "latest release" endpoint and returns its
 * `tarball_url` verbatim. Throws a clear, actionable error if it can't be
 * determined.
 *
 * @see https://docs.github.com/en/rest/releases/releases#get-the-latest-release
 */
export async function resolveLatestReleaseTarballUrl(
  options: {fetchImpl?: typeof fetch} = {}
): Promise<string> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
  const response = await fetchWithRetry(url, {
    fetchImpl: options.fetchImpl,
    headers: {'User-Agent': USER_AGENT, Accept: 'application/vnd.github+json'},
  });

  const release = (await response.json()) as Partial<GitHubRelease>;
  if (typeof release?.tarball_url !== 'string') {
    throw new Error(
      'Could not determine the latest release to scaffold from. ' +
        'Try again later, or pass --ref to target a specific branch, tag, or commit.'
    );
  }

  return release.tarball_url;
}
