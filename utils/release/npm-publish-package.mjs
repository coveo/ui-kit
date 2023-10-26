#!/usr/bin/env node
import {describeNpmTag, npmPublish} from '@coveo/semantic-monorepo-tools';
import retry from 'async-retry';
import {readFileSync} from 'node:fs';

/**
 * @param {string} name
 * @param {string} version
 * @param {string} tag
 */
async function isPublished(name, version, tag = version) {
  try {
    const publishedVersion = await describeNpmTag(name, tag);
    return publishedVersion === version;
  } catch (e) {
    const message = /** @type {{stderr?: string}} */ (e).stderr;
    if (message && message.includes('code E404')) {
      return false;
    }
    throw e;
  }
}

const isPrerelease = process.env.IS_PRERELEASE === 'true';

/** @type {import('@npmcli/package-json').PackageJson} */
const {name, version} = JSON.parse(
  readFileSync('package.json', {encoding: 'utf-8'})
);
if (!name || !version) {
  throw 'Expected name and version to exist in package.json.';
}
if (!(await isPublished(name, version))) {
  const tagToPublish = isPrerelease ? 'alpha' : 'beta';
  await npmPublish('.', {tag: tagToPublish});
  await retry(
    async () => {
      if (!(await isPublished(name, version, tagToPublish))) {
        throw new Error('Version not available');
      }
    },
    {retries: 30}
  );
} else {
  console.log(`Version ${version} is already published.`);
}
