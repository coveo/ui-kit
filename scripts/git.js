const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

const releaseBranch = 'master';

async function getBranchName() {
  const {stdout} = await exec('git branch --show-current');
  return stdout;
}

async function isOnReleaseBranch() {
  return (await getBranchName()) === releaseBranch;
}

async function getHowManyCommitsBehind() {
  const {stdout} = await exec('git rev-list --count HEAD..@{u}');
  return parseInt(stdout);
}

async function getHeadCommitTag() {
  const {stdout} = await exec('git tag --points-at HEAD');
  return stdout;
}

module.exports = {isOnReleaseBranch, getHowManyCommitsBehind, getHeadCommitTag};
