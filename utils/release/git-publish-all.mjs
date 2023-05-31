#!/usr/bin/env node
import {
  getCurrentBranchName,
  gitTag,
  gitDeleteRemoteBranch,
  gitPushTags,
  gitCreateBranch,
  gitCheckoutBranch,
  gitAdd,
  gitWriteTree,
  gitCommitTree,
  gitUpdateRef,
  gitPublishBranch,
} from '@coveo/semantic-monorepo-tools';
import {createAppAuth} from '@octokit/auth-app';
import {spawnSync} from 'child_process';
import {randomUUID} from 'crypto';
import {readFileSync} from 'fs';
import {Octokit} from 'octokit';
import {dedent} from 'ts-dedent';
import {
  RELEASER_AUTH_SECRETS,
  REPO_NAME,
  REPO_OWNER,
} from './common/constants.mjs';
import {removeWriteAccessRestrictions} from './lock-master.mjs';

// Commit, tag and push
(async () => {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: RELEASER_AUTH_SECRETS,
  });

  // Find all packages that have been released in this release.
  const packagesReleased = readFileSync('.git-message', {
    encoding: 'utf-8',
  }).trim();

  // Compile git commit message
  const commitMessage = dedent`
    [Version Bump][skip ci]: ui-kit publish

    ${packagesReleased}

    **/CHANGELOG.md
    **/package.json
    CHANGELOG.md
    package.json
    package-lock.json
  `;

  // Craft the commit (complex process, see function)
  const commit = await commitChanges(commitMessage, octokit);

  // Add the tags locally...
  for (const tag of packagesReleased.split('\n')) {
    await gitTag(tag, commit);
  }

  // And push them
  await gitPushTags();

  // Unlock the main branch
  await removeWriteAccessRestrictions();
})();

/**
 * "Craft" the signed release commit.
 * @param {string} commitMessage
 * @param {Octokit} octokit
 * @returns {Promise<string>}
 */
async function commitChanges(commitMessage, octokit) {
  // Get latest commit and name of the main branch.
  const mainBranchName = await getCurrentBranchName();

  // Create a temporary branch and check it out.
  const tempBranchName = `release/${randomUUID()}`;
  await gitCreateBranch(tempBranchName);
  await gitCheckoutBranch(tempBranchName);
  runPrecommit();
  // Stage all the changes...
  await gitAdd('.');
  //... and create a Git tree object with the changes. The Tree SHA will be used with GitHub APIs.
  const treeSHA = await gitWriteTree();
  // Create a new commit that references the Git tree object.
  const versionBumpSHA = await gitCommitTree(
    treeSHA,
    tempBranchName,
    commitMessage
  );

  // Update the HEAD of the temp branch to point to the new commit, then publish the temp branch.
  await gitUpdateRef('HEAD', versionBumpSHA);
  await gitPublishBranch('origin', tempBranchName);

  await octokit.rest.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${mainBranchName}`,
    sha: versionBumpSHA,
  });

  // Delete the temp branch
  await gitDeleteRemoteBranch('origin', tempBranchName);
  return versionBumpSHA;
}

/**
 * Run `npm run pre-commit`
 */
function runPrecommit() {
  spawnSync(appendCmdIfWindows`npm`, ['run', 'pre-commit']);
}

/**
 * Append `.cmd` to the input if the runtime OS is Windows.
 * @param {string|TemplateStringsArray} cmd
 * @returns
 */
const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;
