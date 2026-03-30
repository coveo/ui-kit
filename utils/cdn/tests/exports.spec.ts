import {describe, expect, it} from 'vitest';

describe('CDN exports checks', () => {
  it.each([
    'index',
    'index.esm',
    'atomic.esm',
  ])('did %s exports changed?', async (file) => {
    console.log(file);
    const module = await import(`../dist/proda/StaticCDN/atomic/v3/${file}.js`);
    expect(module).toMatchSnapshot();
  });
});
