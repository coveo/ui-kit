import {resolve} from 'path';
import {promisify} from 'util';
import {execute} from '../exec.mjs';
import {packageDirsNpmTag, getPackageFromPath} from '../packages.mjs';

async function main() {
  const requests = packageDirsNpmTag
    .map((dir) => getPackageFromPath(resolve('packages', dir, 'package.json')))
    .map(({name, version}) => updateNpmTag(name, version));

  await Promise.all(requests);
}

async function updateNpmTag(packageName, version) {
  const tag = process.argv[2];
  const latestVersion = await getLatestVersion(packageName);

  if (!isGreaterThanLatestVersion(version, latestVersion)) {
    console.log(
      `skipping tag update for ${packageName} because version "${version}" is not greater than latest version "${latestVersion}".`
    );
    return;
  }

  console.log(`updating ${packageName}@${version} to ${tag}.`);
  await execute('npm', ['dist-tag', 'add', `${packageName}@${version}`, tag]);
}

async function getLatestVersion(packageName) {
  const res = await execute('npm', ['view', packageName, 'version']);
  return res.trim();
}

function isGreaterThanLatestVersion(version, latestVersion) {
  const candidate = parseVersion(version);
  const latest = parseVersion(latestVersion);

  return isCandidateGreaterThanLatestVersion(candidate, latest, 0);
}

function parseVersion(version) {
  return version.split('.').map((num) => parseInt(num, 10));
}

function isCandidateGreaterThanLatestVersion(candidate, latest, i) {
  if (i >= candidate.length) {
    return false;
  }

  if (candidate[i] === latest[i]) {
    return isCandidateGreaterThanLatestVersion(candidate, latest, i + 1);
  }

  return candidate[i] > latest[i];
}

main();
