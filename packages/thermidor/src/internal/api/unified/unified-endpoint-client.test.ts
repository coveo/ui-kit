import {beforeEach, describe, expect, it, vi, type MockedFunction} from 'vitest';
import {createUnifiedEndpointClient} from './unified-endpoint-client.js';
import type {CommerceRequestModel} from './unified-endpoint-types.js';

describe('UnifiedEndpointClient', () => {
  let client: ReturnType<typeof createUnifiedEndpointClient>;
  let mockedFetch: MockedFunction<typeof fetch>;

  const request: CommerceRequestModel = {
    trackingId: 'tracking-id',
    language: 'en',
    country: 'US',
    currency: 'USD',
    clientId: 'client-id',
    message: 'Hello',
    action: null,
    conversationSessionId: 'session-1',
    conversationToken: 'token-1',
    context: {
      view: {url: 'https://example.com/products', referrer: 'https://example.com'},
      user: {userAgent: 'Mozilla/5.0'},
      cart: [],
      source: [],
      custom: {},
    },
    pinnedProducts: [],
  };

  beforeEach(() => {
    client = createUnifiedEndpointClient();
    mockedFetch = vi.fn();
    vi.stubGlobal('fetch', mockedFetch);
  });

  it('returns configuration error when accessToken is missing', async () => {
    const response = await client.call(request, {organizationId: 'test-org'});

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected unified endpoint call to fail');
    }
    expect(response.error).toContain('Access token is not set');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('sends POST with correct URL, headers, and body', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response.success).toBe(true);
    if (!response.success) {
      throw new Error('Expected success response');
    }

    expect(response.data.stream).toBe(stream);
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://test-org-id.org.coveo.com/api/preview/organizations/test-org-id/agents/commerce/agui/converse',
      {
        method: 'POST',
        signal: undefined,
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: 'Bearer test-token',
        },
      }
    );
  });

  it('does not send temporary AgentCore runtime override headers', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    const [, options] = mockedFetch.mock.calls[0];
    expect(options?.headers).not.toHaveProperty('x-coveo-agent-runtime-name');
    expect(options?.headers).not.toHaveProperty('x-coveo-agent-runtime-qualifier');
  });

  it('POSTs to the provided endpoint verbatim without appending the fixed path', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    const endpoint = 'https://proxy.example.com/some/custom/converse/path';

    await client.call(
      request,
      {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
        endpoint,
      },
      {signal: new AbortController().signal}
    );

    const [calledUrl] = mockedFetch.mock.calls[0];
    expect(calledUrl).toBe(endpoint);
  });

  it('POSTs to the provided endpoint verbatim even when it lacks a path or ends unusually', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    const endpoint = 'https://custom.platform.coveo.com';

    await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
      endpoint,
    });

    const [calledUrl] = mockedFetch.mock.calls[0];
    expect(calledUrl).toBe(endpoint);
    expect(calledUrl).not.toContain('/api/preview/organizations');
    expect(calledUrl).not.toContain('?');
  });

  it('derives the org host and fixed converse path when endpoint is absent', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    const [calledUrl] = mockedFetch.mock.calls[0];
    expect(calledUrl).toBe(
      'https://test-org-id.org.coveo.com/api/preview/organizations/test-org-id/agents/commerce/agui/converse'
    );
  });

  it('fails without a network call when endpoint is absent and organizationId is missing', async () => {
    const response = await client.call(request, {accessToken: 'test-token'});

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected unified endpoint call to fail');
    }
    expect(response.error).toContain('Organization ID is not set');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('fails without a network call when endpoint is absent and organizationId is empty', async () => {
    const response = await client.call(request, {
      organizationId: '',
      accessToken: 'test-token',
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected unified endpoint call to fail');
    }
    expect(response.error).toContain('Organization ID is not set');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('returns success with stream on 2xx response', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response.success).toBe(true);
    if (!response.success) {
      throw new Error('Expected success response');
    }
    expect(response.data.stream).toBe(stream);
  });

  it('returns failure on null response body', async () => {
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => null,
    });

    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response).toEqual({
      success: false,
      error: 'Unified endpoint request failed: empty stream response body.',
    });
  });

  it('transforms HTTP error responses into failures', async () => {
    mockedFetch.mockResolvedValue(new Response(null, {status: 401}));

    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected unified endpoint call to fail');
    }

    expect(response.error).toContain('Authentication failed');
  });

  it('transforms thrown errors into failures', async () => {
    mockedFetch.mockRejectedValue(new Error('network down'));

    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response).toEqual({
      success: false,
      error: 'network down',
    });
  });

  it('forwards AbortSignal to fetch', async () => {
    const stream = new ReadableStream<Uint8Array>();
    mockedFetch.mockResolvedValue(
      new Response(null, {
        status: 200,
      })
    );

    Object.defineProperty(Response.prototype, 'body', {
      configurable: true,
      get: () => stream,
    });

    const controller = new AbortController();

    await client.call(
      request,
      {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
      },
      {signal: controller.signal}
    );

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: controller.signal,
      })
    );
  });
});
