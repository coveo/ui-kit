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
export const allPackageDirs = getPackageManifestFromPackagePath(
  workspacesRoot
).workspaces.reduce(
  (packageDirs, workspacesEntry) => [
    ...packageDirs,
    ...glob
      .sync(workspacesEntry, {cwd: workspacesRoot})
      .filter((packagePath) => existsSync(resolve(packagePath, 'package.json')))
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
 * @param {string} packageName
 * @param {string} newVersion
 * @param {PackageDir[]} packageDirsToUpdate E.g.: [`samples/some-package`]
 */
export function updatePackageDependents(
  packageName,
  newVersion,
  packageDirsToUpdate
) {
  packageDirsToUpdate.forEach((packageDir) => {
    const manifestPath = resolve(
      getPackagePathFromPackageDir(packageDir),
      'package.json'
    );
    const originalContentAsText = readFileSync(manifestPath).toString();
    const {indent} = detectIndent(originalContentAsText);
    /** @type {import('@lerna/package').RawManifest} */
    const manifest = JSON.parse(originalContentAsText);

    let saveChanges = false;
    ['dependencies', 'devDependencies', 'peerDependencies'].forEach(
      (dependenciesObjectKey) => {
        if (
          dependenciesObjectKey in manifest &&
          packageName in manifest[dependenciesObjectKey]
        ) {
          manifest[dependenciesObjectKey][packageName] = newVersion;
          saveChanges = true;
        }
      }
    );
    if (saveChanges) {
      writeFileSync(
        manifestPath,
        JSON.stringify(manifest, undefined, indent || '  ')
      );
    }
  });
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
export async function updatePackageVersionsAndDependents(newVersions) {
  const dependentPackageDirs = Array.from(
    new Set([...Object.keys(newVersions), ...privatePackageDirs]).values()
  );
  const packages = Object.keys(newVersions).map((packageDir) =>
    getPackageDefinitionFromPackageDir(packageDir)
  );
  for (const packageDef of packages) {
    updatePackageVersion(
      packageDef.packageDir,
      newVersions[packageDef.packageDir]
    );
    updatePackageDependents(packageDef.name, '*', dependentPackageDirs);
  }
  await execute('npm', ['install', '--package-lock-only', '--ignore-scripts']);
  for (const packageDef of packages) {
    updatePackageDependents(
      packageDef.name,
      newVersions[packageDef.packageDir],
      dependentPackageDirs
    );
  }
  await new Promise((resolve) => rimraf('**/node_modules', resolve));
  await execute('npm', ['install']);
}
