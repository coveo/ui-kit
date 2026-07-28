import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {createSearchEndpointThunk} from './search-thunk.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';

const mockCall = vi.fn();

vi.mock('./search-request-selector.js', () => ({
  createSearchEndpointRequestSelector: () => (state: any) => state.__request ?? {q: ''},
}));

vi.mock('./search-response-handler.js', () => ({
  createSearchEndpointResponseHandler: () => vi.fn(),
}));

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getTrackingId: (state: any) => state.__trackingId ?? '',
    getEndpointClientConfiguration: (state: any) => ({
      organizationId: 'test-org',
      accessToken: 'test-token',
      endpoint: undefined,
    }),
  }),
}));

vi.mock('@/src/internal/api/search/index.js', () => ({
  createSearchEndpointClient: () => ({call: mockCall}),
}));

vi.mock('./search-thunk-slice.js', () => ({
  getOrCreateSearchEndpointSlice: () => ({
    name: 'mock/searchEndpoint',
    reducer: () => ({}),
  }),
}));

vi.mock('@/src/internal/api/analytics-params.js', async () => {
  const actual = await vi.importActual<typeof import('@/src/internal/api/analytics-params.js')>(
    '@/src/internal/api/analytics-params.js'
  );
  return actual;
});

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

describe('createSearchEndpointThunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes analytics in the request when navigator context is available', async () => {
    mockCall.mockResolvedValue({
      success: true,
      data: {totalCount: 0, results: []},
    });

    const engine = createMockEngine({
      __request: {q: 'test', firstResult: 0, numberOfResults: 10},
      __trackingId: 'track-123',
    });

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'test',
        analytics: expect.objectContaining({
          clientId: 'client-abc',
          originContext: 'Search',
          trackingId: 'track-123',
          documentReferrer: 'https://google.com',
          documentLocation: 'https://example.com',
          clientTimestamp: '2026-03-01T12:00:00.000Z',
        }),
      }),
      expect.any(Object)
    );
  });

  it('omits analytics when navigator context provider is not available', async () => {
    mockCall.mockResolvedValue({
      success: true,
      data: {totalCount: 0, results: []},
    });

    const engine = {
      read: (selector: any) => selector({__request: {q: 'test'}}),
      mutate: vi.fn(),
      adoptSlice: vi.fn(),
      getNavigatorContextProvider: () => undefined,
    } as unknown as FullEngine;

    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    await action(vi.fn(), () => ({}), undefined);

    expect(mockCall).toHaveBeenCalledWith(
      expect.not.objectContaining({analytics: expect.anything()}),
      expect.any(Object)
    );
  });

  it('rejects the thunk when the endpoint client returns an error', async () => {
    mockCall.mockResolvedValue({success: false, error: 'Something went wrong'});

    const engine = createMockEngine({__request: {q: 'fail'}});
    const scope: EndpointStateScope = {
      scopeInterface: {} as any,
      baseInterface: {} as any,
    };

    const thunk = createSearchEndpointThunk(engine, scope);
    const action = thunk({engine});
    const result = await action(vi.fn(), () => ({}), undefined);

    expect(result.meta.rejectedWithValue).toBeFalsy();
    expect((result as any).error.message).toBe('Something went wrong');
  });
});
