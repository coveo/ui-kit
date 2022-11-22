import {gitTag} from '@coveo/semantic-monorepo-tools';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {execute} from './exec.mjs';

/**
 * @typedef {import('./packages.mjs').PackageDefinition} PackageDefinition
 */

const releaseBranch = 'master';

async function getBranchName() {
  return await execute('git', ['branch', '--show-current']);
}

export async function isOnReleaseBranch() {
  return (await getBranchName()) === releaseBranch;
}

export async function getHowManyCommitsBehindUpstream() {
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

/**
 * @param {PackageDefinition[]} updatedPackages
 */
export async function commitVersionBump(updatedPackages) {
  /** @type {{command: {version: {message: string}}}} */
  const lernaConfig = JSON.parse(
    readFileSync(resolve('.', 'lerna.json')).toString()
  );
  const lernaMessageSection = lernaConfig.command.version.message;
  const updatedPackagesMessageSection = updatedPackages
    .map(
      (packageDef) => `\u0020-\u0020${packageDef.name}@${packageDef.version}`
    )
    .join('\n');
  const message = `${lernaMessageSection}\n\n${updatedPackagesMessageSection}`;
  await execute('git', ['commit', '--no-verify', '-m', message]);
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
