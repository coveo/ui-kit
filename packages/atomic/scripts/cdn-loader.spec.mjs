import {beforeAll, describe, expect, it, vi} from 'vitest';

/** @param {Record<string, unknown>} module */
const publicExports = (module) =>
  Object.fromEntries(Object.entries(module).filter(([name]) => !name.startsWith('__')));

describe('CDN loader files', () => {
  let loader;
  let index;
  let loaderWarnings;
  let indexWarnings;

  beforeAll(async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    loader = await import('../cdn/loader.js');
    loaderWarnings = warn.mock.calls.map(([message]) => message);

    index = await import('../cdn/index.js');
    await import('../cdn/index.js');
    indexWarnings = warn.mock.calls.slice(loaderWarnings.length).map(([message]) => message);

    warn.mockRestore();
  });

  describe('loader.js', () => {
    it('should export the loader API', () => {
      expect(Object.keys(publicExports(loader)).sort()).toEqual([
        'applyPolyfills',
        'atomicVersion',
        'defineCustomElements',
        'headlessVersion',
        'setNonce',
      ]);
    });

    it('should not log a deprecation warning', () => {
      expect(loaderWarnings).toEqual([]);
    });
  });

  describe('index.js', () => {
    it('should export what loader.js exports', () => {
      expect(publicExports(index)).toEqual(publicExports(loader));
    });

    it('should log one deprecation warning that names loader.js, however often it is imported', () => {
      expect(indexWarnings).toEqual([expect.stringContaining('Use `loader.js` instead')]);
    });
  });
});
