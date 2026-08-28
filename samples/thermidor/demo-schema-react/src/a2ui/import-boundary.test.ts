import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const srcRoot = resolve(process.cwd(), 'src');

function getAllSourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const entryPath = join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      if (entry === 'node_modules' || entry === '__test-shims__') continue;
      files.push(...getAllSourceFiles(entryPath));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry)) {
      files.push(entryPath);
    }
  }
  return files;
}

const sourceFiles = getAllSourceFiles(srcRoot);

describe('import boundary', () => {
  it('does not import from @coveo/thermidor-contracts', () => {
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      expect(content, `Forbidden import in ${file}`).not.toMatch(/@coveo\/thermidor-contracts/);
    }
  });

  it('does not import from internal thermidor-schema paths', () => {
    const forbidden = [
      /packages\/thermidor-schema\/src/,
      /packages\/thermidor-schema\/schema/,
      /packages\/thermidor-schema\/scripts/,
      /packages\/thermidor-schema\/generated/,
    ];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of forbidden) {
        expect(content, `Forbidden internal import in ${file}`).not.toMatch(pattern);
      }
    }
  });

  it('does not import non-existent props schemas from @coveo/thermidor-schema', () => {
    const nonExistentImports = [
      /productCarouselPropsSchema.*from\s+['"]@coveo\/thermidor-schema['"]/,
      /cartPropsSchema.*from\s+['"]@coveo\/thermidor-schema['"]/,
    ];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf-8');
      for (const pattern of nonExistentImports) {
        expect(content, `Import of non-existent export in ${file}`).not.toMatch(pattern);
      }
    }
  });
});
