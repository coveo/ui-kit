#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join, relative} from 'node:path';

const EXCLUDED_PACKAGES = new Set(['@coveo/quantic']);

const workspacePackages = JSON.parse(
  execFileSync('pnpm', ['list', '--recursive', '--json', '--depth=-1', '--long'], {
    encoding: 'utf8',
  })
);
const packages = workspacePackages.filter(
  ({name, private: isPrivate}) => name && !isPrivate && !EXCLUDED_PACKAGES.has(name)
);
const missingTasks = packages.filter(({path}) => {
  const pkg = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'));
  return !pkg.scripts?.publint;
});

if (missingTasks.length > 0) {
  console.error('The following eligible public packages are missing a publint task:');
  for (const {name, path} of missingTasks) {
    console.error(`- ${name} (${relative(process.cwd(), join(path, 'package.json'))})`);
  }
  process.exitCode = 1;
} else {
  console.info(`All ${packages.length} eligible public packages declare a publint task.`);
}
