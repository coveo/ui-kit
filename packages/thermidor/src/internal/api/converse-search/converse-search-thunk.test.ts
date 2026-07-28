import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createConverseSearchEndpointThunk} from './converse-search-thunk.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';

const mockCall = vi.fn();
const mockHandleResponse = vi.fn();
const mockExtractStream = vi.fn();

vi.mock('./converse-commerce-search-stream-extractor.js', () => ({
  extractCommerceSearchResponseFromStream: (...args: unknown[]) => mockExtractStream(...args),
}));

vi.mock('@/src/internal/api/commerce-search/commerce-search-request-selector.js', () => ({
  createCommerceSearchEndpointRequestSelector: () => (state: any) =>
    state.__request ?? {
      trackingId: '',
      language: '',
      country: '',
      currency: '',
      query: '',
      page: 0,
      perPage: 10,
      sort: [],
      facets: [],
    },
}));

vi.mock('@/src/internal/api/commerce-search/commerce-search-response-handler.js', () => ({
  createCommerceSearchEndpointResponseHandler: () => mockHandleResponse,
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getEndpointClientConfiguration: (state: any) =>
      state.__config ?? {
        organizationId: 'test-org',
        accessToken: 'test-token',
        endpoint: undefined,
      },
  }),
}));

vi.mock('@/src/internal/features/generative/index.js', () => ({
  getOrCreateGenerativeSelectors: () => ({
    getConversationSessionId: (state: any) => state.__conversationSessionId,
    getConversationToken: (state: any) => state.__conversationToken,
  }),
}));

vi.mock('@/src/internal/features/cart/index.js', () => ({
  getOrCreateCartSelectors: () => ({
    getCartContext: (state: any) => state.__cart,
  }),
}));

vi.mock('@/src/internal/api/conversation/index.js', () => ({
  createConversationEndpointClient: () => ({call: mockCall}),
}));

vi.mock('@/src/internal/api/commerce-search/commerce-search-thunk-slice.js', () => ({
  getOrCreateCommerceSearchEndpointSlice: () => ({
    name: 'mock/commerceSearchEndpoint',
    reducer: () => ({}),
  }),
}));

vi.mock('@/src/internal/utils/index.js', () => ({
  getHandleInternals: () => ({
    stateId: 'test-interface',
    cacheRegistry: {getOrCreate: (_key: any, factory: any) => factory()},
  }),
}));

function createMockEngine(state: Record<string, any> = {}): FullEngine {
  return {
    read: (selector: any) => selector(state),
    mutate: vi.fn(),
    adoptSlice: vi.fn(),
    getNavigatorContextProvider: () => () => ({
      clientId: 'client-abc',
      location: 'https://example.com',
      referrer: 'https://google.com',
      userAgent: 'test-agent',
    }),
  } as unknown as FullEngine;
}

const defaultRequest = {
  trackingId: 'track-1',
  language: 'en',
  country: 'US',
  currency: 'USD',
  query: 'shoes',
  page: 0,
  perPage: 20,
  sort: [{sortCriteria: 'price ascending'}],
  facets: [{facetId: 'brand', selectedValues: ['Nike']}],
};

function createScope(): EndpointStateScope {
  return {
    scopeInterface: {} as any,
    baseInterface: {} as any,
  };
}

async function executeThunk(
  stateOverrides: Record<string, any> = {},
  engineOverrides?: Partial<FullEngine>
) {
  const mockStream = {} as ReadableStream<Uint8Array>;
  mockCall.mockResolvedValue({success: true, data: {stream: mockStream}});
  mockExtractStream.mockResolvedValue({products: []});

  const baseEngine = createMockEngine(stateOverrides);
  const engine = engineOverrides
    ? ({...baseEngine, ...engineOverrides} as unknown as FullEngine)
    : baseEngine;

  const thunk = createConverseSearchEndpointThunk(engine, createScope(), {} as any);
  const action = thunk({engine});
  return {
    result: await action(vi.fn(), () => ({}), undefined),
    engine,
    mockStream,
  };
}

describe('createConverseSearchEndpointThunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs the converse request with all fields populated', async () => {
    const mockStream = {} as ReadableStream<Uint8Array>;
    mockCall.mockResolvedValue({success: true, data: {stream: mockStream}});
    mockExtractStream.mockResolvedValue({products: [], facets: []});

    const engine = createMockEngine({
      __request: defaultRequest,
      __conversationSessionId: 'session-123',
      __conversationToken: 'token-abc',
      __cart: [{productId: 'p1', name: 'Item', price: 10, quantity: 1}],
    });

    const thunk = createConverseSearchEndpointThunk(engine, createScope(), {} as any);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        trackingId: 'track-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        message: 'shoes',
        page: 0,
        perPage: 20,
        sort: [{sortCriteria: 'price ascending'}],
        facets: [{facetId: 'brand', selectedValues: ['Nike']}],
        clientId: 'client-abc',
        conversationSessionId: 'session-123',
        conversationToken: 'token-abc',
        targetEngine: 'AGENT_CORE',
        context: expect.objectContaining({
          user: {userAgent: 'test-agent'},
          view: {url: 'https://example.com', referrer: 'https://google.com'},
          cart: [{productId: 'p1', name: 'Item', price: 10, quantity: 1}],
        }),
      }),
      expect.objectContaining({
        organizationId: 'test-org',
        accessToken: 'test-token',
      })
    );
  });

  it('maps query to message', async () => {
    await executeThunk({
      __request: {...defaultRequest, query: 'running shoes'},
    });

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({message: 'running shoes'}),
      expect.any(Object)
    );
    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({query: expect.anything()}),
      expect.any(Object)
    );
  });

  it('omits sort when sort array is empty', async () => {
    await executeThunk({
      __request: {...defaultRequest, sort: []},
    });

    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({sort: expect.anything()}),
      expect.any(Object)
    );
  });

  it('omits facets when facets array is empty', async () => {
    await executeThunk({
      __request: {...defaultRequest, facets: []},
    });

    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({facets: expect.anything()}),
      expect.any(Object)
    );
  });

  it('omits conversationSessionId when undefined', async () => {
    await executeThunk({
      __request: defaultRequest,
      __conversationSessionId: undefined,
      __conversationToken: 'token-abc',
    });

    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({
        conversationSessionId: expect.anything(),
      }),
      expect.any(Object)
    );
  });

  it('omits conversationToken when undefined', async () => {
    await executeThunk({
      __request: defaultRequest,
      __conversationSessionId: 'session-123',
      __conversationToken: undefined,
    });

    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({
        conversationToken: expect.anything(),
      }),
      expect.any(Object)
    );
  });

  it('uses null fallbacks when navigator context is unavailable', async () => {
    await executeThunk({__request: defaultRequest}, {
      getNavigatorContextProvider: () => undefined,
    } as any);

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: undefined,
        context: expect.objectContaining({
          user: {userAgent: null},
          view: {url: null, referrer: null},
        }),
      }),
      expect.any(Object)
    );
  });

  it('rejects when endpoint client returns an error', async () => {
    mockCall.mockResolvedValue({
      success: false,
      error: 'Converse endpoint failed',
    });

    const engine = createMockEngine({
      __request: defaultRequest,
    });

    const thunk = createConverseSearchEndpointThunk(engine, createScope(), {} as any);
    const action = thunk({engine});
    const result = await action(vi.fn(), () => ({}), undefined);

    expect(result.meta.rejectedWithValue).toBeFalsy();
    expect((result as any).error.message).toBe('Converse endpoint failed');
  });

  it('rejects when stream extractor rejects', async () => {
    const mockStream = {} as ReadableStream<Uint8Array>;
    mockCall.mockResolvedValue({success: true, data: {stream: mockStream}});
    mockExtractStream.mockRejectedValue(
      new Error('No search response received from the converse stream')
    );

    const engine = createMockEngine({
      __request: defaultRequest,
    });

    const thunk = createConverseSearchEndpointThunk(engine, createScope(), {} as any);
    const action = thunk({engine});
    const result = await action(vi.fn(), () => ({}), undefined);

    expect(result.meta.rejectedWithValue).toBeFalsy();
    expect((result as any).error.message).toBe(
      'No search response received from the converse stream'
    );
  });

  it('calls response handler with extracted payload on success', async () => {
    const mockStream = {} as ReadableStream<Uint8Array>;
    const extractedPayload = {products: [{id: '1'}], facets: [], sort: {}};
    mockCall.mockResolvedValue({success: true, data: {stream: mockStream}});
    mockExtractStream.mockResolvedValue(extractedPayload);

    const engine = createMockEngine({
      __request: defaultRequest,
    });

    const thunk = createConverseSearchEndpointThunk(engine, createScope(), {} as any);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockExtractStream).toHaveBeenCalledWith(mockStream);
    expect(mockHandleResponse).toHaveBeenCalledWith(engine, extractedPayload);
  });
});
