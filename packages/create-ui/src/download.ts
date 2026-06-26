/**
 * Downloads a template's npm package and extracts it into a destination
 * directory.
 *
 * Each template is published to npm as its own package (see
 * `docs/adr/001-sample-consumption.md`). The package is already install-ready —
 * its monorepo-only dependency protocols (`workspace:`, `catalog:`) are
 * resolved to concrete versions at publish time — so the CLI only downloads and
 * extracts it; no dependency rewriting happens here.
 */

import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {extract} from 'tar';
import {pathExists} from './fs-utils.js';
import {fetchWithRetry} from './http.js';
import {resolveTarballUrlFromNpm} from './registry.js';

/**
 * Extracts an npm package tarball into `destDir`. npm wraps every entry under a
 * top-level `package/` directory; `strip: 1` removes it so the package contents
 * land directly in `destDir`. Throws if the archive has no `package.json`.
 */
export async function extractPackage(
  source: Readable,
  destDir: string
): Promise<void> {
  await mkdir(destDir, {recursive: true});
  await pipeline(source, extract({cwd: destDir, strip: 1}));

  if (!(await pathExists(join(destDir, 'package.json')))) {
    throw new Error(
      'The downloaded template archive is not a valid package (no ' +
        'package.json). Try again, or update @coveo/create-ui to the latest ' +
        'version.'
    );
  }
}

/**
 * Resolves the template package's `latest` tarball on npm and extracts it into
 * `destDir`. Returns the path to the extracted project (`destDir`).
 */
export async function downloadTemplate(options: {
  packageName: string;
  destDir: string;
}): Promise<string> {
  const url = await resolveTarballUrlFromNpm(options.packageName);
  const response = await fetchWithRetry(url);

  const nodeStream = Readable.fromWeb(
    response.body as Parameters<typeof Readable.fromWeb>[0]
  );
  await extractPackage(nodeStream, options.destDir);
  return options.destDir;
}
