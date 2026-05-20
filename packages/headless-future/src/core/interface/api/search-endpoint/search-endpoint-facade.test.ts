import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as searchEndpointMutators from '@/src/core/interface/api/search-endpoint/search-endpoint-mutators.js';
import * as searchEndpointSelectors from '@/src/core/interface/api/search-endpoint/search-endpoint-selectors.js';
import * as configurationSelectors from '@/src/core/interface/configuration/configuration-selectors.js';
import {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
import {buildRequest} from '@/src/core/internal/api/base-facade/endpoint-facade-request-builder.js';
import {SearchEndpointFacade} from './search-endpoint-facade.js';
import type {CoveoSearchEndpointResponse} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

const mockClientCall = vi.fn();

vi.mock(
  '@/src/api/interface/search-endpoint/search-endpoint-client.js',
  () => ({
    createSearchEndpointClient: vi.fn(() => ({
      call: mockClientCall,
    })),
  })
);

vi.mock(
  '@/src/core/internal/api/base-facade/endpoint-facade-request-builder.js',
  () => ({
    buildRequest: vi.fn(() => ({})),
  })
);

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  getNavigatorContextProvider: ReturnType<typeof vi.fn>;
  mutate: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
    getNavigatorContextProvider: vi.fn(),
    mutate: vi.fn(),
    read: vi.fn((selector) => {
      if (selector === configurationSelectors.organizationId) {
        return 'test-org-id';
      }
      if (selector === configurationSelectors.accessToken) {
        return 'test-token';
      }
      if (selector === configurationSelectors.endpoint) {
        return 'https://platform.cloud.coveo.com';
      }
      return undefined;
    }),
    subscribe: vi.fn(() => vi.fn()),
  } as unknown as MockEngine;
};

const buildMockResponse = (): CoveoSearchEndpointResponse => ({
  totalCount: 1,
  results: [
    {
      uniqueId: 'r1',
      title: 'Original title',
      uri: 'https://example.com/r1',
    },
  ],
});

describe('SearchEndpointFacade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientCall.mockReset();

    vi.mocked(createSearchEndpointClient).mockImplementation(() => ({
      call: mockClientCall,
    }));
    vi.mocked(buildRequest).mockReturnValue({});
  });

  it('returns the same instance for the same engine', () => {
    const engine = createMockEngine();

    const firstInstance = SearchEndpointFacade.getInstance(engine);
    const secondInstance = SearchEndpointFacade.getInstance(engine);

    expect(firstInstance).toBe(secondInstance);
    expect(createSearchEndpointClient).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
  });

  it('returns different instances for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    const firstInstance = SearchEndpointFacade.getInstance(firstEngine);
    const secondInstance = SearchEndpointFacade.getInstance(secondEngine);

    expect(firstInstance).not.toBe(secondInstance);
    expect(createSearchEndpointClient).toHaveBeenCalledTimes(2);
  });

  it('delegates status subscriptions to the engine', () => {
    const engine = createMockEngine();
    const unsubscribe = vi.fn();
    engine.subscribe.mockReturnValue(unsubscribe);
    const facade = SearchEndpointFacade.getInstance(engine);
    const listener = vi.fn();

    const returnedUnsubscribe = facade.onStatusChange(listener);

    expect(engine.subscribe).toHaveBeenCalledWith(
      searchEndpointSelectors.isLoading,
      listener
    );
    expect(returnedUnsubscribe).toBe(unsubscribe);
  });

  it('calls buildRequest with registered contributors', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    const finalRequest = {q: 'headless'};
    vi.mocked(buildRequest).mockReturnValue(finalRequest);
    mockClientCall.mockResolvedValue({success: true});

    await facade.callEndpoint();

    expect(buildRequest).toHaveBeenCalledWith([]);
    expect(mockClientCall).toHaveBeenCalledWith(finalRequest, {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
      endpoint: 'https://platform.cloud.coveo.com',
    });
  });

  it('sets pending and idle status around a successful request', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    mockClientCall.mockResolvedValue({success: true});

    await facade.callEndpoint();

    expect(engine.mutate).toHaveBeenNthCalledWith(
      1,
      searchEndpointMutators.setStatus('pending')
    );
    expect(engine.mutate).toHaveBeenNthCalledWith(
      2,
      searchEndpointMutators.setError(null)
    );
    expect(engine.mutate).toHaveBeenLastCalledWith(
      searchEndpointMutators.setStatus('idle')
    );
  });

  it('sets error status when the client returns an unsuccessful result', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    mockClientCall.mockResolvedValue({
      success: false,
      error: 'request failed',
    });

    await facade.callEndpoint();

    expect(engine.mutate).toHaveBeenCalledWith(
      searchEndpointMutators.setError('request failed')
    );
    expect(engine.mutate).toHaveBeenLastCalledWith(
      searchEndpointMutators.setStatus('idle')
    );
  });

  it('stores unexpected thrown errors when request execution throws', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    const thrownError = new Error('boom');
    mockClientCall.mockRejectedValue(thrownError);

    await expect(facade.callEndpoint()).rejects.toThrow('boom');

    expect(engine.mutate).toHaveBeenCalledWith(
      searchEndpointMutators.setError('boom')
    );
    expect(engine.mutate).toHaveBeenLastCalledWith(
      searchEndpointMutators.setStatus('idle')
    );
  });

  it('stores a fallback error for non-Error thrown values', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    const thrownValue = null;
    mockClientCall.mockRejectedValue(thrownValue);

    await expect(facade.callEndpoint()).rejects.toBeNull();

    expect(engine.mutate).toHaveBeenCalledWith(
      searchEndpointMutators.setError(
        'An unexpected error occurred. Please try again.'
      )
    );
    expect(engine.mutate).toHaveBeenLastCalledWith(
      searchEndpointMutators.setStatus('idle')
    );
  });

  it('dispatches cloned responses to listeners and supports unsubscribe', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    const response = buildMockResponse();
    const listener = vi.fn((payload: CoveoSearchEndpointResponse) => {
      payload.results[0].title = 'Mutated by listener';
    });
    const unsubscribe = facade.onResponse(listener);
    mockClientCall.mockResolvedValue({
      success: true,
      data: response,
    });

    await facade.callEndpoint();

    const receivedResponse = listener.mock.calls[0][0];

    expect(listener).toHaveBeenCalledTimes(1);
    expect(receivedResponse).not.toBe(response);
    expect(receivedResponse.totalCount).toBe(response.totalCount);
    expect(receivedResponse.results[0].uniqueId).toBe(
      response.results[0].uniqueId
    );
    expect(receivedResponse.results[0].title).toBe('Mutated by listener');
    expect(response.results[0].title).toBe('Original title');

    unsubscribe();
    await facade.callEndpoint();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('returns composition debug information with registered contributors', () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);

    facade.onRequest(() => ({q: 'laptops'}));
    facade.onRequest(() => ({numberOfResults: 10}));

    const debugInfo = facade.getRequestCompositionDebugInfo();

    expect(debugInfo.registeredContributorCount).toBe(2);
  });
});
