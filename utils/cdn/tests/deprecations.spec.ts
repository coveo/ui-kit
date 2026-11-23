import {afterEach, describe, expect, it, vi} from 'vitest';

describe('CDN deprecation warnings', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does index warn once, naming index.esm?', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await import('../dist/proda/StaticCDN/atomic/v3/index.js');
    await import('../dist/proda/StaticCDN/atomic/v3/index.js');

    expect(warn.mock.calls).toEqual([
      [expect.stringContaining('Import from `index.esm.js` instead')],
    ]);
  });

  it.each(['index.esm', 'atomic.esm'])('does %s load without a warning?', async (file) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await import(`../dist/proda/StaticCDN/atomic/v3/${file}.js`);

    expect(warn).not.toHaveBeenCalled();
  });
});
