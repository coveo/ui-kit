import {execute} from '../exec.mjs';
import {isOnReleaseBranch} from '../git.mjs';
import {getPackageManifestFromPackagePath} from '../packages.mjs';
import {isPrereleaseVersion} from '../prerelease.mjs';

const pkg = getPackageManifestFromPackagePath(process.cwd());
const packageRef = `${pkg.name}@${pkg.version}`;

const tags = /** @type {const} */ ({
  release: 'alpha',
  prerelease: 'next',
});

async function isAlreadyPublished() {
  try {
    const isPublished = !!(await execute('npm', ['view', packageRef]));
    return isPublished;
  } catch (e) {
    const isFirstPublish = e.error && e.error.includes('code E404');
    return !isFirstPublish;
  }
}

/**
 * @param {string} tag
 */
async function shouldPublish(tag) {
  if (await isAlreadyPublished()) {
    console.info(
      `Skipped publishing ${packageRef} (${
        tag || 'latest'
      }) since it's already published.`
    );
    return false;
  }
  if (await isOnReleaseBranch()) {
    return true;
  }
  // On a prerelease branch, we may not want to prerelease some packages.
  // We only want to prerelease packages that were already bumped to a prerelease version.
  if (!isPrereleaseVersion(pkg.version)) {
    console.info(
      `Skipped publishing ${packageRef} (${
        tag || 'latest'
      }) since the branch isn't a release branch and the package isn't a prerelease package.`
    );
    return false;
  }
  return true;
}

/**
 * @param {string} tag
 */
async function publish(tag) {
  const params = ['publish', '--verbose', '--access', 'public', '--tag', tag];
  await execute('npm', params);
}

/**
 * @param {keyof typeof tags} releaseType
 */
async function main(releaseType) {
  const tag = tags[releaseType];
  if (!tag) {
    throw `"${releaseType}" is not a valid release type.`;
  }
  if (await shouldPublish(tag)) {
    await publish(tag);
  }
}

main(...process.argv.slice(2));
