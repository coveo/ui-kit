import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('package boundary', () => {
  it('package.json exports map does not expose schema/, scripts/, or src/generated/', () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const exportPaths = JSON.stringify(pkg.exports);
    expect(exportPaths).not.toContain('schema/');
    expect(exportPaths).not.toContain('scripts/');
    expect(exportPaths).not.toContain('src/generated/');
    expect(exportPaths).not.toContain('src/');
  });

  it('files field includes only dist', () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    expect(pkg.files).toEqual(['dist']);
  });

  it('exports resolve to dist/ paths only', () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const rootExport = pkg.exports['.'];
    expect(rootExport.import).toMatch(/^\.\/dist\//);
    expect(rootExport.types).toMatch(/^\.\/dist\//);
  });
});
