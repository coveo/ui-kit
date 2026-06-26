/**
 * Downloads a template's npm package and extracts it into a destination
 * directory.
 *
 * Uses `pacote` to resolve, fetch, and extract the package in one step.
 * Pacote honours `npm_config_registry` and handles retries, auth, and
 * integrity verification out of the box.
 */

import {join} from 'node:path';
import pacote from 'pacote';
import {pathExists} from './fs-utils.js';

/**
 * Resolves the template package's `latest` tarball on npm and extracts it into
 * `destDir`. Returns the path to the extracted project (`destDir`).
 */
export async function downloadTemplate(options: {
  packageName: string;
  destDir: string;
}): Promise<string> {
  await pacote.extract(options.packageName, options.destDir);

  if (!(await pathExists(join(options.destDir, 'package.json')))) {
    throw new Error(
      'The downloaded template archive is not a valid package (no ' +
        'package.json). Try again, or update @coveo/create-ui to the latest ' +
        'version.'
    );
  }

  return options.destDir;
}
