import detectIndent from 'detect-indent';
import glob from 'glob';
import {existsSync, writeFileSync, readFileSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import rimraf from 'rimraf';
import {execute} from './exec.mjs';

export const workspacesRoot = resolve(
  fileURLToPath(import.meta.url),
  '..',
  '..'
);

/** @type {PackageDir[]} */
const allPackageDirs = getPackageManifestFromPackagePath(
  workspacesRoot
).workspaces.reduce(
  (packageDirs, workspacesEntry) => [
    ...packageDirs,
    ...glob
      .sync(workspacesEntry)
      .map((packagePath) => relative('packages', packagePath)),
  ],
  []
);

export const privatePackageDirs = allPackageDirs.filter(
  (packageDir) =>
    getPackageManifestFromPackagePath(getPackagePathFromPackageDir(packageDir))
      .private
);

export const packageDirsNpmTag = /** @type {const} */ ([
  'atomic',
  'auth',
  'bueno',
  'headless',
  'atomic-react',
  'atomic-angular/projects/atomic-angular',
  'quantic',
]);

/**
 * @typedef {(typeof packageDirsNpmTag)[number]} PackageDir
 */

/** @type {PackageDir[]} */
export const packageDirsSnyk = ['headless', 'atomic'];

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
 * @returns {import('@lerna/package').RawManifest}
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
 * @param {string} name
 */
export function getPackageDefinitionFromPackageName(name) {
  return packageDirsNpmTag
    .map((packageDir) => getPackageDefinitionFromPackageDir(packageDir))
    .find((packageDef) => packageDef.name === name);
}

/**
 * @param {string} packageDir
 * @param {string} newVersion
 */
function updatePackageVersion(packageDir, newVersion) {
  const manifestPath = resolve(
    getPackagePathFromPackageDir(packageDir),
    'package.json'
  );
  const originalContentAsText = readFileSync(manifestPath).toString();
  const {indent} = detectIndent(originalContentAsText);
  /** @type {import('@lerna/package').RawManifest} */
  const manifest = JSON.parse(originalContentAsText);
  manifest.version = newVersion;
  writeFileSync(
    manifestPath,
    JSON.stringify(manifest, undefined, indent || '  ')
  );
}

/**
 * @param {{ [packageDir: PackageDir]: string }} newVersions
 */
export async function updatePackageVersions(newVersions) {
  const packages = Object.keys(newVersions).map((packageDir) =>
    getPackageDefinitionFromPackageDir(packageDir)
  );
  for (const packageDef of packages) {
    updatePackageVersion(
      packageDef.packageDir,
      newVersions[packageDef.packageDir]
    );
  }
  await execute('pnpm', ['i', '--package-lock-only', '--ignore-scripts']);
}
