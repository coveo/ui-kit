import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {DefaultAuthAdapter} from './default-auth.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockTokenEndpoint(token: string, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({token}), {
          status,
          headers: {'Content-Type': 'application/json'},
        })
    )
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DefaultAuthAdapter', () => {
  let adapter: DefaultAuthAdapter;

  beforeEach(() => {
    adapter = new DefaultAuthAdapter({tokenEndpoint: '/token'});
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // -------------------------------------------------------------------------
  // getToken()
  // -------------------------------------------------------------------------

  describe('getToken()', () => {
    it('fetches and returns the token on first call', async () => {
      mockTokenEndpoint('abc-123');

      const token = await adapter.getToken();

      expect(token).toBe('abc-123');
    });

    it('returns the cached token on subsequent calls within TTL', async () => {
      const fetchMock = vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify({token: 'cached'}), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
      );
      vi.stubGlobal('fetch', fetchMock);

      await adapter.getToken();
      await adapter.getToken();
      await adapter.getToken();

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('fetches a fresh token after the TTL expires', async () => {
      const shortTtlAdapter = new DefaultAuthAdapter({
        tokenEndpoint: '/token',
        ttlMs: 1,
      });

      const fetchMock = vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify({token: 'fresh'}), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
      );
      vi.stubGlobal('fetch', fetchMock);

      await shortTtlAdapter.getToken();

      // Wait for TTL to elapse
      await new Promise((resolve) => setTimeout(resolve, 5));

      await shortTtlAdapter.getToken();

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('coalesces concurrent calls into a single fetch', async () => {
      const fetchMock = vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify({token: 'coalesced'}), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
      );
      vi.stubGlobal('fetch', fetchMock);

      const [t1, t2, t3] = await Promise.all([
        adapter.getToken(),
        adapter.getToken(),
        adapter.getToken(),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(t1).toBe('coalesced');
      expect(t2).toBe('coalesced');
      expect(t3).toBe('coalesced');
    });

    it('throws when the endpoint returns a non-ok status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('', {status: 401}))
      );

      await expect(adapter.getToken()).rejects.toThrow(
        'token endpoint responded with 401'
      );
    });

    it('throws when the response has no "token" field', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({access_token: 'wrong'}), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
        )
      );

      await expect(adapter.getToken()).rejects.toThrow(
        'did not return a "token" string'
      );
    });

    it('forwards fetchHeaders in the request', async () => {
      const headerAdapter = new DefaultAuthAdapter({
        tokenEndpoint: '/token',
        fetchHeaders: {Cookie: 'session=abc'},
      });

      const fetchMock = vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify({token: 'tok'}), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
      );
      vi.stubGlobal('fetch', fetchMock);

      await headerAdapter.getToken();

      expect(fetchMock).toHaveBeenCalledWith(
        '/token',
        expect.objectContaining({
          headers: expect.objectContaining({Cookie: 'session=abc'}),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // refreshToken()
  // -------------------------------------------------------------------------

  describe('refreshToken()', () => {
    it('bypasses the cache and fetches a fresh token', async () => {
      const fetchMock = vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify({token: 'fresh'}), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
      );
      vi.stubGlobal('fetch', fetchMock);

      await adapter.getToken(); // warm cache
      const refreshed = await adapter.refreshToken();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(refreshed).toBe('fresh');
    });
  });

  // -------------------------------------------------------------------------
  // getTokenMetadata()
  // -------------------------------------------------------------------------

  describe('getTokenMetadata()', () => {
    it('returns empty object before any token is fetched', () => {
      expect(adapter.getTokenMetadata()).toEqual({});
    });

    it('returns expiresAt after a token is cached', async () => {
      const before = Date.now();
      mockTokenEndpoint('tok');

      await adapter.getToken();

      const metadata = adapter.getTokenMetadata();
      expect(metadata.expiresAt).toBeGreaterThanOrEqual(before + 300_000 - 50);
    });
  });
});
