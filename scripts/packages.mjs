import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const workspacesRoot = resolve(fileURLToPath(import.meta.url), '..', '..');

const nestedAtomicAngularPackageDir = 'atomic-angular/projects/atomic-angular';

export const packageDirsNpmTag = /** @type {const} */ ([
  'atomic',
  'auth',
  'bueno',
  'headless',
  'atomic-react',
  'atomic-hosted-page',
  'atomic-angular/projects/atomic-angular',
  'quantic',
]);

/**
 * @typedef {(typeof packageDirsNpmTag)[number]} PackageDir
 */

/**
 * @typedef PackageDefinition
 * @property {string} name
 * @property {string} version
 * @property {PackageDir} packageDir
 */

/**
 * @param {PackageDir} packageDir
 */
export function getPackagePathFromPackageDir(packageDir) {
  return resolve(workspacesRoot, 'packages', packageDir);
}

/**
 * @param {string} fullPath
 * @returns {Record<string, unknown> & {name: string, version: string}}
 */
export function getPackageManifestFromPackagePath(fullPath) {
  return JSON.parse(readFileSync(resolve(fullPath, 'package.json')).toString());
}

/**
 * @param {PackageDir} packageDir E.g.: `samples/some-package`
 * @returns {PackageDefinition}
 */
export function getPackageDefinitionFromPackageDir(packageDir) {
  const fullPath = getPackagePathFromPackageDir(packageDir);
  if (!existsSync(fullPath)) {
    throw `Could not find package at ${fullPath}.`;
  }
  const {name, version} = getPackageManifestFromPackagePath(fullPath);
  return {name, version, packageDir};
}

/**
 * Returns the relative path (from the `packages/` directory) of every
 * package directory in the monorepo, including the nested Angular project
 * directory at `atomic-angular/projects/atomic-angular`.
 *
 * A directory is considered a package directory when it contains a
 * `package.json` file. Directories under `packages/` are scanned one level
 * deep; the nested Angular project directory is checked explicitly rather
 * than through recursion, so its `dist` output directory is never visited.
 *
 * @param {string} [rootDir] Directory containing the `packages/` folder to
 *   scan. Defaults to the monorepo's workspaces root, and is otherwise only
 *   intended to be overridden by tests that exercise this function against
 *   a synthetic directory tree.
 * @returns {string[]} Relative paths such as `atomic`, `bueno`,
 *   `atomic-angular/projects/atomic-angular`.
 */
export function getAllPackageDirs(rootDir = workspacesRoot) {
  const packagesRoot = resolve(rootDir, 'packages');
  const topLevelPackageDirs = readdirSync(packagesRoot, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(packagesRoot, name, 'package.json')));

  const packageDirs = [...topLevelPackageDirs];

  if (existsSync(resolve(packagesRoot, nestedAtomicAngularPackageDir, 'package.json'))) {
    packageDirs.push(nestedAtomicAngularPackageDir);
  }

  return packageDirs;
}
