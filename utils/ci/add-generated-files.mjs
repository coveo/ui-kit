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
  REPO_NAME,
  REPO_OWNER,
} from './common/git.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

const token = process.env.GITHUB_INSTALLATION_TOKEN;
if (!token) {
  throw new Error('GITHUB_INSTALLATION_TOKEN is required');
}

const GIT_USERNAME = 'developer-experience-bot[bot]';
const GIT_EMAIL =
  '91079284+developer-experience-bot[bot]@users.noreply.github.com';

gitSetupUser(GIT_USERNAME, GIT_EMAIL);

const currentBranchName = getCurrentBranchName();
const currentSHA = getSHA1fromRef(currentBranchName);

const tempBranchName = `ui-kit-temp/${randomUUID()}`;
gitCreateBranch(tempBranchName);
gitSwitchBranch(tempBranchName);

gitAdd('.');

// Lint staged files
spawnSync(
  `pnpm${process.platform === 'win32' ? '.cmd' : ''}`,
  ['run', 'pre-commit'],
  {stdio: 'inherit'}
);

const treeSHA = gitWriteTree();
const commitTree = gitCommitTree(treeSHA, tempBranchName, 'tempcommit');

gitUpdateRef('HEAD', commitTree);
gitPublishBranch('origin', tempBranchName);

const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
};

// Create a verified commit via the GitHub API
const commitRes = await fetch(`${apiBase}/git/commits`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    message: 'Add generated files',
    tree: treeSHA,
    parents: [currentSHA],
  }),
});
if (!commitRes.ok) {
  throw new Error(
    `Failed to create commit: ${commitRes.status} ${await commitRes.text()}`
  );
}
const commit = await commitRes.json();

// Update the branch ref to point to the new verified commit
const updateRes = await fetch(
  `${apiBase}/git/refs/heads/${currentBranchName}`,
  {
    method: 'PATCH',
    headers,
    body: JSON.stringify({sha: commit.sha, force: false}),
  }
);
if (!updateRes.ok) {
  throw new Error(
    `Failed to update ref: ${updateRes.status} ${await updateRes.text()}`
  );
}

gitSwitchBranch(currentBranchName);
gitPull();

// Clean up the temp branch
gitDeleteRemoteBranch('origin', tempBranchName);

console.log(`Created verified commit ${commit.sha}`);
