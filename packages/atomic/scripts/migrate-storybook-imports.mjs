#!/usr/bin/env node

/**
 * Migration script: adds side-effect component imports to Storybook story files.
 *
 * For each *.new.stories.tsx file, scans templates and string literals for
 * `atomic-*` custom element tags and adds corresponding source imports so
 * Storybook can resolve components directly from source (no autoloader).
 *
 * Usage:
 *   node scripts/migrate-storybook-imports.mjs            # dry-run (default)
 *   node scripts/migrate-storybook-imports.mjs --write    # apply changes
 */

import {globSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

const dryRun = !process.argv.includes('--write');

// ── Step 1: Build tag → source-path map ─────────────────────────────────────

/**
 * Scans src/components/<category>/<component-dir> for all component folders
 * and returns a map of tag-name → import path.
 *
 * Example: 'atomic-search-box' → '@/src/components/search/atomic-search-box/atomic-search-box.js'
 */
function buildTagToImportMap() {
  const componentsDir = join(packageRoot, 'src', 'components');
  const categories = readdirSync(componentsDir, {withFileTypes: true})
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const map = new Map();

  for (const category of categories) {
    const categoryDir = join(componentsDir, category);
    const entries = readdirSync(categoryDir, {withFileTypes: true}).filter(
      (d) => d.isDirectory() && d.name.startsWith('atomic-')
    );

    for (const entry of entries) {
      const tagName = entry.name;
      const importPath = `@/src/components/${category}/${tagName}/${tagName}.js`;
      map.set(tagName, importPath);
    }
  }

  return map;
}

// ── Step 2: Extract custom element tags from file content ───────────────────

/**
 * Extracts all unique `atomic-*` tag names found in HTML-like content within
 * a TypeScript/TSX file. Scans:
 * - Lit html`` template literals
 * - String literals (single/double-quoted, including template interpolations)
 * - JSX-like content
 */
function extractAtomicTags(content) {
  const tags = new Set();

  for (const match of content.matchAll(/<(atomic-[\w-]+)[>\s/]/g)) {
    tags.add(match[1]);
  }

  // Also catch tags inside string attributes like default-slot="<atomic-foo>..."
  for (const match of content.matchAll(
    /['"`]((?:[^'"`\\]|\\.)*atomic-[\w-]+(?:[^'"`\\]|\\.)*)['"`]/g
  )) {
    for (const innerMatch of match[1].matchAll(/<(atomic-[\w-]+)/g)) {
      tags.add(innerMatch[1]);
    }
  }

  // Catch tag names in querySelectorAll/querySelector calls
  for (const match of content.matchAll(
    /querySelector(?:All)?\s*[<(]\s*['"`](atomic-[\w-]+)['"`]/g
  )) {
    tags.add(match[1]);
  }

  // Catch tag names passed to customElements.whenDefined
  for (const match of content.matchAll(
    /customElements\.whenDefined\s*\(\s*['"`](atomic-[\w-]+)['"`]/g
  )) {
    tags.add(match[1]);
  }

  // Catch component tag in getStorybookHelpers('atomic-xxx')
  for (const match of content.matchAll(
    /getStorybookHelpers\s*\(\s*['"`](atomic-[\w-]+)['"`]/g
  )) {
    tags.add(match[1]);
  }

  // Catch component: 'atomic-xxx' in meta
  for (const match of content.matchAll(
    /component:\s*['"`](atomic-[\w-]+)['"`]/g
  )) {
    tags.add(match[1]);
  }

  return tags;
}

// ── Step 3: Determine which imports are already present ─────────────────────

/**
 * Checks if a file already has a side-effect or named import that resolves
 * to a given component. Matches patterns like:
 *   import '@/src/components/.../atomic-foo/atomic-foo.js';
 *   import {AtomicFoo} from '@/src/components/.../atomic-foo/atomic-foo';
 *   import '../src/components/.../atomic-foo/atomic-foo.js';
 */
function getExistingImportedComponents(content) {
  const imported = new Set();
  for (const match of content.matchAll(
    /import\s+.*['"]([^'"]+atomic-[\w-]+(?:\/atomic-[\w-]+)?(?:\.js|\.ts)?)['"]/g
  )) {
    const path = match[1];
    // Extract tag name from path like @/src/components/search/atomic-search-box/atomic-search-box.js
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1].replace(/\.(js|ts)$/, '');
    if (lastSegment.startsWith('atomic-')) {
      imported.add(lastSegment);
    }
  }
  return imported;
}

// ── Step 4: Process each story file ─────────────────────────────────────────

function processFile(filePath, tagMap) {
  const content = readFileSync(filePath, 'utf-8');
  const tags = extractAtomicTags(content);
  const alreadyImported = getExistingImportedComponents(content);

  // Filter to tags that have a known source path and aren't already imported
  const newImports = [];
  for (const tag of [...tags].sort()) {
    if (alreadyImported.has(tag)) continue;
    const importPath = tagMap.get(tag);
    if (!importPath) {
      // Unknown component — might be from a different package or deprecated
      continue;
    }
    newImports.push(`import '${importPath}';`);
  }

  if (newImports.length === 0) {
    return {changed: false, imports: 0};
  }

  // Find the insertion point: after the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  let inMultiLineImport = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (inMultiLineImport) {
      // Inside a multi-line import — look for the closing line
      if (line.includes('from ')) {
        inMultiLineImport = false;
        lastImportIndex = i;
      }
      continue;
    }

    // Single-line import: import ... from '...';
    // or side-effect import: import '...';
    if (line.startsWith('import ') || line.startsWith('import{')) {
      if (
        line.includes('from ') ||
        (line.includes("'") && line.endsWith("';"))
      ) {
        // Complete single-line import
        lastImportIndex = i;
      } else {
        // Start of a multi-line import (e.g., import type {\n  Foo,\n} from ...)
        inMultiLineImport = true;
      }
      continue;
    }

    // If we've seen imports and hit a non-empty, non-comment line, stop
    if (
      lastImportIndex >= 0 &&
      !inMultiLineImport &&
      line !== '' &&
      !line.startsWith('//')
    ) {
      break;
    }
  }

  if (lastImportIndex === -1) {
    // No imports found — put at top of file
    lastImportIndex = 0;
  }

  // Insert new imports after the last import
  const newContent = [
    ...lines.slice(0, lastImportIndex + 1),
    ...newImports,
    ...lines.slice(lastImportIndex + 1),
  ].join('\n');

  if (!dryRun) {
    writeFileSync(filePath, newContent, 'utf-8');
  }

  return {changed: true, imports: newImports.length, newImports};
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log(
    dryRun ? '🔍 DRY RUN MODE (use --write to apply)\n' : '✏️  WRITE MODE\n'
  );

  const tagMap = buildTagToImportMap();
  console.log(`Found ${tagMap.size} component tag mappings\n`);

  const storyFiles = globSync(
    ['src/**/*.new.stories.tsx', 'storybook-pages/**/*.new.stories.tsx'],
    {cwd: packageRoot, absolute: true}
  );

  console.log(`Found ${storyFiles.length} story files\n`);

  let totalChanged = 0;
  let totalImports = 0;

  for (const file of storyFiles.sort()) {
    const relPath = relative(packageRoot, file);
    const result = processFile(file, tagMap);

    if (result.changed) {
      totalChanged++;
      totalImports += result.imports;
      console.log(
        `  ${dryRun ? 'Would update' : 'Updated'}: ${relPath} (+${result.imports} imports)`
      );
      if (result.newImports) {
        for (const imp of result.newImports) {
          console.log(`    ${imp}`);
        }
      }
    }
  }

  console.log(
    `\n${dryRun ? 'Would update' : 'Updated'} ${totalChanged} files with ${totalImports} new imports`
  );
}

main();
