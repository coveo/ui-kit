import {describe, it, expect} from 'vitest';
import {readFileSync, existsSync, readdirSync, statSync} from 'node:fs';
import {resolve, relative, join} from 'node:path';
import {execSync} from 'node:child_process';

/**
 * .d.ts Validation Gate
 *
 * Ensures that generated TypeScript declaration files exposed to consumers
 * do not contain import statements or type references to @reduxjs/toolkit or immer.
 * This enforces the anti-corruption boundary at the type level — consumers of this
 * package should never need RTK or Immer as peer dependencies.
 */

const PACKAGE_ROOT = resolve(import.meta.dirname, '../..');
const DIST_DIR = resolve(PACKAGE_ROOT, 'dist');
const FORBIDDEN_PATTERNS = [
  /from\s+['"]@reduxjs\/toolkit['"]/,
  /from\s+['"]@reduxjs\/toolkit\/[^'"]*['"]/,
  /from\s+['"]immer['"]/,
  /import\s*\(?\s*['"]@reduxjs\/toolkit['"]\s*\)?/,
  /import\s*\(?\s*['"]immer['"]\s*\)?/,
  /\/\/\/\s*<reference\s+types=["']@reduxjs\/toolkit["']/,
  /\/\/\/\s*<reference\s+types=["']immer["']/,
];

function findDtsFiles(dir: string, ignore?: string[]): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    for (const entry of readdirSync(currentDir)) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const relativePath = relative(dir, fullPath);
        if (ignore?.some((pattern) => relativePath.startsWith(pattern))) {
          continue;
        }
        walk(fullPath);
      } else if (entry.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function ensureBuildExists() {
  if (!existsSync(DIST_DIR)) {
    execSync('pnpm run build', {cwd: PACKAGE_ROOT, stdio: 'pipe'});
  }
}

function cleanAndBuild() {
  execSync('pnpm run clean', {cwd: PACKAGE_ROOT, stdio: 'pipe'});
  execSync('pnpm run build', {cwd: PACKAGE_ROOT, stdio: 'pipe'});
}

function scanFileForViolations(
  filePath: string
): {line: number; content: string; match: string}[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: {line: number; content: string; match: string}[] = [];

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      const match = lines[i].match(pattern);
      if (match) {
        violations.push({
          line: i + 1,
          content: lines[i].trim(),
          match: match[0],
        });
        break;
      }
    }
  }

  return violations;
}

function formatViolationReport(
  allViolations: {
    file: string;
    violations: {line: number; content: string; match: string}[];
  }[]
): string {
  return allViolations
    .map(({file, violations}) => {
      const details = violations
        .map((v) => `    Line ${v.line}: ${v.content}`)
        .join('\n');
      return `  ${file}:\n${details}`;
    })
    .join('\n\n');
}

describe('.d.ts Validation Gate', () => {
  it('should not contain @reduxjs/toolkit or immer references in public-facing declarations', () => {
    ensureBuildExists();

    const publicDtsFiles = [
      ...findDtsFiles(resolve(DIST_DIR, 'public')),
      resolve(DIST_DIR, 'index.d.ts'),
    ].filter((f) => existsSync(f));

    expect(publicDtsFiles.length).toBeGreaterThan(0);

    const allViolations: {
      file: string;
      violations: {line: number; content: string; match: string}[];
    }[] = [];

    for (const file of publicDtsFiles) {
      const violations = scanFileForViolations(file);
      if (violations.length > 0) {
        allViolations.push({
          file: relative(DIST_DIR, file),
          violations,
        });
      }
    }

    if (allViolations.length > 0) {
      const report = formatViolationReport(allViolations);
      expect.fail(
        `Declaration files contain references to @reduxjs/toolkit or immer.\n` +
          `These implementation dependencies must not leak into consumer-facing type declarations.\n\n` +
          `Offending files:\n${report}`
      );
    }
  });

  it('should not contain @reduxjs/toolkit or immer references in any non-internal .d.ts files after clean build', () => {
    cleanAndBuild();

    const allDtsFiles = findDtsFiles(DIST_DIR, ['internal']);

    expect(allDtsFiles.length).toBeGreaterThan(0);

    const allViolations: {
      file: string;
      violations: {line: number; content: string; match: string}[];
    }[] = [];

    for (const file of allDtsFiles) {
      const violations = scanFileForViolations(file);
      if (violations.length > 0) {
        allViolations.push({
          file: relative(DIST_DIR, file),
          violations,
        });
      }
    }

    if (allViolations.length > 0) {
      const report = formatViolationReport(allViolations);
      expect.fail(
        `Declaration files outside internal/ contain references to @reduxjs/toolkit or immer.\n` +
          `These implementation dependencies must not leak into non-internal type declarations.\n\n` +
          `Offending files:\n${report}`
      );
    }
  });
});
