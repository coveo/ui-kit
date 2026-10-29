export const ISSUE_TITLE = 'Flaky test report';
const REPORT_LABEL = 'flaky-test-report';
// Only an issue the workflow itself opened is ever rewritten, whoever else uses the label.
const REPORT_AUTHOR = 'github-actions[bot]';

export async function findReportIssue({octokit, owner, repo}) {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    labels: REPORT_LABEL,
    state: 'open',
    per_page: 100,
  });
  return (
    issues.find(
      (issue) =>
        !issue.pull_request && issue.title === ISSUE_TITLE && issue.user?.login === REPORT_AUTHOR
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

// Runs on every publish, so an issue someone unpinned is pinned again.
async function pin({octokit}, issue) {
  try {
    const {node} = await octokit.graphql(
      'query($id: ID!) { node(id: $id) { ... on Issue { isPinned } } }',
      {id: issue.node_id}
    );
    if (!node.isPinned) {
      await octokit.graphql(
        'mutation($id: ID!) { pinIssue(input: {issueId: $id}) { issue { number } } }',
        {id: issue.node_id}
      );
    }
  } catch (error) {
    console.log(`Could not pin issue #${issue.number}, so pin it by hand: ${error.message}`);
  }
}

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
      title: ISSUE_TITLE,
      body: report.body,
      labels: [REPORT_LABEL],
    }));
  }
  await pin(github, target);
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: target.number,
    body: report.comment,
  });
  return target.html_url;
}
