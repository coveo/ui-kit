#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {describeNpmTag, npmPublish} from '@coveo/semantic-monorepo-tools';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

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
    if (message?.includes('code E404')) {
      return false;
    }
    throw e;
  }
}

const shouldProvideProvenance =
  !isPrerelease &&
  process.env.npm_config_registry !== 'https://npm.pkg.github.com';
const tagSuffix = process.env.TAG_SUFFIX || '';
const shouldProvideProvenance =
  process.env.npm_config_registry !== 'https://npm.pkg.github.com';
/** @type {import('@npmcli/package-json').PackageJson} */
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
  await npmPublish('.', {
    tag: tagToPublish,
    provenance: shouldProvideProvenance,
  });
} else {
  console.log(`Version ${version} is already published.`);
}
