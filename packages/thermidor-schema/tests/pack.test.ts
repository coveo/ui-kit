import {execSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('package validation', () => {
  it('dist/ contains expected output files', () => {
    expect(existsSync(path.join(packageRoot, 'dist', 'index.js'))).toBe(true);
    expect(existsSync(path.join(packageRoot, 'dist', 'index.d.ts'))).toBe(true);
    expect(existsSync(path.join(packageRoot, 'dist', 'generated', 'schemas.js'))).toBe(true);
    expect(existsSync(path.join(packageRoot, 'dist', 'generated', 'schemas.d.ts'))).toBe(true);
  });

  it('package.json exports resolve to dist/ paths', () => {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    expect(pkg.exports['.'].import).toBe('./dist/index.js');
    expect(pkg.exports['.'].types).toBe('./dist/index.d.ts');
  });

  it('dist/ does not contain source schemas, scripts, or generated source', () => {
    const distContent = execSync('find dist -type f', {cwd: packageRoot, encoding: 'utf8'});
    expect(distContent).not.toContain('schema/');
    expect(distContent).not.toContain('scripts/');
    expect(distContent).not.toContain('src/');
  });

  it('npm pack produces a tarball with dist/ but not internals', () => {
    const packOutput = execSync('npm pack --dry-run --json 2>/dev/null || npm pack --dry-run', {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    expect(packOutput).toContain('dist/');
    expect(packOutput).not.toMatch(/schema\//);
    expect(packOutput).not.toMatch(/scripts\//);
    expect(packOutput).not.toMatch(/src\//);
  }, 60_000);

  it('all expected exports are present in the built index.d.ts', () => {
    const dts = readFileSync(path.join(packageRoot, 'dist', 'index.d.ts'), 'utf8');
    const expectedExports = [
      'CartItemSchema',
      'CartControllerContractSchema',
      'CartStateSchema',
      'ControllerContractsSchema',
      'ProductListControllerContractSchema',
      'ProductListStateSchema',
      'ProductSchema',
      'SetItemsPayloadSchema',
      'UpdateItemQuantityPayloadSchema',
    ];
    for (const name of expectedExports) {
      expect(dts).toContain(name);
    }
  });
});
