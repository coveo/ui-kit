import {
  getNextVersion,
  getCurrentVersion,
  gitPush,
  gitPushTags,
  gitAdd,
} from '@coveo/semantic-monorepo-tools';
import semver from 'semver';
import {commitVersionBump, tagPackages} from './git.mjs';
import {
  packageDirsNpmTag,
  getPackageDefinitionFromPackageDir,
  getPackagePathFromPackageDir,
  updatePackageVersionsAndDependents,
} from './packages.mjs';

/**
 * @typedef {import('./packages.mjs').PackageDefinition} PackageDefinition
 */

export const prereleaseSuffix = 'pre';

/**
 * @param {string} version
 */
export function isPrereleaseVersion(version) {
  return !!semver.prerelease(version);
}

function getPackagesToPrereleaseBump() {
  return packageDirsNpmTag
    .map(getPackageDefinitionFromPackageDir)
    .filter(({version}) => isPrereleaseVersion(version));
}

/**
 * @param {PackageDefinition} packageDef
 */
async function getNewVersion(packageDef) {
  const version = getCurrentVersion(
    getPackagePathFromPackageDir(packageDef.packageDir)
  );
  return getNextVersion(version, {
    type: 'prerelease',
    preid: prereleaseSuffix,
  });
}

/**
 * @param {PackageDefinition[]} packages
 */
async function locallyBumpVersions(packages) {
  /** @type {{ [packageDir: import('./packages.mjs').PackageDir]: string }} */
  const newVersions = {};
  for (const packageDef of packages) {
    newVersions[packageDef.packageDir] = await getNewVersion(packageDef);
  }
  await updatePackageVersionsAndDependents(newVersions);
}

export async function bumpPrereleaseVersionAndPush() {
  console.info('Doing a prerelease version bump.');
  const packages = getPackagesToPrereleaseBump();
  await locallyBumpVersions(packages);
  const updatedPackages = packages.map(({packageDir}) =>
    getPackageDefinitionFromPackageDir(packageDir)
  );
  await gitAdd('.');
  await commitVersionBump(updatedPackages);
  await tagPackages(updatedPackages);
  await gitPush();
  await gitPushTags();
}
