import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('artifact freshness', () => {
  // Spawns a TS-stripping node process that regenerates every artifact, which
  // routinely runs past vitest's 5s default on CI runners.
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
  }, 60_000);
});
