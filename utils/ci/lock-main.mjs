/**
 * Because our release process creates release commits on our main branch,
 * it needs to reserve the branch when running, so that no 'new commits' come up.
 */
import {Octokit} from 'octokit';
import {REPO_NAME, REPO_OWNER} from './common/constants.mjs';

const RELEASE_FREEZE_ID = 215874;

export const limitWriteAccessToBot = () => changeBranchRestrictions(true);

export const removeWriteAccessRestrictions = () =>
  changeBranchRestrictions(false);

/**
 * Lock/Unlock the main branch to only allow the 🤖 to write on it.
 * @param {boolean} onlyBot
 */
async function changeBranchRestrictions(onlyBot) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_INSTALLATION_TOKEN,
  });
  // Requires branches to be up to date before merging
  await octokit.rest.repos.updateRepoRuleset({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ruleset_id: RELEASE_FREEZE_ID,
    enforcement: onlyBot ? 'active' : 'disabled',
  });
}
