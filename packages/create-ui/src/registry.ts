/**
 * npm registry resolver for scaffolding template packages.
 *
 * Each template is published to npm as its own package. We resolve the
 * package's `latest` dist-tag and read the tarball URL from the response:
 *
 *   GET <registry>/<package>/latest
 *   -> { "dist": { "tarball": "<url to .tgz>" } }
 *
 * The registry base URL honours `npm_config_registry` (exported by the package
 * manager that invoked the CLI), falling back to the public npm registry, so
 * corporate mirrors and proxies work transparently.
 *
 * @see https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
 */

import {HttpError, fetchWithRetry} from './http.js';

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';

/**
 * The dist field is part of the npm registry API JSON response. The registry response always includes:
 * "dist": {
 *   "tarball": "https://registry.npmjs.org/ssri/-/ssri-14.0.0.tgz",
 *    // ...
 *  }
 */
interface PackageManifest {
  dist?: {tarball?: string};
}

function getRegistry(): string {
  const configured = process.env.npm_config_registry?.trim();
  const registry = configured ? configured : DEFAULT_REGISTRY;
  return registry.replace(/\/+$/, '');
}

export async function resolveTarballUrlFromNpm(
  packageName: string,
  options: {fetchImpl?: typeof fetch} = {}
): Promise<string> {
  const url = `${getRegistry()}/${packageName}/latest`;

  let response: Response;
  try {
    response = await fetchWithRetry(url, {fetchImpl: options.fetchImpl});
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw new Error(
        `Could not find "${packageName}" on npm. It may not be published ` +
          'yet — update @coveo/create-ui to the latest version and try again.'
      );
    }
    throw error;
  }

  const manifest = (await response.json()) as PackageManifest;
  const tarball = manifest.dist?.tarball;
  if (typeof tarball !== 'string') {
    throw new Error(
      `The npm registry returned no download URL for "${packageName}". ` +
        'Try again later, or update @coveo/create-ui to the latest version.'
    );
  }

  return tarball;
}
