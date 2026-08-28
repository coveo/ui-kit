import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedPath = path.join(packageRoot, 'src', 'generated', 'schemas.ts');

describe('projection determinism', () => {
  it('re-running generation produces byte-identical output (--check passes)', () => {
    expect(() => {
      execFileSync(
        'node',
        [
          '--experimental-strip-types',
          path.join(packageRoot, 'scripts/generate-zod.ts'),
          '--check',
        ],
        {
          cwd: packageRoot,
          stdio: 'pipe',
        }
      );
    }).not.toThrow();
  });

  it('canonical $id values appear as string literals in generated Zod schemas', async () => {
    const content = await readFile(generatedPath, 'utf8');
    expect(content).toContain(
      'https://schema.thermidor.coveo.com/controllers/product-list.schema.json'
    );
    expect(content).toContain('https://schema.thermidor.coveo.com/controllers/cart.schema.json');
  });
});
