import {afterEach, describe, expect, it, vi} from 'vitest';
import {resolveTarballUrl} from './registry.js';

function okManifest(manifest: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    body: {},
    json: async () => manifest,
  } as unknown as Response);
}

function notFound() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
    statusText: 'Not Found',
  } as unknown as Response);
}

describe('resolveTarballUrl', () => {
  const original = process.env.npm_config_registry;
  afterEach(() => {
    if (original === undefined) {
      delete process.env.npm_config_registry;
    } else {
      process.env.npm_config_registry = original;
    }
  });

  it("returns the dist.tarball of the package's latest release", async () => {
    delete process.env.npm_config_registry;
    const fetchImpl = okManifest({dist: {tarball: 'https://reg/x.tgz'}});
    expect(
      await resolveTarballUrl('@coveo/sample-headless-search-react', {
        fetchImpl,
      })
    ).toBe('https://reg/x.tgz');
  });

  it('queries <registry>/<pkg>/latest on the public registry by default', async () => {
    delete process.env.npm_config_registry;
    const fetchImpl = okManifest({dist: {tarball: 'x'}});
    await resolveTarballUrl('@coveo/sample-x', {fetchImpl});
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://registry.npmjs.org/@coveo/sample-x/latest',
      expect.anything()
    );
  });

  it('honours npm_config_registry, trimming a trailing slash', async () => {
    process.env.npm_config_registry = 'https://npm.mycorp.com/';
    const fetchImpl = okManifest({dist: {tarball: 'x'}});
    await resolveTarballUrl('@coveo/sample-x', {fetchImpl});
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://npm.mycorp.com/@coveo/sample-x/latest',
      expect.anything()
    );
  });

  it('throws an actionable error when the package is not found (404)', async () => {
    delete process.env.npm_config_registry;
    const fetchImpl = notFound();
    await expect(
      resolveTarballUrl('@coveo/sample-x', {fetchImpl})
    ).rejects.toThrow(/Could not find .* on npm/);
  });

  it('throws when the registry returns no tarball URL', async () => {
    delete process.env.npm_config_registry;
    const fetchImpl = okManifest({dist: {}});
    await expect(
      resolveTarballUrl('@coveo/sample-x', {fetchImpl})
    ).rejects.toThrow(/no download URL/);
  });
});
