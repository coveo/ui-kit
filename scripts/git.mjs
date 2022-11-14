import {promisify} from 'util';
const exec = promisify(require('child_process').exec);

const releaseBranch = 'master';

async function getBranchName() {
  const {stdout} = await exec('git branch --show-current');
  return stdout;
}

export async function isOnReleaseBranch() {
  return (await getBranchName()) === releaseBranch;
}

export async function getHowManyCommitsBehind() {
  const {stdout} = await exec('git rev-list --count HEAD..@{u}');
  return parseInt(stdout);
}

export async function getHeadCommitTag() {
  const {stdout} = await exec('git tag --points-at HEAD');
  return stdout;
}
