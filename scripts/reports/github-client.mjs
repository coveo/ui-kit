import {context, getOctokit} from '@actions/github';

const octokit = getOctokit(process.env.GITHUB_CREDENTIALS).rest;
const owner = 'coveo';
const repo = 'ui-kit';

const getPullRequestNumber = () => {
  return context.payload.pull_request?.number || 0;
};

export const getPullRequestTitle = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.title;
};

export const getHeadBranchName = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.head.ref;
};

export const getBaseBranchName = async () => {
  const pull_number = getPullRequestNumber();
  return (await octokit.pulls.get({owner, repo, pull_number})).data.base.ref;
};

export const getPullRequestComments = () => {
  const issue_number = getPullRequestNumber();
  return octokit.issues.listComments({repo, owner, issue_number});
};

export const createPullRequestComment = (body) => {
  const issue_number = getPullRequestNumber();
  return octokit.issues.createComment({repo, owner, issue_number, body});
};

export const updatePullRequestComment = (comment_id, body) => {
  return octokit.issues.updateComment({repo, owner, body, comment_id});
};
