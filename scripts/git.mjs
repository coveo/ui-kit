import {promisify} from 'util';
import {execute} from './exec.mjs';

const releaseBranch = 'master';

async function getBranchName() {
  const {stdout} = await execute('git', ['branch', '--show-current']);
  return stdout;
}

export async function isOnReleaseBranch() {
  return (await getBranchName()) === releaseBranch;
}

export async function getHowManyCommitsBehind() {
  const {stdout} = await execute('git', ['rev-list', '--count HEAD..@{u}']);
  return parseInt(stdout);
}

export async function getHeadCommitTag() {
  const {stdout} = await execute('git', ['tag', '--points-at HEAD']);
  return stdout;
}
