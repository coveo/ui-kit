#!/usr/bin/env node
import {
  getCurrentVersion,
  getCurrentBranchName,
  gitTag,
  gitDeleteRemoteBranch,
  gitPushTags,
  npmBumpVersion,
  getSHA1fromRef,
  gitCreateBranch,
  gitCheckoutBranch,
  gitAdd,
  gitWriteTree,
  gitCommitTree,
  gitUpdateRef,
  gitPublishBranch,
  gitSetRefOnCommit,
  gitPush,
} from '@coveo/semantic-monorepo-tools';
import {createAppAuth} from '@octokit/auth-app';
import {spawnSync} from 'child_process';
import {readFileSync} from 'fs';
import {Octokit} from 'octokit';
import {dedent} from 'ts-dedent';
import {removeWriteAccessRestrictions} from './lock-master.mjs';

const REPO_OWNER = 'coveo';
const REPO_NAME = 'ui-kit';
const GIT_SSH_REMOTE = 'deploy';

// Commit, tag and push
(async () => {
  const PATH = '.';

  //#region GitHub authentication
  const authSecrets = {
    appId: process.env.RELEASER_APP_ID,
    privateKey: process.env.RELEASER_PRIVATE_KEY,
    clientId: process.env.RELEASER_CLIENT_ID,
    clientSecret: process.env.RELEASER_CLIENT_SECRET,
    installationId: process.env.RELEASER_INSTALLATION_ID,
  };

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: authSecrets,
  });
  //#endregion

  // Define release # andversion
  const currentVersionTag = getCurrentVersion(PATH);
  currentVersionTag.inc('prerelease');
  const npmNewVersion = currentVersionTag.format();
  // Write release version in the root package.json
  await npmBumpVersion(npmNewVersion, PATH);

  // Find all packages that have been released in this release.
  const packagesReleased = readFileSync('.git-message', {
    encoding: 'utf-8',
  }).trim();

  // Compile git commit message
  const commitMessage = dedent`
    [Version Bump][skip ci]: ui-kit publish

    ${packagesReleased}

    **/README.md
    **/CHANGELOG.md
    **/package.json
    README.md
    CHANGELOG.md
    package.json
    package-lock.json
    packages/ui/cra-template/template.json
  `;

  // Craft the commit (complex process, see function)
  const commit = await commitChanges(releaseNumber, commitMessage, octokit);

  // Add the tags locally...
  for (const tag of packagesReleased.split('\n').concat(gitNewTag)) {
    await gitTag(tag, commit);
  }

  // And push them
  await gitPushTags();

  // Unlock the main branch
  await removeWriteAccessRestrictions();
})();

/**
 * "Craft" the signed release commit.
 * @param {string|number} releaseNumber
 * @param {string} commitMessage
 * @param {Octokit} octokit
 * @returns {Promise<string>}
 */
async function commitChanges(releaseNumber, commitMessage, octokit) {
  // Get latest commit and name of the main branch.
  const mainBranchName = await getCurrentBranchName();
  const mainBranchCurrentSHA = await getSHA1fromRef(mainBranchName);

  // Create a temporary branch and check it out.
  const tempBranchName = `release/${releaseNumber}`;
  await gitCreateBranch(tempBranchName);
  await gitCheckoutBranch(tempBranchName);
  runPrecommit();
  // Stage all the changes...
  await gitAdd('.');
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
  await gitSetRefOnCommit(
    GIT_SSH_REMOTE,
    `refs/heads/${mainBranchName}`,
    commit.data.sha,
    true
  );
  await gitPush({remote: GIT_SSH_REMOTE, refs: [mainBranchName], force: true});

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
