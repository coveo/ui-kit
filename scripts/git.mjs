import {promisify} from 'util';
import {execute} from './exec.mjs';

const releaseBranch = 'master';

async function getBranchName() {
  return await execute('git', ['branch', '--show-current']);
}

export async function isOnReleaseBranch() {
  return (await getBranchName()) === releaseBranch;
}

export async function getHowManyCommitsBehind() {
  return parseInt(await execute('git', ['rev-list', '--count', 'HEAD..@{u}']));
}

export async function getHeadCommitTag() {
  return await execute('git', ['tag', '--points-at', 'HEAD']);
}
