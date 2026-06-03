import {describe, expect, it} from 'vitest';

const SEMVER_REGEX = /^\d+\.\d+\.\d+/;

function replaceVersions(mod: Record<string, unknown>) {
  const snapshot = {...mod};
  for (const key of Object.keys(snapshot)) {
    if (
      key.toLowerCase().includes('version') &&
      typeof snapshot[key] === 'string'
    ) {
      expect(snapshot[key]).toMatch(SEMVER_REGEX);
      snapshot[key] = '<version>';
    }
  }
  return snapshot;
}

describe('CDN exports checks', () => {
  it.each(['index', 'index.esm', 'atomic.esm'])(
    'did %s exports changed?',
    async (file) => {
      const module = await import(
        `../dist/proda/StaticCDN/atomic/v3/${file}.js`
      );
      expect(replaceVersions(module)).toMatchSnapshot();
    }
  );
});
