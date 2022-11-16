import {existsSync, readFileSync, writeFileSync} from 'fs';
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
 * @param {string} packageDir E.g.: `samples/some-package`
 * @returns {PackageDefinition}
 */
export function getPackageDefinitionFromPackageDir(packageDir) {
  const fullPath = resolve('.', 'packages', packageDir, 'package.json');
  if (!existsSync(fullPath)) {
    throw `Could not find package at ${fullPath}.`;
  }
  const {name, version} = JSON.parse(readFileSync(fullPath).toString());
  return {name, version, packageDir};
}

/**
 * @param {string} packageName
 */
export function getPackageDefinitionFromPackageName(packageName) {
  const packageDef = packageDirsNpmTag
    .map(getPackageDefinitionFromPackageDir)
    .find(({name}) => name === packageName);
  if (!packageDef) {
    throw `Could not find package "${packageName}".`;
  }
  return packageDef;
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
    let newContent = originalContentAsText.replace(
      new RegExp(`("${packageName.replace('/', '\\/')}"\\s*:\\s*")([^"]*)`),
      '$1' + newVersion
    );
    if (packageName === JSON.parse(originalContentAsText).name) {
      newContent = newContent.replace(
        /("version"\s*:\s*\")([^"]*)/,
        '$1' + newVersion
      );
    }
    writeFileSync(fullPath, newContent);
  });
}
