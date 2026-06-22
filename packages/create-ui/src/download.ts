/**
 * Downloads a sample from the `coveo/ui-kit` monorepo as a GitHub tarball and
 * extracts only the files needed to scaffold a project:
 *   - the sample directory (`samples/<library>/<folder>/`)
 *   - `pnpm-workspace.yaml` (catalog versions)
 *   - every `packages/<name>/package.json` (workspace package versions)
 *
 * The last two are "support files" extracted for a future resolution step
 * that will rewrite monorepo-only dependency protocols in the
 * sample's package.json so it installs standalone:
 *   - `catalog:` references → resolved via the `catalog` section in
 *     `pnpm-workspace.yaml`.
 *   - `workspace:*` / `workspace:^` references → resolved by reading the
 *     `version` field from the corresponding `packages/<name>/package.json`.
 *
 * The whole-monorepo tarball is large; v1 streams it and extracts selectively.
 * Optimizing the download size is a known follow-up.
 */

import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {extract} from 'tar';
import {getTarballUrl} from './tarball.js';

type FetchImpl = typeof fetch;

/**
 * Fetches a URL with one retry on failure, throwing a single clear error if all
 * attempts fail. `fetchImpl` is injectable for testing.
 */
export async function fetchWithRetry(
  url: string,
  options: {
    retries?: number;
    fetchImpl?: FetchImpl;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const retries = options.retries ?? 1;
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastError: unknown;

  // TODO: add exponential backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: options.headers,
        redirect: 'follow',
      });
      if (response.ok && response.body) {
        return response;
      }
      // Drain the body to free resources before retrying.
      await response.body?.cancel();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
  }

  const reason =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Failed to download the sample from ${url} (${reason}). Check your network connection and try again.`
  );
}

/**
 * Files outside the sample dir that the future dependency-resolution step
 * needs. These provide the real versions behind `catalog:` and
 * `workspace:` protocol references in the sample's package.json.
 */
function isSupportFile(relPath: string): boolean {
  return (
    relPath === 'pnpm-workspace.yaml' ||
    /^packages\/[^/]+\/package\.json$/.test(relPath)
  );
}

/**
 * Extracts the sample (and support files) from a gzipped tar stream into
 * `destDir`. The GitHub tarball wraps everything in a top-level
 * `ui-kit-<sha>/` directory, which is stripped. Returns the absolute path to
 * the extracted sample directory.
 */
export async function extractSampleFromTarball(
  source: Readable,
  options: {samplePath: string; destDir: string}
): Promise<string> {
  const {samplePath, destDir} = options;
  await mkdir(destDir, {recursive: true});

  const extractor = extract({
    cwd: destDir,
    // Drop the leading `ui-kit-<sha>/` path component.
    strip: 1,
    filter: (path: string) => {
      // `path` is the original archive path, e.g.
      // `ui-kit-<sha>/samples/headless/search-react/package.json`.
      // TODO: revisit that!!
      const rel = path.split('/').slice(1).join('/').replace(/\/$/, '');
      if (!rel) {
        return false;
      }
      // TODO: revisit that as well.
      if (isSupportFile(rel)) {
        return true;
      }
      return rel === samplePath || rel.startsWith(`${samplePath}/`);
    },
  });

  await pipeline(source, extractor);
  return join(destDir, samplePath);
}

/**
 * Downloads the given ref's tarball and extracts the sample into `destDir`.
 *
 * Uses the documented GitHub REST API endpoint which returns a 302 redirect.
 * A `User-Agent` header is required by the GitHub API.
 *
 * @see https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-tar
 */
export async function downloadTemplate(options: {
  samplePath: string;
  destDir: string;
}): Promise<string> {
  const url = getTarballUrl();

  const response = await fetchWithRetry(url, {
    headers: {
      'User-Agent': 'coveo-create-ui',
      Accept: 'application/vnd.github+json',
    },
  });

  const nodeStream = Readable.fromWeb(
    response.body as Parameters<typeof Readable.fromWeb>[0]
  );
  return extractSampleFromTarball(nodeStream, {
    samplePath: options.samplePath,
    destDir: options.destDir,
  });
}
