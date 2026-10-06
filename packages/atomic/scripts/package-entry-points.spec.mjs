import {readFileSync} from 'node:fs';
import {matchesGlob} from 'node:path';
import {describe, expect, it} from 'vitest';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const isSideEffectful = (file) => manifest.sideEffects.some((glob) => matchesGlob(file, glob));

describe('package entry points', () => {
  it('should map each per-component entry point to its generated re-export', () => {
    expect(manifest.exports['./components/*']).toEqual({
      types: './dist/types/entry-points/*.d.ts',
      import: './dist/esm/entry-points/*.js',
    });
  });

  it('should not declare the per-component entry points as side-effectful', () => {
    expect(isSideEffectful('./dist/esm/entry-points/atomic-facet.js')).toBe(false);
  });

  it('should keep the component modules side-effectful', () => {
    expect(isSideEffectful('./dist/esm/components/search/atomic-facet/atomic-facet.js')).toBe(true);
  });
});
