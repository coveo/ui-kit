// Finds and updates the flaky test report issue, creating and pinning it on the first run.
const REPORT_LABEL = 'flaky-test-report';
// Only an issue the workflow itself opened is ever rewritten, whoever else uses the label.
const REPORT_AUTHOR = 'github-actions[bot]';

export async function findReportIssue({octokit, owner, repo}, title) {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    labels: REPORT_LABEL,
    state: 'open',
    per_page: 100,
  });
  return (
    issues.find(
      (issue) => !issue.pull_request && issue.title === title && issue.user?.login === REPORT_AUTHOR
    ) ?? null
  );
}

async function ensureLabel({octokit, owner, repo}) {
  try {
    await octokit.rest.issues.getLabel({owner, repo, name: REPORT_LABEL});
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
    await octokit.rest.issues.createLabel({
      owner,
      repo,
      name: REPORT_LABEL,
      color: 'fbca04',
      description: 'Weekly flaky test report from .github/workflows/flaky-report.yml',
    });
  }
}

async function pin({octokit}, issue) {
  try {
    await octokit.graphql(
      'mutation($issueId: ID!) { pinIssue(input: {issueId: $issueId}) { issue { number } } }',
      {issueId: issue.node_id}
    );
  } catch (error) {
    console.log(`Could not pin issue #${issue.number}, so pin it by hand: ${error.message}`);
  }
}

/** Replaces the report issue's description and posts the weekly comment. */
export async function publishReport(github, {issue, report}) {
  const {octokit, owner, repo} = github;
  let target = issue;
  if (target) {
    await octokit.rest.issues.update({owner, repo, issue_number: target.number, body: report.body});
  } else {
    await ensureLabel(github);
    ({data: target} = await octokit.rest.issues.create({
      owner,
      repo,
      title: report.title,
      body: report.body,
      labels: [REPORT_LABEL],
    }));
    await pin(github, target);
  }
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: target.number,
    body: report.comment,
  });
  return target.html_url;
}
