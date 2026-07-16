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

  it('loads Relay and resolves its source map', async () => {
    const relayModule =
      await import('../dist/proda/StaticCDN/relay/v2/relay.min.js');
    const {default: relayBundle} =
      await import('../dist/proda/StaticCDN/relay/v2/relay.min.js?raw');

    expect(relayModule.createRelay).toBeTypeOf('function');

    const sourceMapPath = relayBundle.match(/sourceMappingURL=(.+)$/m)?.[1];
    expect(sourceMapPath).toBe('relay.min.js.map');

    const relayBundleUrl = new URL(
      '/relay/v2/relay.min.js',
      window.location.origin
    );
    const sourceMapResponse = await fetch(
      new URL(sourceMapPath!, relayBundleUrl)
    );
    expect(sourceMapResponse.ok).toBe(true);
    const sourceMap = await sourceMapResponse.json();
    expect(sourceMap.file).toBe('relay.min.js');
    expect(sourceMap.sources).toContain('../../../src/relay.ts');
    expect(sourceMap.sourcesContent).toBeInstanceOf(Array);
  });
});
