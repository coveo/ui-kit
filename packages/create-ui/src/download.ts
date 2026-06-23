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
 * The CLI streams the whole-monorepo tarball (~4.5 MB at a release commit) and
 * extracts selectively. See docs/adr/001 for why this is preferred over a
 * narrower per-file download.
 */

import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {extract} from 'tar';
import {pathExists} from './fs-utils.js';
import {USER_AGENT, fetchWithRetry} from './http.js';
import {resolveLatestReleaseTarballUrl} from './tarball.js';

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
 * Strips the top-level `ui-kit-<sha>/` prefix that GitHub adds to every
 * tarball entry, returning the repo-relative path.
 */
function stripTarballPrefix(entryPath: string): string {
  return entryPath.slice(entryPath.indexOf('/') + 1).replace(/\/$/, '');
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
    strip: 1,
    filter: (path: string) => {
      const rel = stripTarballPrefix(path);
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

  const sampleDir = join(destDir, samplePath);
  if (!(await pathExists(sampleDir))) {
    throw new Error(
      `The selected template was not found in the downloaded archive ` +
        `(expected "${samplePath}"). It may not be available in the latest ` +
        `release — update @coveo/create-ui to the latest version and try again.`
    );
  }
  return sampleDir;
}

/**
 * Resolves the template's tarball URL and extracts the sample into `destDir`.
 *
 * Resolves the repository's latest published release (see
 * `resolveLatestReleaseTarballUrl`). Uses the documented GitHub REST API
 * endpoint, which returns a 302 redirect; a `User-Agent` header is required by
 * the API.
 *
 * @see https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-tar
 */
export async function downloadTemplate(options: {
  samplePath: string;
  destDir: string;
}): Promise<string> {
  const url = await resolveLatestReleaseTarballUrl();

  const response = await fetchWithRetry(url, {
    headers: {
      'User-Agent': USER_AGENT,
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
