#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {
  describePnpmTag,
  pnpmPublishPackage,
} from '@coveo/semantic-monorepo-tools';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

/**
 * @param {string} name
 * @param {string} version
 * @param {string} tag
 */
async function isPublished(name, version, tag = version) {
  try {
    const publishedVersion = await describePnpmTag(name, tag);
    return publishedVersion === version;
  } catch (e) {
    const message = /** @type {{stderr?: string}} */ (e).stderr;
    if (message?.includes('code E404')) {
      return false;
    }
    throw e;
  }
}

const isPrerelease = process.env.IS_PRERELEASE === 'true';
const tagSuffix = process.env.PR_NUMBER || '';
/**@type {import('./types.mjs').PackageJson} */
const {name, version} = JSON.parse(
  readFileSync('package.json', {encoding: 'utf-8'})
);
if (!name || !version) {
  throw 'Expected name and version to exist in package.json.';
}
if (!(await isPublished(name, version))) {
  const tagToPublish = isPrerelease
    ? ['alpha', ...(tagSuffix ? [tagSuffix] : [])].join('-')
    : 'beta';
  await pnpmPublishPackage('.', {
    tag: tagToPublish,
    provenance: true,
  });
} else {
  console.log(`Version ${version} is already published.`);
}
