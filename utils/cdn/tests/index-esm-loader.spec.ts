import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {serveCdnAsIs, stopServingCdnAsIs} from './serve-cdn-as-is.js';
import {startupFiles} from './startup-files.js';

const staticHeadlessImport = /\b(?:from|import)\s*["'][^"']*\/headless\//;

const gzippedSize = async (code: string) => {
  const gzipped = new Blob([code]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(gzipped).arrayBuffer()).byteLength;
};

describe('CDN index.esm.js', () => {
  it('should export the loader of index.js itself', async () => {
    const index = await import('../dist/proda/StaticCDN/atomic/v3/index.js');
    const indexEsm = await import('../dist/proda/StaticCDN/atomic/v3/index.esm.js');

    expect(indexEsm.defineCustomElements).toBe(index.defineCustomElements);
  });

  describe('at startup', () => {
    beforeEach(async () => {
      await serveCdnAsIs();
    });

    afterEach(async () => {
      await stopServingCdnAsIs();
    });

    it('should load index.js and its own two chunks', async () => {
      const files = await startupFiles('index.esm.js');

      expect([...files.keys()]).toContain('index.js');
      expect(files.size).toBe(4);
    });

    it('should not load the shared chunk', async () => {
      const files = await startupFiles('index.esm.js');

      expect([...files.keys()].filter((file) => file.startsWith('atomic-shared'))).toEqual([]);
    });

    it('should not wait for Headless', async () => {
      const files = await startupFiles('index.esm.js');

      const filesThatImportHeadless = [...files]
        .filter(([, code]) => staticHeadlessImport.test(code))
        .map(([file]) => file);
      expect(filesThatImportHeadless).toEqual([]);
    });

    it('should load at most 16 kB gzipped', async () => {
      const files = await startupFiles('index.esm.js');
      const sizes = await Promise.all([...files.values()].map(gzippedSize));

      expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(16_000);
    });
  });
});
