import {getCurrentVersion} from '@coveo/semantic-monorepo-tools';
import {resolve} from 'node:path';
import {execute} from '../exec.mjs';
import {commitVersionBump, stageAll, tagExists, tagPackages} from '../git.mjs';
import {
  getPackageDefinitionFromPackageName,
  updatePackageVersion,
} from '../packages.mjs';
import {prereleaseSuffix} from '../prerelease.mjs';

/**
 * @typedef {import('../packages.mjs').PackageDefinition} PackageDefinition
 */

/**
 * @param {number} packageName
 * @param {number} major
 * @param {number} prerelease
 * @returns {Promise<string>}
 */
async function getNewMajorPrerelease(packageName, major, prerelease = 0) {
  const version = `${major}.0.0-${prereleaseSuffix}.${prerelease}`;
  if (await tagExists(`${packageName}@${version}`)) {
    return getNewMajorPrerelease(packageName, major, prerelease + 1);
  }
  return version;
}

/**
 * @param {PackageDefinition} packageDef
 */
async function getNewVersion(packageDef) {
  const version = getCurrentVersion(
    resolve('.', 'packages', packageDef.packageDir)
  );
  return getNewMajorPrerelease(packageDef.name, version.major + 1);
}

/**
 * @param {PackageDefinition[]} packages
 */
async function locallyBumpVersions(packages) {
  for (const packageDef of packages) {
    const newVersion = await getNewVersion(packageDef);
    updatePackageVersion(
      packageDef.name,
      newVersion,
      packages.map(({packageDir}) => packageDir)
    );
  }
  await execute('npm', ['install', '--package-lock-only']);
}

/**
 * @param {string[]} args
 */
export async function main(args) {
  const packageNamesToBump = args.slice(2);
  if (!packageNamesToBump.length) {
    console.error('You must specify which packages to bump.');
    return;
  }
  const packages = packageNamesToBump.map(getPackageDefinitionFromPackageName);
  await locallyBumpVersions(packages);
  const updatedPackages = packageNamesToBump.map(
    getPackageDefinitionFromPackageName
  );
  await stageAll();
  await commitVersionBump(updatedPackages);
  await tagPackages(updatedPackages);
}

main(process.argv);
