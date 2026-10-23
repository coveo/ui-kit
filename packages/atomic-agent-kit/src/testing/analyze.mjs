import path from 'node:path';
import {cli} from '@custom-elements-manifest/analyzer/cli.js';

/**
 * The Atomic package of this monorepo, which the specs of the kit run against.
 */
export const atomicRoot = path.resolve(import.meta.dirname, '../../../atomic');

const analyses = new Map();

/**
 * Builds the manifest of the Atomic package at `root` the way its `build:cem` does, through
 * the analyzer's CLI and the package's `custom-elements-manifest.config.mjs`, without writing
 * it. Analyzed once per root and process.
 *
 * The CLI also records the manifest path in the `package.json` of the process's working
 * directory, so the call runs from `root`, whose `package.json` already has it.
 *
 * @param {string} [root]
 */
export function analyzeManifest(root = atomicRoot) {
  if (!analyses.has(root)) {
    analyses.set(root, analyzeFrom(root));
  }
  return analyses.get(root);
}

async function analyzeFrom(root) {
  const previousDirectory = process.cwd();
  process.chdir(root);
  try {
    return await cli({argv: ['analyze', '--quiet'], cwd: root, noWrite: true});
  } finally {
    process.chdir(previousDirectory);
  }
}
