/**
 * Rewrites `@/src/...` path aliases to relative paths in compiled output.
 *
 * TypeScript does not rewrite tsconfig `paths` aliases in emitted JS or .d.ts
 * files. This script runs after `tsc` and replaces every `@/src/X` import
 * specifier with the correct relative path based on the importing file's
 * location within `dist/`.
 */

import {readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const ALIAS_RE = /(?<quote>['"])@\/src\/(?<path>[^'"]+)\k<quote>/g;

async function collectFiles(dir) {
  const entries = await readdir(dir, {withFileTypes: true, recursive: true});
  return entries
    .filter((e) => e.isFile() && /\.(js|d\.[cm]?ts)$/.test(e.name))
    .map((e) => join(e.parentPath, e.name));
}

function toRelative(importPath, fromFile) {
  const target = join(distDir, importPath);
  const rel = relative(dirname(fromFile), target);
  return rel.startsWith('.') ? rel : `./${rel}`;
}

async function processFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const result = content.replace(ALIAS_RE, (_, quote, path) => {
    return `${quote}${toRelative(path, filePath)}${quote}`;
  });
  if (result === content) return false;
  await writeFile(filePath, result);
  return true;
}

const files = await collectFiles(distDir);
let changed = 0;
for (const file of files) {
  if (await processFile(file)) changed++;
}
console.log(`resolve-path-aliases: rewrote imports in ${changed} file(s)`);
