import {describe, expect, it, vi} from 'vitest';
import {
  DEFAULT_REF,
  getTarballUrl,
  resolveLatestReleaseTarballUrl,
} from './tarball.js';

describe('getTarballUrl', () => {
  it('builds the documented REST API tarball URL for a given ref', () => {
    expect(getTarballUrl('main')).toBe(
      'https://api.github.com/repos/coveo/ui-kit/tarball/main'
    );
  });

  it('falls back to the default ref when none is provided', () => {
    expect(getTarballUrl()).toBe(
      `https://api.github.com/repos/coveo/ui-kit/tarball/${DEFAULT_REF}`
    );
  });

  it('targets the public api.github.com host rather than codeload', () => {
    const url = getTarballUrl('v3.0.0');
    expect(url).toContain('api.github.com');
    expect(url).not.toContain('codeload');
  });
});

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
