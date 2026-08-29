import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('artifact freshness', () => {
  it('src/generated/ is fresh (matches what generate would produce)', () => {
    expect(() => {
      execFileSync(
        'node',
        ['--experimental-strip-types', path.join(packageRoot, 'scripts/check-freshness.ts'), 'src'],
        {
          cwd: packageRoot,
          stdio: 'pipe',
        }
      );
    }).not.toThrow();
  });
});
