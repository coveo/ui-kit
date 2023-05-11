/**
 * Because our release process creates release commits on our main branch,
 * it needs to reserve the branch when running, so that no 'new commits' come up.
 */
import {Octokit} from 'octokit';

const REPO_OWNER = 'coveo';
const REPO_NAME = 'cli';
const MAIN_BRANCH_NAME = 'master';
const COVEO_CLI_MASTER = {
  owner: REPO_OWNER,
  repo: REPO_NAME,
  branch: MAIN_BRANCH_NAME,
};
export const limitWriteAccessToBot = () => changeBranchRestrictions(true);

export const removeWriteAccessRestrictions = () =>
  changeBranchRestrictions(false);

/**
 * Lock/Unlock the main branch to only allow the 🤖 to write on it.
 * Note: admins can always bypass.
 * @param {boolean} onlyBot
 */
async function changeBranchRestrictions(onlyBot) {
  const octokit = new Octokit({auth: process.env.GITHUB_CREDENTIALS});
  // Requires branches to be up to date before merging
  await octokit.rest.repos.updateStatusCheckProtection({
    ...COVEO_CLI_MASTER,
    strict: onlyBot,
  });
}
