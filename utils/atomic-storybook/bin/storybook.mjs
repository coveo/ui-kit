#!/usr/bin/env node
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execute} from '../../../scripts/exec.mjs';
import {workspacesRoot} from '../../../scripts/packages.mjs';

const binDirectories = [
  resolve(fileURLToPath(import.meta.url), '..', '..', 'node_modules', '.bin'),
  resolve(workspacesRoot, 'node_modules', '.bin'),
];

/**
 * @param {string} name
 */
function findBinary(name) {
  const fileName = binDirectories
    .map((binDirectory) => resolve(binDirectory, name))
    .find((fileName) => existsSync(fileName));
  if (!fileName) {
    throw `Could not find binary for ${name}.`;
  }
  return fileName;
}

/**
 * @param {string} command
 * @param {string[]} params
 */
async function main(command, ...params) {
  switch (command) {
    case 'build':
      await execute(findBinary('build-storybook'), params);
      return;
    case 'start':
      await execute(findBinary('start-storybook'), params);
      return;
    case 'analyze':
      await execute(findBinary('lit-analyzer'), params);
      return;
    default:
      throw 'Invalid command';
  }
}

await main(...process.argv.slice(2));
