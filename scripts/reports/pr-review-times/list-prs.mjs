// scripts/reports/pr-review-times/list-prs.mjs
import {REPO_NAME, REPO_OWNER} from './constants.mjs';

/**
 * Fetch all PRs matching the query
 * @param {object} octokit
 * @param {string} query
 */
export async function listPrs(octokit, query) {
  console.log(`Searching for PRs with query: "${query}"...`);
  // If the query doesn't contain 'repo:', prepend the default repo
  let q = query;
  if (!q.includes('repo:')) {
    q = `repo:${REPO_OWNER}/${REPO_NAME} ${q}`;
  }

  const options = octokit.rest.search.issuesAndPullRequests.endpoint.merge({
    q,
    per_page: 100,
  });

  const results = await octokit.paginate(options);
  return results;
}
