#!/usr/bin/env node
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  getCurrentVersion,
  getNextVersion,
} from '@coveo/semantic-monorepo-tools';

if (!process.env.INIT_CWD) {
  throw new Error('Should be called using pnpm run');
}
process.chdir(process.env.INIT_CWD);

const PATH = '.';

console.log('Bumping root package.json version');
const currentVersion = getCurrentVersion(PATH);
const nextVersion = getNextVersion(currentVersion, {type: 'patch'});

const packageJsonPath = resolve(PATH, 'package.json');
const packageJson = JSON.parse(
  readFileSync(packageJsonPath, {encoding: 'utf-8'})
);
packageJson.version = nextVersion;

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`Updated root package version to ${nextVersion}`);
