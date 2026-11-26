import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {serveCdnAsIs, stopServingCdnAsIs} from './serve-cdn-as-is.js';
import {startupFiles} from './startup-files.js';

describe('CDN loader entries', () => {
  beforeEach(async () => {
    await serveCdnAsIs();
  });

  afterEach(async () => {
    await stopServingCdnAsIs();
  });

  it.each(['atomic.esm.js', 'index.js'])(
    '%s should start the loader without downloading another Atomic file',
    async (entry) => {
      const files = await startupFiles(entry);

      expect([...files.keys()]).toEqual([entry]);
    }
  );
});
