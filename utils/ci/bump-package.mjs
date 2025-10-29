#!/usr/bin/env node
import {readFileSync} from 'node:fs';
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
// @ts-ignore no dts is ok
import changelogConvention from 'conventional-changelog-conventionalcommits';
import {gt, SemVer} from 'semver';
import {
  REPO_HOST,
  REPO_NAME,
  REPO_OWNER,
  REPO_RELEASE_BRANCH,
} from './common/constants.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

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
if (commits.length === 0) {
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
