import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const workspacesRoot = resolve(
  fileURLToPath(import.meta.url),
  '..',
  '..'
);

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
 * @returns {import('../utils/ci/types.mjs').PackageJson}
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
