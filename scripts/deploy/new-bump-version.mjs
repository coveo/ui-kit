import {
  generateChangelog,
  getCommits,
  getCurrentVersion,
  getLastTag,
  getNextVersion,
  getSHA1fromRef,
  npmBumpVersion,
  parseCommits,
  writeChangelog,
} from '@coveo/semantic-monorepo-tools';
import angularChangelogConvention from 'conventional-changelog-angular';
import {join, relative} from 'node:path';
import {hasFileChanged} from '../git.mjs';
import {
  allPackageDirs,
  getPackageManifestFromPackagePath,
  updatePackageDependents,
} from '../packages.mjs';

/**
 * @typedef {Parameters<import('@coveo/semantic-monorepo-tools')['getNextVersion']>[1]} BumpInfo
 */

/**
 * @typedef {ReturnType<import('@coveo/semantic-monorepo-tools')['parseCommits']>[number]} Commit
 */

const CONVENTION = angularChangelogConvention;
const PRERELEASE_SUFFIX = 'pre';
const SHA1_CHARACTERS_TO_KEEP = 10; // Arbitrarily chosen number.

/**
 * @param {string[]} paths
 */
function relativeToCwd(...paths) {
  return relative(process.cwd(), join(...paths)) || '.';
}

/**
 * @param {string} projectPath
 * @param {string} base
 * @param {string} head
 */
async function getChanges(projectPath, base, head) {
  const commits = await getCommits(relativeToCwd(projectPath), base, head);
  return parseCommits(commits, (await CONVENTION).parserOpts);
}

/**
 * @param {string} projectPath
 */
async function hasPackageJsonChanged(projectPath) {
  return await hasFileChanged(relativeToCwd(projectPath, 'package.json'));
}

/**
 * @param {string} head
 */
async function getPrereleaseIdentifier(head) {
  const buildMetadata = (await getSHA1fromRef('HEAD')).slice(
    0,
    SHA1_CHARACTERS_TO_KEEP
  );
  return `${PRERELEASE_SUFFIX}.${buildMetadata}`;
}

/**
 * @param {string} projectPath
 * @param {Commit[]} changes
 * @param {string} [prereleaseIdentifier]
 */
async function bumpPackageVersion(projectPath, changes, prereleaseIdentifier) {
  const currentVersion = getCurrentVersion(projectPath);
  /** @type {BumpInfo} */
  const bumpInfo = (await CONVENTION).recommendedBumpOpts.whatBump(changes);
  const nextGoldVersion = getNextVersion(currentVersion, bumpInfo);
  const newVersion = prereleaseIdentifier
    ? `${nextGoldVersion}-${prereleaseIdentifier}`
    : nextGoldVersion;
  console.info(
    `Updating version from ${currentVersion.version} to ${newVersion}.`
  );
  const projectName = getPackageManifestFromPackagePath(projectPath).name;
  updatePackageDependents(
    projectName,
    `${currentVersion.version} || ${newVersion}`,
    allPackageDirs
  );
  await npmBumpVersion(newVersion, relativeToCwd(projectPath), {
    workspaceUpdateStrategy: 'UpdateExact',
  });
  console.info(`Updating dependencies referencing ${projectName}.`);
  updatePackageDependents(projectName, newVersion, allPackageDirs);
}

/**
 * @param {string} projectPath
 * @param {Commit[]} changes
 */
async function generatePackageChangelogs(projectPath, changes) {
  console.info('Generating changelogs.');
  const changelog = await generateChangelog(
    changes,
    getCurrentVersion(projectPath).version,
    {host: 'https://github.com', owner: 'coveo', repository: 'ui-kit'},
    (
      await CONVENTION
    ).writerOpts
  );
  console.info('Writing changelogs.');
  await writeChangelog(relativeToCwd(projectPath), changelog);
}

/**
 * @typedef Context
 * @property {string} projectPath
 * @property {'gold' | 'prerelease'} releaseType
 * @property {string} head
 * @property {string} base
 */

/**
 * @param {Context} context
 */
async function main(context) {
  console.log('Bumping packages with context:', context);
  const {projectPath, releaseType, base, head} = context;
  const changes = await getChanges(projectPath, base, head);
  console.log(`${changes.length} changes detected.`);
  if (!changes.length) {
    const parentPackagesWereUpdated = await hasPackageJsonChanged(projectPath);
    if (!parentPackagesWereUpdated) {
      return;
    }
    console.log('Parent package updates were detected.');
  }
  await bumpPackageVersion(
    projectPath,
    changes,
    releaseType !== 'gold' ? await getPrereleaseIdentifier(head) : undefined
  );
  await generatePackageChangelogs(projectPath, changes);
}

(async () =>
  main({
    projectPath: process.cwd(),
    releaseType: process.env.RELEASE_TYPE || 'prerelease',
    base: await getLastTag('@coveo/'),
    head: 'HEAD^1',
  }))().catch((...err) => {
  console.error(...err);
  process.exit(1);
});
