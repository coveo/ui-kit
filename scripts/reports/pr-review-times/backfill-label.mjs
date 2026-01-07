// scripts/reports/pr-review-times/backfill-label.mjs
import {PR_REVIEW_LABELS, REPO_NAME, REPO_OWNER} from './constants.mjs';

export async function backfillCrossTeamLabel(octokit, query) {
  if (!query.includes('repo:')) {
    query = `repo:${REPO_OWNER}/${REPO_NAME} ${query}`;
  }
  if (!query.includes('is:pr')) {
    query = `is:pr ${query}`;
  }

  console.log(`Searching for PRs with query: "${query}"`);

  const iterator = octokit.paginate.iterator(
    octokit.rest.search.issuesAndPullRequests,
    {
      q: query,
      per_page: 100,
    }
  );

  let count = 0;
  let updated = 0;

  for await (const {data: issues} of iterator) {
    for (const issue of issues) {
      if (!issue.pull_request) continue;

      count++;
      const prNumber = issue.number;

      try {
        const {data: pr} = await octokit.rest.pulls.get({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          pull_number: prNumber,
        });

        const teams = pr.requested_teams || [];
        const labelNames = (pr.labels || []).map((l) => l.name);

        process.stdout.write(
          `Checking PR #${prNumber}: ${teams.length} teams... `
        );

        if (teams.length > 1) {
          if (labelNames.includes(PR_REVIEW_LABELS.CROSS_TEAM)) {
            console.log('Skipping (already labeled)');
          } else {
            console.log('ADDING LABEL');
            await octokit.rest.issues.addLabels({
              owner: REPO_OWNER,
              repo: REPO_NAME,
              issue_number: prNumber,
              labels: [PR_REVIEW_LABELS.CROSS_TEAM],
            });
            updated++;
          }
        } else {
          console.log('Skipping (< 2 teams)');
        }
      } catch (e) {
        console.error(`\nFailed to process PR #${prNumber}: ${e.message}`);
      }
    }
  }

  console.log(`\nProcessed ${count} PRs.`);
  console.log(`Updated ${updated} PRs.`);
}
