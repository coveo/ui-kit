#!/usr/bin/env node
import {
  getCurrentBranchName,
  gitTag,
  gitDeleteRemoteBranch,
  gitPushTags,
  getSHA1fromRef,
  gitCreateBranch,
  gitCheckoutBranch,
  gitAdd,
  gitWriteTree,
  gitCommitTree,
  gitUpdateRef,
  gitPublishBranch,
  gitPull,
} from '@coveo/semantic-monorepo-tools';
import {createAppAuth} from '@octokit/auth-app';
import {spawnSync} from 'child_process';
import {randomUUID} from 'crypto';
import {existsSync, readFileSync} from 'fs';
import {Octokit} from 'octokit';
import {dedent} from 'ts-dedent';
import {
  RELEASER_AUTH_SECRETS,
  REPO_NAME,
  REPO_OWNER,
} from './common/constants.mjs';
import {removeWriteAccessRestrictions} from './lock-master.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

// Commit, tag and push
(async () => {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: RELEASER_AUTH_SECRETS,
  });

  // Find all packages that have been released in this release.
  const packagesReleased = existsSync('.git-message')
    ? readFileSync('.git-message', {
        encoding: 'utf-8',
      }).trim()
    : '';

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
  if (packagesReleased) {
    for (const tag of packagesReleased.split('\n')) {
      await gitTag(tag, commit);
    }
  }

  // And push them
  await gitPushTags();

  // Current release branch
  // TODO v3: Bump to release/v3
  const currentReleaseBranch = 'release/v3';
  await octokit.rest.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${currentReleaseBranch}`,
    sha: commit,
    force: false,
  });
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
  const mainBranchCurrentSHA = await getSHA1fromRef(mainBranchName);

  // Create a temporary branch and check it out.
  const tempBranchName = `release-temp/${randomUUID()}`;
  await gitCreateBranch(tempBranchName);
  await gitCheckoutBranch(tempBranchName);
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
    parents: [mainBranchCurrentSHA],
  });

  /**
   * We then update the mainBranch to this new verified commit.
   */
  await octokit.rest.git.updateRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${mainBranchName}`,
    sha: commit.data.sha,
    force: false,
  });
  await gitCheckoutBranch(mainBranchName);
  await gitPull();

  // Delete the temp branch
  await gitDeleteRemoteBranch('origin', tempBranchName);
  return commit.data.sha;
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
