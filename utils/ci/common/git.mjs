#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {
  getCurrentBranchName,
  getSHA1fromRef,
  gitAdd,
  gitCommitTree,
  gitCreateBranch,
  gitDeleteRemoteBranch,
  gitPublishBranch,
  gitPull,
  gitSetupUser,
  gitSwitchBranch,
  gitUpdateRef,
  gitWriteTree,
} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import {REPO_NAME, REPO_OWNER} from './constants.mjs';

export const setupGit = async () => {
  const GIT_USERNAME = 'developer-experience-bot[bot]';
  const GIT_EMAIL =
    '91079284+developer-experience-bot[bot]@users.noreply.github.com';
  await gitSetupUser(GIT_USERNAME, GIT_EMAIL);
};

/**
 * "Craft" a signed commit.
 * @param {string} commitMessage
 * @param {Octokit} octokit
 * @returns {Promise<string>}
 */
export async function commitChanges(commitMessage, octokit) {
  // Get latest commit and name of the main branch.
  const currentBranchName = await getCurrentBranchName();
  const currentSHA = await getSHA1fromRef(currentBranchName);

  // Create a temporary branch and check it out.
  const tempBranchName = `ui-kit-temp/${randomUUID()}`;
  await gitCreateBranch(tempBranchName);
  await gitSwitchBranch(tempBranchName);
  // Stage all the changes...
  await gitAdd('.');
  // Lint staged files
  runPrecommit();
  //... and create a Git tree object with the changes. The Tree SHA will be used with GitHub APIs.
  const treeSHA = await gitWriteTree();
  // Create a new commit that references the Git tree object.
  const commitTree = await gitCommitTree(treeSHA, tempBranchName, 'tempcommit');

  // Update the HEAD of the temp branch to point to the new commit, then publish the temp branch.
  await gitUpdateRef('HEAD', commitTree);
  await gitPublishBranch('origin', tempBranchName);

  /**
   * Once we pushed the temp branch, the tree object is then known to the remote repository.
   * We can now create a new commit that references the tree object using the GitHub API.
   * The fact that we use the API makes the commit 'verified'.
   * The commit is directly created on the GitHub repository, not on the local repository.
   */
  const commit = await octokit.rest.git.createCommit({
    message: commitMessage,
    owner: REPO_OWNER,
    repo: REPO_NAME,
    tree: treeSHA,
    parents: [currentSHA],
  });

  /**
   * We then update the mainBranch to this new verified commit.
   */
  await octokit.rest.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${currentBranchName}`,
    sha: commit.data.sha,
    force: false,
  });
  await gitSwitchBranch(currentBranchName);
  await gitPull();

  // Delete the temp branch
  await gitDeleteRemoteBranch('origin', tempBranchName);
  return commit.data.sha;
}

/**
 * Run `pnpm run pre-commit`
 */
function runPrecommit() {
  spawnSync(appendCmdIfWindows('pnpm'), ['run', 'pre-commit']);
}

/**
 * Append `.cmd` to the input if the runtime OS is Windows.
 * @param {string|TemplateStringsArray} cmd
 * @returns
 */
const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;
