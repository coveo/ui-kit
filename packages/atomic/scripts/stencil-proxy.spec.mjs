import {expect, test} from 'vitest';

test('a dynamic import of atomic.esm.js should exposes the correct version exports', async () => {
  const {headlessVersion, atomicVersion} = await import('../cdn/atomic.esm.js');

  expect(headlessVersion).toBe(__HEADLESS_VERSION__);
  expect(atomicVersion).toBe(__ATOMIC_VERSION__);
});
