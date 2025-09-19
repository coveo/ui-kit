#!/usr/bin/env node
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describeNpmTag} from '@coveo/semantic-monorepo-tools';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

/**
 * @param {string} name
 * @param {string} tag
 */
async function getVersion(name, tag) {
  try {
    const publishedVersion = await describeNpmTag(name, tag);
    return publishedVersion;
  } catch (e) {
    const message = /** @type {{stderr?: string}} */ (e).stderr;
    if (message?.includes('code E404')) {
      return false;
    }
    throw e;
  }
}

const tagSuffix = process.env.TAG_SUFFIX || '';
/** @type {import('@npmcli/package-json').PackageJson} */
const {name} = JSON.parse(readFileSync('package.json', {encoding: 'utf-8'}));
if (!name) {
  throw 'Expected name to exist in package.json.';
}
const tag = ['alpha', ...(tagSuffix ? [tagSuffix] : [])].join('-');
const version = await getVersion(name, tag);
execSync(`npm deprecate ${name}@${version}`, {stdio: 'inherit'});
