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
const octokit = new Octokit({
  auth: process.env.GITHUB_INSTALLATION_TOKEN,
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
  CHANGELOG.md
  package.json
  **/package.json
`;

// Setup Git with the bot user
await setupGit();

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
await octokit.rest.git.updateRef({
  owner: REPO_OWNER,
  repo: REPO_NAME,
  ref: `heads/${REPO_RELEASE_BRANCH}`,
  sha: commit,
  force: false,
});
// Unlock the main branch
await removeWriteAccessRestrictions();
