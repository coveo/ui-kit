#!/usr/bin/env node
import {Octokit} from 'octokit';
import {
  REPO_NAME,
  REPO_OWNER,
  REPO_RELEASE_BRANCH,
} from './common/constants.mjs';
import {commitChanges, setupGit} from './common/git.mjs';
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

  // Setup Git with the bot user
  await setupGit();

  // Compile git commit message
  const commitMessage = 'Add generated files';

  // Craft the commit (complex process, see function)
  const commit = await commitChanges(commitMessage, octokit);

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
