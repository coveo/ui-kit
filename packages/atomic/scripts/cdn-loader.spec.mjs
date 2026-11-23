import {beforeAll, describe, expect, it, vi} from 'vitest';

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

  it('should not log a deprecation warning when loader.js is imported', () => {
    expect(loaderWarnings).toEqual([]);
  });

  it('should export from index.js the same functions and values as loader.js', () => {
    expect({...index}).toEqual({...loader});
  });

  it('should log one deprecation warning that names loader.js when index.js is imported, however often', () => {
    expect(indexWarnings).toEqual([expect.stringContaining('Use `loader.js` instead')]);
  });
});
