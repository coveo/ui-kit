#!/usr/bin/env node

/**
 * Static analysis script to detect invalid `:host` selectors in Light DOM components.
 *
 * Problem: When a Lit component uses LightDomMixin (no Shadow DOM), the `:host` CSS selector
 * doesn't work as intended because there's no shadow boundary. This can cause styles to leak
 * onto parent elements, leading to subtle production bugs.
 *
 * This script:
 * 1. Finds all Lit components that use LightDomMixin or ItemSectionMixin
 * 2. Checks if they have `static styles` with `:host` selector (inline or imported)
 * 3. Recursively follows style imports to detect `:host` in imported CSS files
 * 4. Reports any violations
 *
 * Usage:
 *   node scripts/check-light-dom-host-selectors.mjs
 *
 * Exit codes:
 *   0 - No violations found
 *   1 - Violations found or script error
 */

import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, extname, join, resolve} from 'node:path';

const ATOMIC_SRC = new URL('../src', import.meta.url).pathname;

const STATIC_STYLES_PATTERN = /static\s+(?:(?:override\s+)?styles)\s*[=:]/;
const HOST_SELECTOR_PATTERN = /:host(?![a-z-])/;
const IMPORT_PATTERN = /import\s+(?:[\w{}\s,*]+\s+from\s+)?['"]([^'"]+)['"]/g;
const CSS_IMPORT_PATTERN =
  /import\s+\w+\s+from\s+['"]([^'"]+\.tw\.css(?:\.ts|\.js)?)['"]/g;
