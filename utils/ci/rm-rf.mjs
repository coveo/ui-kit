#!/usr/bin/env node

import {existsSync, readdirSync, rmSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';

/**
 * Simple glob expansion for patterns like "dist/*"
 * @param {string} pattern - Path pattern that may contain wildcards
 * @returns {string[]} - Array of matched paths
 */
function expandGlob(pattern) {
  const resolvedPattern = resolve(pattern);

  if (!pattern.includes('*')) {
    return [resolvedPattern];
  }

  if (pattern.endsWith('/*')) {
    const dir = resolvedPattern.slice(0, -2);
    if (!existsSync(dir)) {
      return [];
    }
    try {
      const entries = readdirSync(dir);
      return entries.map((entry) => join(dir, entry));
    } catch (_err) {
      console.warn(`Warning: Could not read directory ${dir}`);
      return [];
    }
  }

  const dir = dirname(resolvedPattern);
  const filePattern = basename(resolvedPattern);

  if (!existsSync(dir)) {
    return [];
  }

  try {
    const entries = readdirSync(dir);
    const regex = new RegExp(
      `^${filePattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`
    );
    const matches = entries.filter((entry) => regex.test(entry));
    return matches.map((entry) => join(dir, entry));
  } catch (_err) {
    console.warn(`Warning: Could not read directory ${dir}`);
    return [];
  }
}

/**
 * Remove files and directories recursively (equivalent to rm -rf)
 * Supports simple glob patterns (for example, dist/*, *.tmp)
 *
 * @param {string[]} paths - Paths to remove (can include simple glob patterns)
 */
function removeRecursive(paths) {
  if (paths.length === 0) {
    console.error('Usage: node rm-rf.mjs <path> [<path2> ...]');
    console.error('');
    console.error('Examples:');
    console.error('  node rm-rf.mjs ./dist');
    console.error('  node rm-rf.mjs ./dist ./build ./temp');
    console.error('  node rm-rf.mjs dist/* build/*');
    process.exit(1);
  }

  for (const path of paths) {
    const expandedPaths = expandGlob(path);

    for (const resolvedPath of expandedPaths) {
      try {
        rmSync(resolvedPath, {recursive: true, force: true});
        console.log(`Removed: ${resolvedPath}`);
      } catch (err) {
        if (
          err &&
          typeof err === 'object' &&
          'code' in err &&
          err.code !== 'ENOENT'
        ) {
          console.error(`Error removing ${resolvedPath}:`, String(err));
        }
      }
    }
  }
}

const args = process.argv.slice(2);
removeRecursive(args);
