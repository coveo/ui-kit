import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as searchEndpointMutators from '@/src/core/interface/api/search-endpoint/search-endpoint-mutators.js';
import {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
import {SearchEndpointFacade} from './search-endpoint-facade.js';
import {handleSearchEndpointResponse} from './search-endpoint-response-handler.js';
import type {CoveoSearchEndpointResponse} from './search-endpoint-types.js';

const mockClientCall = vi.fn();

vi.mock(
  '@/src/api/interface/search-endpoint/search-endpoint-client.js',
  () => ({
    createSearchEndpointClient: vi.fn(() => ({
      call: mockClientCall,
    })),
  })
);

vi.mock('./search-endpoint-response-handler.js', () => ({
  handleSearchEndpointResponse: vi.fn(),
}));

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  getNavigatorContextProvider: ReturnType<typeof vi.fn>;
  mutate: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  const state = {
    configuration: {
      organizationId: 'test-org-id',
      accessToken: 'test-token',
      endpoint: 'https://platform.cloud.coveo.com',
      trackingId: '',
      language: '',
      country: '',
      currency: '',
    },
  };

  return {
    adoptSlice: vi.fn(async () => undefined),
    getNavigatorContextProvider: vi.fn(),
    mutate: vi.fn(),
    read: vi.fn((selector) => selector(state)),
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
      printableUri: 'https://example.com/r1',
      clickUri: 'https://example.com/r1',
      raw: {},
      score: 0,
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
  });

  it('returns the same instance for the same engine', () => {
    const engine = createMockEngine();

    const firstInstance = SearchEndpointFacade.getInstance(engine);
    const secondInstance = SearchEndpointFacade.getInstance(engine);

    expect(firstInstance).toBe(secondInstance);
    expect(createSearchEndpointClient).toHaveBeenCalledTimes(1);
  });

  it('returns different instances for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    const firstInstance = SearchEndpointFacade.getInstance(firstEngine);
    const secondInstance = SearchEndpointFacade.getInstance(secondEngine);

    expect(firstInstance).not.toBe(secondInstance);
    expect(createSearchEndpointClient).toHaveBeenCalledTimes(2);
  });

  it('sets pending and idle status around a successful request', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    mockClientCall.mockResolvedValue({
      success: true,
      data: buildMockResponse(),
    });

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

  it('stores error when request execution throws', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    mockClientCall.mockRejectedValue(new Error('boom'));

    await facade.callEndpoint();

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
    mockClientCall.mockRejectedValue(null);

    await facade.callEndpoint();

    expect(engine.mutate).toHaveBeenCalledWith(
      searchEndpointMutators.setError('An unexpected error occurred.')
    );
    expect(engine.mutate).toHaveBeenLastCalledWith(
      searchEndpointMutators.setStatus('idle')
    );
  });

  it('calls handleSearchEndpointResponse on successful response', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    const response = buildMockResponse();
    mockClientCall.mockResolvedValue({success: true, data: response});

    await facade.callEndpoint();

    expect(handleSearchEndpointResponse).toHaveBeenCalledWith(engine, response);
  });

  it('does not call handleSearchEndpointResponse on error', async () => {
    const engine = createMockEngine();
    const facade = SearchEndpointFacade.getInstance(engine);
    mockClientCall.mockResolvedValue({success: false, error: 'fail'});

    await facade.callEndpoint();

    expect(handleSearchEndpointResponse).not.toHaveBeenCalled();
  });
});
