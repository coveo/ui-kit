import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {BrowserTransportAdapter} from './browser-transport.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}

function makeTextResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {'Content-Type': 'text/plain'},
  });
}

function makeStreamResponse(chunks: Uint8Array[]): Response {
  let index = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index++]);
      } else {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {'Content-Type': 'text/event-stream'},
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BrowserTransportAdapter', () => {
  let adapter: BrowserTransportAdapter;

  beforeEach(() => {
    adapter = new BrowserTransportAdapter({
      baseUrl: 'https://platform.cloud.coveo.com',
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // -------------------------------------------------------------------------
  // send()
  // -------------------------------------------------------------------------

  describe('send()', () => {
    it('makes a GET request with the correct URL', async () => {
      const mockedFetch = vi
        .fn()
        .mockResolvedValue(makeJsonResponse({ok: true}));
      vi.stubGlobal('fetch', mockedFetch);

      await adapter.send({method: 'GET', path: '/rest/search/v2'});

      expect(mockedFetch).toHaveBeenCalledWith(
        'https://platform.cloud.coveo.com/rest/search/v2',
        expect.objectContaining({method: 'GET'})
      );
    });

    it('serializes body as JSON for POST requests', async () => {
      const mockedFetch = vi
        .fn()
        .mockResolvedValue(makeJsonResponse({results: []}));
      vi.stubGlobal('fetch', mockedFetch);

      await adapter.send({method: 'POST', path: '/api', body: {q: 'test'}});

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({body: JSON.stringify({q: 'test'})})
      );
    });

    it('parses JSON response body', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(makeJsonResponse({count: 42}))
      );

      const result = await adapter.send({method: 'GET', path: '/api'});

      expect(result).toEqual({status: 200, data: {count: 42}});
    });

    it('returns text body when content-type is not JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(makeTextResponse('hello'))
      );

      const result = await adapter.send({method: 'GET', path: '/api'});

      expect(result).toEqual({status: 200, data: 'hello'});
    });

    it('attaches Authorization header when getAuthToken is provided', async () => {
      const authAdapter = new BrowserTransportAdapter({
        baseUrl: 'https://example.com',
        getAuthToken: async () => 'my-token',
      });
      const mockedFetch = vi.fn().mockResolvedValue(makeJsonResponse({}));
      vi.stubGlobal('fetch', mockedFetch);

      await authAdapter.send({method: 'GET', path: '/protected'});

      const [, init] = mockedFetch.mock.calls[0] as [string, RequestInit];
      expect((init.headers as Record<string, string>)['Authorization']).toBe(
        'Bearer my-token'
      );
    });

    it('merges defaultHeaders into every request', async () => {
      const headerAdapter = new BrowserTransportAdapter({
        baseUrl: 'https://example.com',
        defaultHeaders: {'X-Custom': 'value'},
      });
      const mockedFetch = vi.fn().mockResolvedValue(makeJsonResponse({}));
      vi.stubGlobal('fetch', mockedFetch);

      await headerAdapter.send({method: 'GET', path: '/'});

      const [, init] = mockedFetch.mock.calls[0] as [string, RequestInit];
      expect((init.headers as Record<string, string>)['X-Custom']).toBe(
        'value'
      );
    });

    it('normalizes base URL trailing slash and path leading slash', async () => {
      const slashyAdapter = new BrowserTransportAdapter({
        baseUrl: 'https://example.com/',
      });
      const mockedFetch = vi.fn().mockResolvedValue(makeJsonResponse({}));
      vi.stubGlobal('fetch', mockedFetch);

      await slashyAdapter.send({method: 'GET', path: 'search'});

      expect(mockedFetch.mock.calls[0][0]).toBe('https://example.com/search');
    });
  });

  // -------------------------------------------------------------------------
  // openStream()
  // -------------------------------------------------------------------------

  describe('openStream()', () => {
    it('calls onChunk for each chunk and onClose when done', async () => {
      const encoder = new TextEncoder();
      const chunks = [
        encoder.encode('data: {"type":"TEXT_MESSAGE_CONTENT"}\n\n'),
        encoder.encode('data: {"type":"RUN_FINISHED"}\n\n'),
      ];

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(makeStreamResponse(chunks))
      );

      const onChunk = vi.fn();
      const onClose = vi.fn();
      const onError = vi.fn();

      await adapter.openStream({
        path: '/converse',
        onChunk,
        onClose,
        onError,
      });

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, chunks[0]);
      expect(onChunk).toHaveBeenNthCalledWith(2, chunks[1]);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('sets Accept and Content-Type headers for streaming requests', async () => {
      const mockedFetch = vi.fn().mockResolvedValue(makeStreamResponse([]));
      vi.stubGlobal('fetch', mockedFetch);

      await adapter.openStream({
        path: '/converse',
        onChunk: vi.fn(),
        onClose: vi.fn(),
        onError: vi.fn(),
      });

      const [, init] = mockedFetch.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers['Accept']).toBe('text/event-stream;charset=UTF-8');
      expect(headers['Content-Type']).toBe('application/json; charset=UTF-8');
    });

    it('calls onError with HTTP error code when response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(new Response('Unauthorized', {status: 401}))
      );

      const onError = vi.fn();
      await adapter.openStream({
        path: '/converse',
        onChunk: vi.fn(),
        onClose: vi.fn(),
        onError,
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({code: 'HTTP_401'})
      );
    });

    it('calls onError with NETWORK_ERROR on fetch failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Failed to fetch'))
      );

      const onError = vi.fn();
      await adapter.openStream({
        path: '/converse',
        onChunk: vi.fn(),
        onClose: vi.fn(),
        onError,
      });

      expect(onError).toHaveBeenCalledWith({
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch',
      });
    });

    it('returns without calling onError when external signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      const mockedFetch = vi.fn();
      vi.stubGlobal('fetch', mockedFetch);

      const onError = vi.fn();
      await adapter.openStream({
        path: '/converse',
        signal: controller.signal,
        onChunk: vi.fn(),
        onClose: vi.fn(),
        onError,
      });

      expect(mockedFetch).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // abort()
  // -------------------------------------------------------------------------

  describe('abort()', () => {
    it('does not throw when called with no active stream', () => {
      expect(() => adapter.abort()).not.toThrow();
    });
  });
});
