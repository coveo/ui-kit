import {execFileSync} from 'node:child_process';

function git(...args) {
  return execFileSync('git', args, {encoding: 'utf-8'}).trim();
}

export const getCurrentBranchName = () =>
  git('rev-parse', '--abbrev-ref', 'HEAD');

export const getSHA1fromRef = (ref) => git('rev-parse', ref);

export const gitAdd = (path) => git('add', path);

export const gitCommitTree = (tree, parent, message) => {
  const args = ['commit-tree', tree];
  if (parent) args.push('-p', parent);
  if (message) args.push('-m', message);
  return git(...args);
};

export const gitCreateBranch = (name) => git('branch', name);

export const gitDeleteRemoteBranch = (remote, ...refs) =>
  git('push', remote, '--delete', ...refs);

export const gitPublishBranch = (remote, branch) =>
  git('push', '-u', remote, branch);

export const gitPull = () => git('pull');

export const gitSetupUser = (name, email) => {
  if (name) git('config', '--global', 'user.name', name);
  if (email) git('config', '--global', 'user.email', email);
};

export const gitSwitchBranch = (branch) => git('checkout', branch);

export const gitUpdateRef = (ref, value) => git('update-ref', ref, value);

export const gitWriteTree = () => git('write-tree');

export const REPO_OWNER = 'coveo';
export const REPO_NAME = 'ui-kit';
