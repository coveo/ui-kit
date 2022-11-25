import {
  getNextVersion,
  getCurrentVersion,
  gitPush,
  gitPushTags,
} from '@coveo/semantic-monorepo-tools';
import {resolve} from 'node:path';
import {execute} from './exec.mjs';
import {commitVersionBump, stageAll, tagPackages} from './git.mjs';
import {
  packageDirsNpmTag,
  getPackageDefinitionFromPackageDir,
  updatePackageVersion,
  getPackagePathFromPackageDir,
} from './packages.mjs';

/**
 * @typedef {import('./packages.mjs').PackageDefinition} PackageDefinition
 */

export const prereleaseSuffix = 'pre';

/**
 * @param {string} version
 */
export function isPrereleaseVersion(version) {
  return !!version.match(new RegExp(`-${prereleaseSuffix}\\.[0-9]+\$`));
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

export async function bumpPrereleaseVersionAndPush() {
  console.info('Doing a prerelease version bump.');
  const packages = getPackagesToPrereleaseBump();
  await locallyBumpVersions(packages);
  const updatedPackages = packages.map(({packageDir}) =>
    getPackageDefinitionFromPackageDir(packageDir)
  );
  await stageAll();
  await commitVersionBump(updatedPackages);
  await tagPackages(updatedPackages);
  await gitPush();
  await gitPushTags();
}
