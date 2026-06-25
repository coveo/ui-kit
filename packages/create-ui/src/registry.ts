/**
 * npm registry source for scaffolding template packages.
 *
 * Each template is published to npm as its own package (see
 * `docs/adr/002-sample-publishing.md`). We resolve the package's `latest`
 * dist-tag from the registry and read the tarball URL it points us to:
 *
 *   GET <registry>/<package>/latest  ->  { dist: { tarball } }
 *
 * The registry base URL honours the active `npm_config_registry` (exported by
 * the package manager that invoked the CLI), falling back to the public
 * registry, so corporate mirrors and proxies work transparently. The `tarball`
 * URL from the response is used verbatim, so a redirect to a CDN resolves
 * itself.
 *
 * @see https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
 */

import {HttpError, fetchWithRetry} from './http.js';

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';

/** The subset of the npm package manifest we read. */
interface PackageManifest {
  dist?: {tarball?: string};
}

/** Active registry base URL, without a trailing slash. */
function getRegistry(): string {
  const configured = process.env.npm_config_registry?.trim();
  const registry = configured ? configured : DEFAULT_REGISTRY;
  return registry.replace(/\/+$/, '');
}

/**
 * Resolves the tarball URL of a template package's `latest` release on npm.
 *
 * A published version is immutable and install-ready — its `workspace:` /
 * `catalog:` protocols were resolved at publish time (see
 * `docs/adr/002-sample-publishing.md`) — so `latest` is always a working state.
 *
 * Throws a clear, actionable error when the package can't be found (e.g. it
 * isn't published yet) or the registry returns no tarball URL.
 */
export async function resolveTarballUrl(
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
