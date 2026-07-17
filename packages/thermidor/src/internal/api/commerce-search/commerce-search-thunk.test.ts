import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createCommerceSearchEndpointThunk} from './commerce-search-thunk.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';

const mockCall = vi.fn();

vi.mock('./commerce-search-request-selector.js', () => ({
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
    },
}));

vi.mock('./commerce-search-response-handler.js', () => ({
  createCommerceSearchEndpointResponseHandler: () => vi.fn(),
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getEndpointClientConfiguration: (state: any) => ({
      organizationId: 'test-org',
      accessToken: 'test-token',
      endpoint: undefined,
    }),
  }),
}));

vi.mock('@/src/internal/api/commerce-search/index.js', () => ({
  createCommerceSearchEndpointClient: () => ({call: mockCall}),
}));

vi.mock('./commerce-search-thunk-slice.js', () => ({
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

describe('createCommerceSearchEndpointThunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes the full request with navigator context to the endpoint client', async () => {
    mockCall.mockResolvedValue({
      success: true,
      data: {products: [], results: [], facets: [], pagination: {}, sort: {}},
    });

    const engine = createMockEngine({
      __request: {
        trackingId: 'track-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        query: 'shoes',
        page: 0,
        perPage: 20,
        sort: [],
      },
    });

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createCommerceSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        trackingId: 'track-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        query: 'shoes',
        page: 0,
        perPage: 20,
        clientId: 'client-abc',
        context: {view: {url: 'https://example.com'}},
      }),
      expect.objectContaining({
        organizationId: 'test-org',
        accessToken: 'test-token',
      })
    );
  });

  it('includes sort when sort criteria are present', async () => {
    mockCall.mockResolvedValue({success: true, data: {}});

    const engine = createMockEngine({
      __request: {
        trackingId: 'track-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        query: 'shoes',
        page: 0,
        perPage: 10,
        sort: [{sortCriteria: 'price ascending'}],
      },
    });

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createCommerceSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: [{sortCriteria: 'price ascending'}],
      }),
      expect.any(Object)
    );
  });

  it('omits sort when sort array is empty', async () => {
    mockCall.mockResolvedValue({success: true, data: {}});

    const engine = createMockEngine({
      __request: {
        trackingId: 'track-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        query: 'shoes',
        page: 0,
        perPage: 10,
        sort: [],
      },
    });

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createCommerceSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({sort: expect.anything()}),
      expect.any(Object)
    );
  });

  it('rejects the thunk when the endpoint client returns an error', async () => {
    mockCall.mockResolvedValue({
      success: false,
      error: 'Commerce search failed',
    });

    const engine = createMockEngine({
      __request: {
        trackingId: 'track-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        query: 'fail',
        page: 0,
        perPage: 10,
        sort: [],
      },
    });

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createCommerceSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    const result = await action(vi.fn(), () => ({}), undefined);

    expect(result.meta.rejectedWithValue).toBeFalsy();
    expect((result as any).error.message).toBe('Commerce search failed');
  });

  it('handles missing navigator context provider gracefully', async () => {
    mockCall.mockResolvedValue({success: true, data: {}});

    const engine = {
      read: (selector: any) =>
        selector({
          __request: {
            trackingId: 'track-1',
            language: 'en',
            country: 'US',
            currency: 'USD',
            query: 'test',
            page: 0,
            perPage: 10,
            sort: [],
          },
        }),
      mutate: vi.fn(),
      adoptSlice: vi.fn(),
      getNavigatorContextProvider: () => undefined,
    } as unknown as FullEngine;

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createCommerceSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: undefined,
        context: {view: {url: ''}},
      }),
      expect.any(Object)
    );
  });
});
