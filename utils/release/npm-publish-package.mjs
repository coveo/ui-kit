#!/usr/bin/env node
import {describeNpmTag, npmPublish} from '@coveo/semantic-monorepo-tools';
import retry from 'async-retry';
import {readFileSync} from 'node:fs';

const isPrerelease = process.env.IS_PRERELEASE === 'true';

/** @type {import('@npmcli/package-json').PackageJson} */
const {name, version} = JSON.parse(
  readFileSync('package.json', {encoding: 'utf-8'})
);
if (!name || !version) {
  throw 'Expected name and version to exist in package.json.';
}
const tagToPublish = isPrerelease ? 'alpha' : 'latest';
await npmPublish('.', {tag: tagToPublish});
await retry(
  async () => {
    if ((await describeNpmTag(name, tagToPublish)) !== version) {
      throw new Error('Version not available');
    }
  },
  {retries: 30}
);
