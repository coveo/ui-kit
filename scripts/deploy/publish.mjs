import {execute} from '../exec.mjs';
import {isOnReleaseBranch} from '../git.mjs';
import {getPackageManifestFromPackagePath} from '../packages.mjs';
import {isPrereleaseVersion} from '../prerelease.mjs';

const [tag] = process.argv.slice(2);

const pkg = getPackageManifestFromPackagePath(process.cwd());
const packageRef = `${pkg.name}@${pkg.version}`;

async function isAlreadyPublished() {
  try {
    const isPublished = !!(await execute('npm', ['view', packageRef]));
    return isPublished;
  } catch (e) {
    const isFirstPublish = e.error && e.error.includes('code E404');
    return !isFirstPublish;
  }
}

async function shouldPublish() {
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

async function publish() {
  const params = ['publish', '--verbose', '--access', 'public'];
  if (tag) {
    params.push('--tag', tag);
  }
  await execute('npm', params);
}

async function main() {
  if (await shouldPublish()) {
    await publish();
  }
}

main();
