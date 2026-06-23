import {describe, expect, it, vi} from 'vitest';
import {resolveLatestReleaseTarballUrl} from './tarball.js';

function mockLatestReleaseFetch(release: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    body: {},
    json: async () => release,
  } as unknown as Response);
}

describe('resolveLatestReleaseTarballUrl', () => {
  it('returns the tarball_url of the latest release', async () => {
    const fetchImpl = mockLatestReleaseFetch({
      tag_name: '@coveo/shopify@1.9.35',
      tarball_url: 'latest-tarball-url',
    });
    expect(await resolveLatestReleaseTarballUrl({fetchImpl})).toBe(
      'latest-tarball-url'
    );
  });

  it('queries the documented "latest release" endpoint', async () => {
    const fetchImpl = mockLatestReleaseFetch({tarball_url: 'x'});
    await resolveLatestReleaseTarballUrl({fetchImpl});
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.github.com/repos/coveo/ui-kit/releases/latest',
      expect.anything()
    );
  });

  it('throws an actionable error when no tarball URL is returned', async () => {
    const fetchImpl = mockLatestReleaseFetch({});
    await expect(resolveLatestReleaseTarballUrl({fetchImpl})).rejects.toThrow(
      /Could not determine the latest release/
    );
  });
});
