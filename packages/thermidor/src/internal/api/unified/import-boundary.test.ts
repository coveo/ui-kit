import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const unifiedRuntimePath = resolve(__dirname, 'unified-runtime.ts');

describe('import boundary: unified-runtime module isolation', () => {
  it('does not import from unified-surface-hydration', () => {
    const content = readFileSync(unifiedRuntimePath, 'utf-8');
    expect(
      content,
      'unified-runtime.ts must not import from unified-surface-hydration'
    ).not.toMatch(/unified-surface-hydration/);
  });
});
