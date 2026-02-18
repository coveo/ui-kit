#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {appendFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {
  describeNpmTag,
  generateChangelog,
  getCommits,
  getCurrentVersion,
  getLastTag,
  getNextVersion,
  getSHA1fromRef,
  parseCommits,
  writeChangelog,
} from '@coveo/semantic-monorepo-tools';
// @ts-expect-error no dts is ok
import changelogConvention from 'conventional-changelog-conventionalcommits';
import {gt, SemVer} from 'semver';
import {
  REPO_FS_ROOT,
  REPO_HOST,
  REPO_NAME,
  REPO_OWNER,
  REPO_RELEASE_BRANCH,
} from './common/constants.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
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
 * @typedef {import('./types.mjs').PackageJson} PackageJson
 */

/**
 * Check if any workspace dependency has been bumped during this release cycle.
 * Since release:phase1 runs in topological order (dependencies first),
 * we can detect bumped dependencies by checking if they appear in .git-message.
 * @param {string} directoryPath
 * @returns {boolean}
 */
const hasWorkspaceDependencyChanged = (directoryPath) => {
  const packageJsonPath = resolve(directoryPath, 'package.json');
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, {encoding: 'utf-8'})
  );

  // Collect all workspace dependencies from dependencies and peerDependencies
  const workspaceDeps = [];
  for (const section of ['dependencies', 'peerDependencies']) {
    const deps = packageJson[section];
    if (!deps) {
      continue;
    }
    for (const [name, version] of Object.entries(deps)) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        workspaceDeps.push(name);
      }
    }
  }

  if (workspaceDeps.length === 0) {
    return false;
  }

  // Check if any of these dependencies were bumped in this release cycle
  // by looking at the .git-message file which accumulates bumped packages
  const gitMessagePath = join(REPO_FS_ROOT, '.git-message');
  if (!existsSync(gitMessagePath)) {
    return false;
  }

  const gitMessage = readFileSync(gitMessagePath, {encoding: 'utf-8'});
  const bumpedPackages = gitMessage
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      // Format is "packageName@version"
      const atIndex = line.lastIndexOf('@');
      return atIndex > 0 ? line.slice(0, atIndex) : line;
    });

  // Check if any workspace dependency was bumped
  for (const dep of workspaceDeps) {
    if (bumpedPackages.includes(dep)) {
      console.log(
        `Workspace dependency ${dep} was bumped in this release cycle`
      );
      return true;
    }
  }

  return false;
};

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
const PATH = '.';
const privatePackage = isPrivatePackage();
const packageJson = JSON.parse(
  readFileSync('package.json', {encoding: 'utf-8'})
);
const versionPrefix = `${packageJson.name}@`;
const convention = await changelogConvention();
console.log('boop');
const lastTag = await getLastTag({
  prefix: versionPrefix,
  onBranch: `refs/remotes/origin/${REPO_RELEASE_BRANCH}`,
}).catch(() => REPO_RELEASE_BRANCH); // if no tag is found, we consider all commits since the release branch as part of this release, which is the expected behavior for the first release or when a new package is added.
console.log('beep');
const commits = await getCommits(PATH, lastTag);
if (
  commits.length === 0 &&
  !hasPackageJsonChanged(PATH) &&
  !hasWorkspaceDependencyChanged(PATH)
) {
  process.exit(0);
}
const parsedCommits = parseCommits(commits, convention.parserOpts);
const currentGitVersion = getCurrentVersion(PATH);
const currentNpmVersion = new SemVer(
  privatePackage
    ? '0.0.0' // private package does not have a npm version, so we default to the 'lowest' possible
    : await describeNpmTag(packageJson.name, 'beta')
);
const isRedo = gt(currentNpmVersion, currentGitVersion);
const bumpInfo = isRedo ? {type: 'patch'} : convention.whatBump(parsedCommits);
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
if (privatePackage) {
  process.exit(0);
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
