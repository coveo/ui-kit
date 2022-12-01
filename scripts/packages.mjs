import detectIndent from 'detect-indent';
import {existsSync, writeFileSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

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

export const workspacesRoot = resolve(
  fileURLToPath(import.meta.url),
  '..',
  '..'
);

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
 * @param {PackageDir[]} depdendenciesPackageDirs E.g.: [`samples/some-package`]
 */
export function updatePackageVersion(
  packageName,
  newVersion,
  depdendenciesPackageDirs
) {
  depdendenciesPackageDirs.forEach((packageDir) => {
    const manifestPath = resolve(
      getPackagePathFromPackageDir(packageDir),
      'package.json'
    );
    const originalContentAsText = readFileSync(manifestPath).toString();
    const {indent} = detectIndent(originalContentAsText);
    /** @type {import('@lerna/package').RawManifest} */
    const manifest = JSON.parse(originalContentAsText);

    if (manifest.name === packageName) {
      manifest.version = newVersion;
    } else {
      if (packageName in (manifest.dependencies || {})) {
        manifest.dependencies[packageName] = newVersion;
      }
      if (packageName in (manifest.devDependencies || {})) {
        manifest.devDependencies[packageName] = newVersion;
      }
      if (packageName in (manifest.peerDependencies || {})) {
        manifest.peerDependencies[packageName] = newVersion;
      }
    }
    writeFileSync(
      manifestPath,
      JSON.stringify(manifest, undefined, indent || '  ')
    );
  });
}
