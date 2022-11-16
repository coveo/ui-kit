import {gitTag} from '@coveo/semantic-monorepo-tools';
import {readFileSync} from 'fs';
import {resolve} from 'path';
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

/**
 * @param {string} tag
 */
export async function tagExists(tag) {
  return !!(await execute('git', ['tag', '-l', tag]));
}

export async function stageAll() {
  await execute('git', ['add', '.']);
}

export async function commitVersionBump() {
  /** @type {{command: {version: {message: string}}}} */
  const lernaConfig = JSON.parse(
    readFileSync(resolve('.', 'lerna.json')).toString()
  );
  const {message} = lernaConfig.command.version;
  await execute('git', ['commit', '-m', message]);
}

/**
 * @param {PackageDefinition[]} packages
 */
export async function tagPackages(packages) {
  for (const {name, version} of packages) {
    const tag = `${name}@${version}`;
    await gitTag(tag);
  }
}
