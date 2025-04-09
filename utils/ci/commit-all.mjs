#!/usr/bin/env node
import {gitPushTags} from '@coveo/semantic-monorepo-tools';
import {Octokit} from 'octokit';
import {commitChanges} from './common/commit.mjs';
import {
  REPO_NAME,
  REPO_OWNER,
  REPO_RELEASE_BRANCH,
} from './common/constants.mjs';
import {removeWriteAccessRestrictions} from './lock-master.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

// Commit, tag and push
(async () => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_INSTALLATION_TOKEN,
  });

  // Compile git commit message
  const commitMessage = 'Add generated files';

  // Craft the commit (complex process, see function)
  const commit = await commitChanges(commitMessage, octokit);

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
})();
