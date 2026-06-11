import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {
  setError,
  setStatus,
} from '@/src/core/interface/api/search-endpoint/search-endpoint-mutators.js';
import {buildSearchEndpointRequest} from '@/src/core/interface/api/search-endpoint/search-endpoint-selectors.js';
import {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {SearchEndpointFacade} from './search-endpoint-facade.js';
import {handleSearchEndpointResponse} from './search-endpoint-response-handler.js';
import {loadSearchEndpoint} from './search-endpoint-loader.js';
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

vi.mock('./search-endpoint-loader.js', () => ({
  loadSearchEndpoint: vi.fn(),
}));

vi.mock('./search-endpoint-response-handler.js', () => ({
  handleSearchEndpointResponse: vi.fn(),
}));

vi.mock('@/src/core/internal/configuration/configuration-reader.js', () => ({
  readEndpointClientConfiguration: vi.fn(() => ({
    organizationId: 'test-org-id',
    accessToken: 'test-token',
    endpoint: 'https://platform.cloud.coveo.com',
  })),
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

  describe('getInstance', () => {
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

    it('adopts the search endpoint slice on first instantiation', () => {
      const engine = createMockEngine();

      SearchEndpointFacade.getInstance(engine);

      expect(loadSearchEndpoint).toHaveBeenCalledWith(engine);
    });
  });

  describe('callEndpoint', () => {
    describe('request building', () => {
      it('reads the request from state using buildSearchEndpointRequest selector', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({
          success: true,
          data: buildMockResponse(),
        });

        await facade.callEndpoint();

        expect(engine.read).toHaveBeenCalledWith(buildSearchEndpointRequest);
      });

      it('reads endpoint client configuration from engine', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({
          success: true,
          data: buildMockResponse(),
        });

        await facade.callEndpoint();

        expect(readEndpointClientConfiguration).toHaveBeenCalledWith(engine);
      });

      it('passes built request and configuration to client', async () => {
        const mockRequest = {
          q: 'test',
          numberOfResults: 10,
          firstResult: 0,
          facets: [],
        };
        const engine = createMockEngine();
        engine.read.mockImplementation((selector: any) => {
          if (selector === buildSearchEndpointRequest) {
            return mockRequest;
          }
          return selector(engine);
        });
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({
          success: true,
          data: buildMockResponse(),
        });

        await facade.callEndpoint();

        expect(mockClientCall).toHaveBeenCalledWith(
          mockRequest,
          expect.objectContaining({organizationId: 'test-org-id'}),
          undefined
        );
      });

      it('passes options through to the client call', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        const options = {signal: new AbortController().signal};
        mockClientCall.mockResolvedValue({
          success: true,
          data: buildMockResponse(),
        });

        await facade.callEndpoint(options);

        expect(mockClientCall).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          options
        );
      });
    });

    describe('success path', () => {
      it('sets pending and idle status around a successful request', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({
          success: true,
          data: buildMockResponse(),
        });

        await facade.callEndpoint();

        expect(engine.mutate).toHaveBeenNthCalledWith(1, setStatus('pending'));
        expect(engine.mutate).toHaveBeenNthCalledWith(2, setError(null));
        expect(engine.mutate).toHaveBeenLastCalledWith(setStatus('idle'));
      });

      it('calls handleSearchEndpointResponse on successful response', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        const response = buildMockResponse();
        mockClientCall.mockResolvedValue({success: true, data: response});

        await facade.callEndpoint();

        expect(handleSearchEndpointResponse).toHaveBeenCalledWith(
          engine,
          response
        );
      });

      it('does not call handleSearchEndpointResponse when data is falsy and sets status back to idle', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({success: true, data: null});

        await facade.callEndpoint();

        expect(handleSearchEndpointResponse).not.toHaveBeenCalled();
        expect(engine.mutate).toHaveBeenLastCalledWith(setStatus('idle'));
      });
    });

    describe('error path', () => {
      it('sets error when the client returns an unsuccessful result', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({
          success: false,
          error: 'request failed',
        });

        await facade.callEndpoint();

        expect(engine.mutate).toHaveBeenCalledWith(setError('request failed'));
        expect(engine.mutate).toHaveBeenLastCalledWith(setStatus('idle'));
      });

      it('stores error message when request execution throws an Error', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockRejectedValue(new Error('boom'));

        await facade.callEndpoint();

        expect(engine.mutate).toHaveBeenCalledWith(setError('boom'));
        expect(engine.mutate).toHaveBeenLastCalledWith(setStatus('idle'));
      });

      it('stores a fallback error for non-Error thrown values', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockRejectedValue(null);

        await facade.callEndpoint();

        expect(engine.mutate).toHaveBeenCalledWith(
          setError('An unexpected error occurred.')
        );
        expect(engine.mutate).toHaveBeenLastCalledWith(setStatus('idle'));
      });

      it('does not call handleSearchEndpointResponse on error', async () => {
        const engine = createMockEngine();
        const facade = SearchEndpointFacade.getInstance(engine);
        mockClientCall.mockResolvedValue({success: false, error: 'fail'});

        await facade.callEndpoint();

        expect(handleSearchEndpointResponse).not.toHaveBeenCalled();
      });
    });
  });

  describe('getDebugInfo', () => {
    it('returns the current request built from state', () => {
      const engine = createMockEngine();
      const facade = SearchEndpointFacade.getInstance(engine);

      const debugInfo = facade.getDebugInfo();

      expect(engine.read).toHaveBeenCalledWith(buildSearchEndpointRequest);
      expect(debugInfo).toHaveProperty('currentRequest');
    });
  });
});
