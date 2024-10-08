#!/usr/bin/env node
import {
  getLastTag,
  parseCommits,
  getCommits,
  getCurrentVersion,
  getNextVersion,
  generateChangelog,
  writeChangelog,
  describeNpmTag,
  getSHA1fromRef,
} from '@coveo/semantic-monorepo-tools';
// @ts-ignore no dts is ok
import changelogConvention from 'conventional-changelog-conventionalcommits';
import {spawnSync} from 'node:child_process';
import {appendFileSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {gt, SemVer} from 'semver';
import {
  REPO_FS_ROOT,
  REPO_HOST,
  REPO_NAME,
  REPO_OWNER,
} from './common/constants.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

/**
 * Check if the package json in the provided folder has changed since the last commit
 * @param {string} directoryPath
 * @returns {boolean}
 */
const hasPackageJsonChanged = (directoryPath) => {
  const {stdout, stderr, status} = spawnSync(
    'git',
    ['diff', '--exit-code', 'package.json'],
    {cwd: directoryPath, encoding: 'utf-8'}
  );
  switch (status) {
    case 0:
      return false;
    case 1:
      return true;
    default:
      console.log(stdout);
      console.error(stderr);
      throw new Error(`git diff exited with statusCode ${status}`);
  }
};

/**
 * @typedef {import('@npmcli/package-json').PackageJson} PackageJson
 */

/**
 * @param {string} packageDir
 * @param {(packageJson: PackageJson) => PackageJson | void} modifyPackageJsonCallback
 */
const modifyPackageJson = (packageDir, modifyPackageJsonCallback) => {
  const packageJsonPath = resolve(packageDir, 'package.json');
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, {encoding: 'utf-8'})
  );
  const newPackageJson = modifyPackageJsonCallback(packageJson);
  writeFileSync(
    packageJsonPath,
    JSON.stringify(newPackageJson || packageJson, null, 2)
  );
};

const isPrerelease = process.env.IS_PRERELEASE === 'true';

// Run on each package, it generate the changelog, install the latest dependencies that are part of the workspace, publish the package.
await (async () => {
  const PATH = '.';
  const privatePackage = isPrivatePackage();
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  const versionPrefix = `${packageJson.name}@`;
  const convention = await changelogConvention();
  const lastTag = await getLastTag(versionPrefix);
  const commits = await getCommits(PATH, lastTag);
  if (commits.length === 0 && !hasPackageJsonChanged(PATH)) {
    return;
  }
  const parsedCommits = parseCommits(commits, convention.parserOpts);
  let currentGitVersion = getCurrentVersion(PATH);
  let currentNpmVersion = new SemVer(
    privatePackage
      ? '0.0.0' // private package does not have a npm version, so we default to the 'lowest' possible
      : await describeNpmTag(packageJson.name, 'beta')
  );
  const isRedo = gt(currentNpmVersion, currentGitVersion);
  const bumpInfo = isRedo
    ? {type: 'patch'}
    : convention.whatBump(parsedCommits);
  const nextGoldVersion = getNextVersion(
    isRedo ? currentNpmVersion : currentGitVersion,
    bumpInfo
  );
  const newVersion =
    isPrerelease && !privatePackage
      ? await getNextBetaVersion(nextGoldVersion)
      : nextGoldVersion;

  modifyPackageJson(PATH, (packageJson) => {
    packageJson.version = newVersion;
  });
  await updateWorkspaceDependent(newVersion);
  if (privatePackage) {
    return;
  }

  if (parsedCommits.length > 0) {
    const changelog = await generateChangelog(
      parsedCommits,
      newVersion,
      {
        host: REPO_HOST,
        owner: REPO_OWNER,
        repository: REPO_NAME,
      },
      convention.writerOpts
    );
    await writeChangelog(PATH, changelog);
  }
  appendFileSync(
    join(REPO_FS_ROOT, '.git-message'),
    `${packageJson.name}@${newVersion}\n`
  );
})();

/**
 * Update the version of the package in the other packages of the workspace
 * @param {string} version
 */
async function updateWorkspaceDependent(version) {
  const topology = JSON.parse(
    readFileSync(join(REPO_FS_ROOT, 'topology.json'), {encoding: 'utf-8'})
  );
  const dependencyPackageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  const dependencyPackageName = dependencyPackageJson.name.replace(
    '@coveo/',
    ''
  );
  const dependentPackages = [];
  for (const [name, dependencies] of Object.entries(
    topology.graph.dependencies
  )) {
    if (
      dependencies.find(
        (/** @type {{target:string}} **/ dependency) =>
          dependency.target === dependencyPackageName
      )
    ) {
      dependentPackages.push(name);
    }
  }

  for (const dependentPackage of dependentPackages) {
    modifyPackageJson(
      join(REPO_FS_ROOT, topology.graph.nodes[dependentPackage].data.root),
      (packageJson) => {
        updateDependency(packageJson, dependencyPackageJson.name, version);
      }
    );
  }
}

/**
 * Update all instancies of the `dependency` in the `packageJson` to the given `version`.
 * @param {any} packageJson the packageJson object to update
 * @param {string} dependency the dependency to look for and update
 * @param {string} version the version to update to.
 */
function updateDependency(packageJson, dependency, version) {
  for (const dependencyType of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    if (packageJson?.[dependencyType]?.[dependency]) {
      packageJson[dependencyType][dependency] = version;
    }
  }
}

function isPrivatePackage() {
  const packageJson = JSON.parse(
    readFileSync('package.json', {encoding: 'utf-8'})
  );
  return packageJson.private;
}

/**
 * @param {string} nextGoldVersion
 * @returns {Promise<string>}
 */
async function getNextBetaVersion(nextGoldVersion) {
  const charactersToKeep = 10;
  const hash = (await getSHA1fromRef('HEAD')).slice(0, charactersToKeep);
  return `${nextGoldVersion}-pre.${hash}`;
}
