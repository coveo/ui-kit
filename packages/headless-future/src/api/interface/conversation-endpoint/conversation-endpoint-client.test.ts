import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';
import {createConversationEndpointClient} from './conversation-endpoint-client.js';
import type {CoveoConversationEndpointRequest} from './conversation-endpoint-types.js';

describe('ConversationEndpointClient', () => {
  let client: ReturnType<typeof createConversationEndpointClient>;
  let mockedFetch: MockedFunction<typeof fetch>;

  const request: CoveoConversationEndpointRequest = {
    trackingId: 'tracking-id',
    language: 'en',
    country: 'US',
    currency: 'USD',
    clientId: 'client-id',
    message: 'Hello',
    context: {
      user: {
        userAgent: 'Mozilla/5.0',
      },
      view: {
        url: 'https://example.com/products',
        referrer: 'https://example.com',
      },
      cart: {
        items: [],
      },
    },
    targetEngine: 'AGENT_CORE',
  };

  beforeEach(() => {
    client = createConversationEndpointClient();
    mockedFetch = vi.fn();
    vi.stubGlobal('fetch', mockedFetch);
  });

  it('returns configuration error when organizationId is missing', async () => {
    const response = await client.call(request, {accessToken: 'test-token'});

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected conversation endpoint call to fail');
    }
    expect(response.error).toContain('Organization ID is not set');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('returns configuration error when accessToken is missing', async () => {
    const response = await client.call(request, {organizationId: 'test-org'});

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected conversation endpoint call to fail');
    }
    expect(response.error).toContain('Access token is not set');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('calls converse endpoint with request payload and stream headers', async () => {
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
      'https://test-org-id.org.coveo.com/rest/organizations/test-org-id/commerce/unstable/agentic/converse',
      {
        method: 'POST',
        signal: undefined,
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: 'Bearer test-token',
          'Coveo-Organization-Id': 'test-org-id',
        },
      }
    );
  });

  it('uses configured custom endpoint', async () => {
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

    await client.call(
      request,
      {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
        endpoint: 'https://custom.platform.coveo.com',
      },
      {signal: new AbortController().signal}
    );

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://custom.platform.coveo.com/rest/organizations/test-org-id/commerce/unstable/agentic/converse',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('returns failure when the stream response body is missing', async () => {
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
      error: 'Conversation request failed: empty stream response body.',
    });
  });

  it('transforms HTTP failure responses into failed client results', async () => {
    mockedFetch.mockResolvedValue(new Response(null, {status: 401}));

    const response = await client.call(request, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected conversation endpoint call to fail');
    }

    expect(response.error).toContain('Authentication failed');
  });

  it('transforms thrown errors into failed client results', async () => {
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
});
