#!/usr/bin/env node

import {cpSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Copy a single path (file or directory) to a target location
 * @param {string} source - Source path to copy from
 * @param {string} target - Target path to copy to
 * @returns {boolean} - True if copy was successful, false otherwise
 */
function copyPath(source, target) {
  const resolvedSource = resolve(source);
  const resolvedTarget = resolve(target);

  if (existsSync(resolvedSource)) {
    console.log(`Copying ${resolvedSource} to ${resolvedTarget}`);
    cpSync(resolvedSource, resolvedTarget, {recursive: true, force: true});
    return true;
  } else {
    console.warn(`Source path does not exist: ${resolvedSource}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage: node copy-files.mjs <source> <target> [<source2> <target2> ...]'
    );
    console.error('');
    console.error('Examples:');
    console.error('  node copy-files.mjs ./src/assets ./dist/assets');
    console.error(
      '  node copy-files.mjs ./assets ./dist/assets ./lang ./dist/lang'
    );
    process.exit(1);
  }

  if (args.length % 2 !== 0) {
    console.error('Error: Arguments must be provided in pairs (source target)');
    process.exit(1);
  }

  let allSuccessful = true;

  for (let i = 0; i < args.length; i += 2) {
    const source = args[i];
    const target = args[i + 1];

    if (!copyPath(source, target)) {
      allSuccessful = false;
    }
  }

  if (!allSuccessful) {
    console.warn('Some copy operations failed - see warnings above');
    process.exit(1);
  }

  console.log('All copy operations completed successfully');
}

main();
