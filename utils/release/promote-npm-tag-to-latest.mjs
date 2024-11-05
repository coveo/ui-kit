#!/usr/bin/env node
import {describeNpmTag, npmSetTag} from '@coveo/semantic-monorepo-tools';
import {readFileSync} from 'node:fs';
import {gt} from 'semver';
import {NPM_LATEST_TAG} from './common/constants.mjs';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using npm run-script');
}
process.chdir(process.env.INIT_CWD);

const {name, version} = JSON.parse(
  readFileSync('package.json', {encoding: 'utf-8'})
);

const publishedVersion = await describeNpmTag(name, NPM_LATEST_TAG);

if (gt(publishedVersion, version)) {
  console.log(
    `skipping tag update for ${name} because version "${version}" is not greater than latest version "${publishedVersion}".`
  );
  process.exit(1);
}

await npmSetTag(name, version, NPM_LATEST_TAG);
