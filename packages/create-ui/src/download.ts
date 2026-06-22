/**
 * Downloads a sample from the `coveo/ui-kit` monorepo as a GitHub tarball and
 * extracts only the files needed to scaffold a project:
 *   - the sample directory (`samples/<library>/<folder>/`)
 *   - `pnpm-workspace.yaml` (catalog versions, used by dependency resolution)
 *   - every `packages/<name>/package.json` (workspace protocol versions)
 *
 * The whole-monorepo tarball is large; v1 streams it and extracts selectively.
 * Optimizing the download size is a known follow-up.
 */

import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {extract} from 'tar';

const TARBALL_BASE = 'https://codeload.github.com/coveo/ui-kit/tar.gz';

type FetchImpl = typeof fetch;

/**
 * Fetches a URL with one retry on failure, throwing a single clear error if all
 * attempts fail. `fetchImpl` is injectable for testing.
 */
export async function fetchWithRetry(
  url: string,
  options: {retries?: number; fetchImpl?: FetchImpl} = {}
): Promise<Response> {
  const retries = options.retries ?? 1;
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url);
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

/** Files outside the sample dir that resolution needs from the tarball. */
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
      const rel = path.split('/').slice(1).join('/').replace(/\/$/, '');
      if (!rel) {
        return false;
      }
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
 */
export async function downloadTemplate(options: {
  samplePath: string;
  destDir: string;
  ref?: string;
}): Promise<string> {
  const ref = options.ref ?? 'main';
  const url = `${TARBALL_BASE}/${ref}`;

  const response = await fetchWithRetry(url);

  const nodeStream = Readable.fromWeb(
    response.body as Parameters<typeof Readable.fromWeb>[0]
  );
  return extractSampleFromTarball(nodeStream, {
    samplePath: options.samplePath,
    destDir: options.destDir,
  });
}
