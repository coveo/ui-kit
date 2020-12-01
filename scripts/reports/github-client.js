const github = require('@actions/github');
const octokit = github.getOctokit(process.env.GITHUB_CREDENTIALS);
const owner = 'coveo';
const repo = 'ui-kit';

const getPullRequestTitle = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.title;
};

const getPullRequestNumber = () => {
  return (
    (github.context.payload.pull_request &&
      github.context.payload.pull_request.number) ||
    301
  );
};

const getPullRequestComments = () => {
  const issue_number = getPullRequestNumber();
  return octokit.issues.listComments({repo, owner, issue_number});
};

const createPullRequestComment = (body) => {
  const issue_number = getPullRequestNumber();
  return octokit.issues.createComment({repo, owner, issue_number, body});
};

const updatePullRequestComment = (comment_id, body) => {
  return octokit.issues.updateComment({repo, owner, body, comment_id});
};

module.exports = {
  getPullRequestTitle,
  getPullRequestNumber,
  getPullRequestComments,
  createPullRequestComment,
  updatePullRequestComment,
};
