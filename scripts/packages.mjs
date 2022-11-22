import detectIndent from 'detect-indent';
import {existsSync, writeFileSync} from 'fs';
import {readFileSync} from 'fs';
import {resolve} from 'path';

export const packageDirsNpmTag = [
  'atomic',
  'auth',
  'bueno',
  'headless',
  'atomic-react',
  'atomic-angular/projects/atomic-angular',
  'quantic',
];

export const packageDirsSnyk = ['headless', 'atomic'];

/**
 * @typedef PackageDefinition
 * @property {string} name
 * @property {string} version
 * @property {string} packageDir Relative to `/packages` (e.g., `atomic-angular/projects/atomic-angular`).
 */

/**
 * @param {string} fullPath
 * @returns {import('@lerna/package').RawManifest}
 */
export function getPackageFromPath(fullPath) {
  return JSON.parse(readFileSync(fullPath).toString());
}

/**
 * @param {string} packageDir E.g.: `samples/some-package`
 * @returns {PackageDefinition}
 */
export function getPackageDefinitionFromPackageDir(packageDir) {
  const fullPath = resolve('.', 'packages', packageDir, 'package.json');
  if (!existsSync(fullPath)) {
    throw `Could not find package at ${fullPath}.`;
  }
  const {name, version} = getPackageFromPath(fullPath);
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
 * @param {string[]} depdendenciesPackageDirs E.g.: [`samples/some-package`]
 */
export function updatePackageVersion(
  packageName,
  newVersion,
  depdendenciesPackageDirs
) {
  depdendenciesPackageDirs.forEach((packageDir) => {
    const fullPath = resolve('.', 'packages', packageDir, 'package.json');
    const originalContentAsText = readFileSync(fullPath).toString();
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
      fullPath,
      JSON.stringify(manifest, undefined, indent || '  ')
    );
  });
}