const NAMED_CSS_IMPORT_PATTERN =
  /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+\.tw\.css(?:\.ts|\.js)?)['"]/g;

function extractClassName(content) {
  const match =
    content.match(/class\s+(\w+)\s+extends\s+LightDomMixin/) ||
    content.match(/class\s+(\w+)\s+extends\s+ItemSectionMixin/);
  return match ? match[1] : 'Unknown';
}

function extractTagName(content) {
  const match = content.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  return match ? match[1] : null;
}

function stripCssComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Checks if content contains :host selector in CSS, excluding comments.
 * Handles both inline css`` literals and .tw.css.ts module files.
 */
function containsHostSelector(content) {
  const cssLiteralMatches = content.match(/css`[\s\S]*?`/g) || [];
  for (const cssLiteral of cssLiteralMatches) {
    const withoutComments = stripCssComments(cssLiteral);
    if (HOST_SELECTOR_PATTERN.test(withoutComments)) {
      return true;
    }
  }

  // For .tw.css.ts files, check the raw content (minus comments)
  const contentWithoutComments = stripCssComments(content);
  if (HOST_SELECTOR_PATTERN.test(contentWithoutComments)) {
    const lines = contentWithoutComments.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('//')) continue;
      if (HOST_SELECTOR_PATTERN.test(line)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Resolves an import path to an absolute file path.
 * Handles @/ aliases and relative imports. Returns null for external packages.
 */
function resolveImportPath(importPath, fromFile) {
  const fromDir = dirname(fromFile);

  if (importPath.startsWith('@/')) {
    const aliasPath = importPath.replace('@/', '');
    return resolve(ATOMIC_SRC, '..', aliasPath);
  }

  if (importPath.startsWith('.')) {
    const resolved = resolve(fromDir, importPath);
    const extensions = ['', '.ts', '.js', '.tw.css.ts', '.tw.css.js'];
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (existsSync(withExt)) {
        return withExt;
      }
    }
    return resolved;
  }

  return null;
}

/**
 * Recursively checks imported style files for :host selectors.
 * Returns {hasHost, chain} where chain is the import path that led to :host.
 */
function checkImportedStyles(filePath, visited = new Set()) {
  if (visited.has(filePath) || !existsSync(filePath)) {
    return {hasHost: false, chain: []};
  }

  visited.add(filePath);
  const content = readFileSync(filePath, 'utf-8');

  if (containsHostSelector(content)) {
    return {hasHost: true, chain: [filePath]};
  }

  // Check default CSS imports
  for (const [, importPath] of content.matchAll(CSS_IMPORT_PATTERN)) {
    const resolvedPath = resolveImportPath(importPath, filePath);
    if (resolvedPath) {
      const result = checkImportedStyles(resolvedPath, visited);
      if (result.hasHost) {
        return {hasHost: true, chain: [filePath, ...result.chain]};
      }
    }
  }

  // Check other imports that might be style re-exports
  for (const [, importPath] of content.matchAll(IMPORT_PATTERN)) {
    if (importPath.includes('.tw.css') || importPath.includes('.css')) {
      const resolvedPath = resolveImportPath(importPath, filePath);
      if (resolvedPath) {
        const result = checkImportedStyles(resolvedPath, visited);
        if (result.hasHost) {
          return {hasHost: true, chain: [filePath, ...result.chain]};
        }
      }
    }
  }

  return {hasHost: false, chain: []};
}

function analyzeComponent(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const violations = [];

  const isLightDomMixin = /extends\s+LightDomMixin\s*\(/.test(content);
  const isItemSectionMixin = /extends\s+ItemSectionMixin\s*\(/.test(content);

  if (!isLightDomMixin && !isItemSectionMixin) {
    return violations;
  }

  const className = extractClassName(content);
  const tagName = extractTagName(content);

  // ItemSectionMixin passes styles as second argument: ItemSectionMixin(LitElement, css`...`)
  if (isItemSectionMixin) {
    const itemSectionMatch = content.match(
      /ItemSectionMixin\s*\(\s*\w+\s*,\s*css`([\s\S]*?)`\s*\)/
    );
    if (itemSectionMatch) {
      const cssContent = stripCssComments(itemSectionMatch[1]);
      if (HOST_SELECTOR_PATTERN.test(cssContent)) {
        violations.push({
          file: filePath,
          className,
          tagName,
          type: 'inline',
          message: `Light DOM component (via ItemSectionMixin) has ":host" selector in styles argument`,
          suggestion: tagName
            ? `Replace ":host" with "${tagName}" selector`
            : `Replace ":host" with the component's tag name selector`,
        });
      }
    }
  }

  if (STATIC_STYLES_PATTERN.test(content) && containsHostSelector(content)) {
    violations.push({
      file: filePath,
      className,
      tagName,
      type: 'inline',
      message: `Light DOM component has inline ":host" selector in static styles`,
      suggestion: tagName
        ? `Replace ":host" with "${tagName}" selector`
        : `Replace ":host" with the component's tag name selector`,
    });
  }

  // Check default imported style files
  for (const [, importPath] of content.matchAll(CSS_IMPORT_PATTERN)) {
    const resolvedPath = resolveImportPath(importPath, filePath);
    if (resolvedPath) {
      const result = checkImportedStyles(resolvedPath, new Set());
      if (result.hasHost) {
        violations.push({
          file: filePath,
          className,
          tagName,
          type: 'imported',
          importChain: result.chain,
          message: `Light DOM component imports styles containing ":host" selector`,
          suggestion: `The imported style file (or its dependencies) contains ":host" which won't work in Light DOM. Either:\n    - Move these styles inline and use the component tag name selector\n    - Create a separate style file without ":host" for Light DOM components\n    - Import chain: ${result.chain.join(' → ')}`,
        });
      }
    }
  }

  // Check named imported style files
  for (const [, namedImports, importPath] of content.matchAll(
    NAMED_CSS_IMPORT_PATTERN
  )) {
    const resolvedPath = resolveImportPath(importPath, filePath);
    if (resolvedPath) {
      const result = checkImportedStyles(resolvedPath, new Set());
      if (result.hasHost) {
        violations.push({
          file: filePath,
          className,
          tagName,
          type: 'imported',
          importChain: result.chain,
          message: `Light DOM component imports styles (named: ${namedImports.trim()}) containing ":host" selector`,
          suggestion: `The imported style file contains ":host" which won't work in Light DOM.\n    - Import chain: ${result.chain.join(' → ')}`,
        });
      }
    }
  }

  return violations;
}

const EXCLUDED_FILES = [
  '.spec.ts',
  '.stories.ts',
  '.e2e.ts',
  '.tw.css.ts',
  '.d.ts',
];
const EXCLUDED_EXACT = ['fixture.ts', 'page-object.ts'];

function findTsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (stat.isFile() && extname(entry) === '.ts') {
      const shouldSkip =
        EXCLUDED_FILES.some((suffix) => entry.endsWith(suffix)) ||
        EXCLUDED_EXACT.includes(entry);
      if (!shouldSkip) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function main() {
  console.log('🔍 Checking for :host selectors in Light DOM components...\n');

  const componentsDir = join(ATOMIC_SRC, 'components');
  const files = findTsFiles(componentsDir);
  const allViolations = [];

  for (const file of files) {
    allViolations.push(...analyzeComponent(file));
  }

  if (allViolations.length === 0) {
    console.log(
      '✅ No :host selector violations found in Light DOM components.\n'
    );
    process.exit(0);
  }

  console.log(`❌ Found ${allViolations.length} violation(s):\n`);

  for (const violation of allViolations) {
    console.log(`📁 ${violation.file}`);
    console.log(
      `   Component: ${violation.className} (${violation.tagName || 'no tag name'})`
    );
    console.log(
      `   Type: ${violation.type === 'inline' ? 'Inline styles' : 'Imported styles'}`
    );
    console.log(`   Issue: ${violation.message}`);
    console.log(`   Fix: ${violation.suggestion}`);
    console.log('');
  }

  console.log('\n💡 Why this matters:');
  console.log(
    "   Light DOM components (using LightDomMixin) don't have a shadow boundary."
  );
  console.log(
    "   The :host selector targets the shadow host, which doesn't exist in Light DOM."
  );
  console.log(
    '   This can cause styles to leak or not apply correctly, leading to visual bugs.\n'
  );

  process.exit(1);
}

main().catch((error) => {
  console.error('Script error:', error);
  process.exit(1);
});
