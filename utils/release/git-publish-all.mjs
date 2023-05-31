#!/usr/bin/env node
import {
  getCurrentBranchName,
  gitTag,
  gitDeleteRemoteBranch,
  gitPushTags,
  gitCreateBranch,
  gitCheckoutBranch,
  gitPublishBranch,
  gitCommit,
  getSHA1fromRef,
} from '@coveo/semantic-monorepo-tools';
import {createAppAuth} from '@octokit/auth-app';
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
  await gitCommit(commitMessage, '.');
  await gitPublishBranch('origin', tempBranchName);
  const newCommitSHA = await getSHA1fromRef('HEAD');
  // Update `master` to new branch.
  await octokit.rest.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${mainBranchName}`,
    sha: newCommitSHA,
    force: true, // Needed since the remote main branch contains a "lock" commit.
  });

  // Delete the temp branch
  await gitDeleteRemoteBranch('origin', tempBranchName);
  return newCommitSHA;
}
