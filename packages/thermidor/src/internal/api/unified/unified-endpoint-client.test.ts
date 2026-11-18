import {beforeEach, describe, expect, it, vi, type MockedFunction} from 'vitest';
import {createUnifiedEndpointClient} from './unified-endpoint-client.js';
import type {CommerceRequestModel} from './unified-endpoint-types.js';

describe('UnifiedEndpointClient', () => {
  let client: ReturnType<typeof createUnifiedEndpointClient>;
  let mockedFetch: MockedFunction<typeof fetch>;

  const request: CommerceRequestModel = {
    agentConfigurationId: 'agent-configuration-id',
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
    expect(response.unsent).toBe(true);
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
    expect(response.unsent).toBe(true);
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
    expect(response.unsent).toBe(true);
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
    expect(response.status).toBe(401);
    expect(response.unsent).toBeUndefined();
  });

  describe('409 Conflict', () => {
    const callFailing = async (response: Response) => {
      mockedFetch.mockResolvedValue(response);
      const result = await client.call(request, {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
      });
      if (result.success) {
        throw new Error('Expected unified endpoint call to fail');
      }
      return result;
    };

    const gatewayError = {
      errorCode: 'AGENT:ACTION_IN_FLIGHT',
      message: 'Another turn is in progress for this session.',
      requestId: 'request-1',
      documentationUrl: 'https://docs.coveo.com/en/errors/agent/action_in_flight',
    };

    const conflictBody = (body: unknown) =>
      typeof body === 'string' ? body : JSON.stringify(body);

    it('reads an AGENT:ACTION_IN_FLIGHT conflict and its in-flight sequence', async () => {
      const result = await callFailing(
        new Response(conflictBody({...gatewayError, inFlightSequence: 7}), {status: 409})
      );

      expect(result.error).toBe(
        'Conflict: Another request is still being processed for this session.'
      );
      expect(result.conflict).toEqual({inFlightSequence: 7});
      expect(result.status).toBe(409);
    });

    it('reads a conflict without an in-flight sequence', async () => {
      const result = await callFailing(new Response(conflictBody(gatewayError), {status: 409}));

      expect(result.conflict).toEqual({});
    });

    it.each([
      ['no body', null],
      ['a non-JSON body', 'busy'],
      ['another error code', conflictBody({...gatewayError, errorCode: 'AGENT:VERSION_MISMATCH'})],
      ['the code in another field', conflictBody({code: 'AGENT:ACTION_IN_FLIGHT'})],
    ])('is not an in-flight conflict with %s', async (_label, body) => {
      const result = await callFailing(new Response(body, {status: 409}));

      expect(result.error).toBe('Conflict: The request conflicts with the current session state.');
      expect(result.conflict).toBeUndefined();
    });

    it('is never read from another status', async () => {
      const result = await callFailing(new Response(conflictBody(gatewayError), {status: 503}));

      expect(result.conflict).toBeUndefined();
    });
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
      transient: {},
    });
  });

  /** Makes the mocked `fetch` reject a malformed URL or header as the real one does. */
  const rejectLikeFetch = () =>
    mockedFetch.mockImplementation(async (input, init) => {
      new Request(input, init);
      return new Response(null, {status: 200});
    });

  it.each([
    [
      'a request it cannot build',
      () =>
        client.call({...request, custom: {big: 1n}} as never, {
          organizationId: 'test-org-id',
          accessToken: 'test-token',
        }),
    ],
    [
      'a malformed endpoint',
      () => {
        rejectLikeFetch();
        return client.call(request, {
          organizationId: 'test-org-id',
          accessToken: 'test-token',
          endpoint: 'http://[',
        });
      },
    ],
    [
      'an access token that is not a valid header value',
      () => {
        rejectLikeFetch();
        return client.call(request, {
          organizationId: 'test-org-id',
          accessToken: 'token\nwith-newline',
        });
      },
    ],
    [
      'a fetch aborted with its own reason',
      () => {
        const controller = new AbortController();
        const reason = new Error('cancelled');
        controller.abort(reason);
        mockedFetch.mockRejectedValue(reason);
        return client.call(
          request,
          {organizationId: 'test-org-id', accessToken: 'test-token'},
          {signal: controller.signal}
        );
      },
    ],
    [
      'an aborted fetch',
      () => {
        mockedFetch.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'));
        return client.call(request, {organizationId: 'test-org-id', accessToken: 'test-token'});
      },
    ],
  ])('does not report %s as transient', async (_label, call) => {
    const response = await call();

    expect(response).toMatchObject({success: false});
    expect(response).not.toHaveProperty('transient');
  });

  describe('transient failures', () => {
    const callFailing = async (response: Response) => {
      mockedFetch.mockResolvedValue(response);
      const result = await client.call(request, {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
      });
      if (result.success) {
        throw new Error('Expected unified endpoint call to fail');
      }
      return result;
    };

    it.each([
      [502, {}],
      [503, {}],
      [504, {}],
      [400, undefined],
      [401, undefined],
      [403, undefined],
      [404, undefined],
      [409, undefined],
      [500, undefined],
    ])('reads a %i as transient: %o', async (status, transient) => {
      const result = await callFailing(new Response(null, {status}));

      expect(result.transient).toEqual(transient);
    });

    it.each([
      ['in seconds', '3', {retryAfterMs: 3000}],
      ['as a past HTTP date', 'Wed, 21 Oct 2015 07:28:00 GMT', {retryAfterMs: 0}],
      ['missing', undefined, {}],
      ['unreadable', 'soon', {}],
    ])('reads a 429 with its Retry-After %s', async (_label, retryAfter, transient) => {
      const headers: Record<string, string> = retryAfter ? {'Retry-After': retryAfter} : {};
      const result = await callFailing(new Response(null, {status: 429, headers}));

      expect(result.transient).toEqual(transient);
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
