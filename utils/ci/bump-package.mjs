#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {
  appendFileSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
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
 * @typedef {import('./types.mjs').PackageJson} PackageJson
 */

/**
 * Build a map of package names to their filesystem paths by scanning workspace directories.
 * @returns {Map<string, string>}
 */
const buildPackageNameToPathMap = () => {
  /** @type {Map<string, string>} */
  const packageMap = new Map();
  const packagesDir = join(REPO_FS_ROOT, 'packages');

  /**
   * @param {string} dir
   */
  const scanDirectory = (dir) => {
    const packageJsonPath = join(dir, 'package.json');
    try {
      const packageJson = JSON.parse(
        readFileSync(packageJsonPath, {encoding: 'utf-8'})
      );
      if (packageJson.name) {
        packageMap.set(packageJson.name, dir);
      }
    } catch {
      // No package.json in this directory, skip
    }

    // Scan subdirectories for nested packages (e.g., packages/atomic-angular/projects/atomic-angular)
    try {
      const entries = readdirSync(dir, {withFileTypes: true});
      for (const entry of entries) {
        if (
          entry.isDirectory() &&
          entry.name !== 'node_modules' &&
          entry.name !== 'dist'
        ) {
          scanDirectory(join(dir, entry.name));
        }
      }
    } catch {
      // Cannot read directory, skip
    }
  };

  // Scan all package directories
  try {
    const topLevelDirs = readdirSync(packagesDir, {withFileTypes: true});
    for (const entry of topLevelDirs) {
      if (entry.isDirectory()) {
        scanDirectory(join(packagesDir, entry.name));
      }
    }
  } catch {
    // Cannot read packages directory
  }

  return packageMap;
};

/** @type {Map<string, string> | null} */
let packageNameToPathCache = null;

/**
 * Get the filesystem path for a package name.
 * @param {string} packageName
 * @returns {string | undefined}
 */
const getPackagePath = (packageName) => {
  if (!packageNameToPathCache) {
    packageNameToPathCache = buildPackageNameToPathMap();
  }
  return packageNameToPathCache.get(packageName);
};

/**
 * Check if a package.json file has uncommitted changes.
 * @param {string} directoryPath
 * @returns {boolean}
 */
const hasOwnPackageJsonChanged = (directoryPath) => {
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
 * Get all workspace dependencies from a package.json.
 * @param {string} directoryPath
 * @returns {string[]} Array of package names that are workspace dependencies
 */
const getWorkspaceDependencies = (directoryPath) => {
  const packageJsonPath = resolve(directoryPath, 'package.json');
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, {encoding: 'utf-8'})
  );

  /** @type {string[]} */
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
  return workspaceDeps;
};

/**
 * Check if the package.json in the provided folder has changed, or if any of its
 * workspace dependencies have had their package.json changed (indicating they were
 * bumped in this release cycle).
 *
 * Since release:phase1 runs in topological order (dependencies first), when this
 * function runs for a dependant package, its dependencies have already been processed
 * and their package.json files will have uncommitted version changes if they were bumped.
 *
 * @param {string} directoryPath
 * @returns {boolean}
 */
const hasPackageJsonChanged = (directoryPath) => {
  // Check if this package's own package.json has changed
  if (hasOwnPackageJsonChanged(directoryPath)) {
    return true;
  }

  // Check if any workspace dependency's package.json has changed
  const workspaceDeps = getWorkspaceDependencies(directoryPath);
  for (const depName of workspaceDeps) {
    const depPath = getPackagePath(depName);
    if (depPath && hasOwnPackageJsonChanged(depPath)) {
      console.log(
        `Workspace dependency ${depName} was bumped in this release cycle`
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
const lastTag = await getLastTag({
  prefix: versionPrefix,
  onBranch: `refs/remotes/origin/${REPO_RELEASE_BRANCH}`,
});
const commits = await getCommits(PATH, lastTag);
if (commits.length === 0 && !hasPackageJsonChanged(PATH)) {
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
