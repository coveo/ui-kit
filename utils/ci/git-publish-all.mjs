#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
import {gitPushTags, gitTag} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import {dedent} from 'ts-dedent';
import {
  REPO_NAME,
  REPO_OWNER,
  REPO_RELEASE_BRANCH,
} from './common/constants.mjs';
import {commitChanges, setupGit} from './common/git.mjs';
import {removeWriteAccessRestrictions} from './lock-main.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

// Commit, tag and push
if (!process.env.GITHUB_INSTALLATION_TOKEN) {
  throw new Error(
    'Missing required GITHUB_INSTALLATION_TOKEN environment variable. Cannot proceed with GitHub operations.'
  );
}
const octokit = new Octokit({
  auth: process.env.GITHUB_INSTALLATION_TOKEN,
});

// Find all packages that have been released in this release.
const gitMessageExists = existsSync('.git-message');
const packagesReleased = gitMessageExists
  ? readFileSync('.git-message', {
      encoding: 'utf-8',
    }).trim()
  : '';

// Compile git commit message
const commitMessage = dedent`
  [Version Bump][skip ci]: ui-kit publish

  ${packagesReleased}

  **/CHANGELOG.md
  CHANGELOG.md
  package.json
  **/package.json
`;

// Setup Git with the bot user
await setupGit();

// Craft the commit (complex process, see function)
const commit = await commitChanges(commitMessage, octokit);

// Add the tags locally...
if (gitMessageExists) {
  for (const tag of packagesReleased
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t)) {
    await gitTag(tag, commit);
  }
}

// And push them
await gitPushTags();

// Current release branch
await octokit.rest.git.updateRef({
  owner: REPO_OWNER,
  repo: REPO_NAME,
  ref: `heads/${REPO_RELEASE_BRANCH}`,
  sha: commit,
});
// Unlock the main branch
await removeWriteAccessRestrictions();
