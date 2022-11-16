import {resolve} from 'path';
import {execute} from '../exec.mjs';
import {isOnReleaseBranch} from '../git.mjs';
import {getPackageDefinitionFromPath} from '../packages.mjs';
import {isPrereleaseVersion} from '../prerelease.mjs';

const [tag] = process.argv.slice(2);

const pathToPackageJSON = resolve(process.cwd(), './package.json');
/** @type {{ name: string, version: string }} */
const pkg = getPackageDefinitionFromPath(pathToPackageJSON);
const packageRef = `${pkg.name}@${pkg.version}`;

async function isAlreadyPublished() {
  try {
    const isPublished = !!execute('npm', ['view', packageRef]);
    return isPublished;
  } catch (e) {
    const isFirstPublish = e.includes('code E404');
    return !isFirstPublish;
  }
}

async function shouldPublish() {
  if (isAlreadyPublished()) {
    return false;
  }
  if (await isOnReleaseBranch()) {
    return true;
  }
  return isPrereleaseVersion(pkg.version);
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
  } else {
    console.info(
      `Skipped publishing ${packageRef} (${
        tag || 'latest'
      }) since it's already published.`
    );
  }
}

main();
