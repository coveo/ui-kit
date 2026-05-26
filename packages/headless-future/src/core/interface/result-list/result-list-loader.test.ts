import {beforeEach, describe, expect, it, vi} from 'vitest';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {loadResultList} from './result-list-loader.js';
import {SearchEndpointFacade} from '@/src/core/interface/api/search-endpoint/search-endpoint-facade.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CoveoSearchEndpointResponseHandler} from '@/src/api/index.js';

const {mockOnResponse, mockGetInstance} = vi.hoisted(() => {
  const onResponse = vi.fn();
  const getInstance = vi.fn(() => ({
    onResponse,
  }));

  return {
    mockOnResponse: onResponse,
    mockGetInstance: getInstance,
  };
});

vi.mock(
  '@/src/core/interface/api/search-endpoint/search-endpoint-facade.js',
  () => ({
    SearchEndpointFacade: {
      getInstance: mockGetInstance,
    },
  })
);

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  mutate: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine =>
  ({
    adoptSlice: vi.fn(async () => undefined),
    mutate: vi.fn(),
  }) as unknown as MockEngine;

describe('loadResultList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnResponse.mockReset();
    mockGetInstance.mockReset();
    mockGetInstance.mockReturnValue({onResponse: mockOnResponse});
  });

  it('adopts result list slice and registers response listener on first load', () => {
    const engine = createMockEngine();

    loadResultList(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(resultsSlice);
    expect(SearchEndpointFacade.getInstance).toHaveBeenCalledWith(engine);
    expect(mockOnResponse).toHaveBeenCalledTimes(1);
  });

  it('does not initialize twice for the same engine', () => {
    const engine = createMockEngine();

    loadResultList(engine);
    loadResultList(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(SearchEndpointFacade.getInstance).toHaveBeenCalledTimes(1);
    expect(mockOnResponse).toHaveBeenCalledTimes(1);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadResultList(firstEngine);
    loadResultList(secondEngine);

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(SearchEndpointFacade.getInstance).toHaveBeenCalledTimes(2);
    expect(mockOnResponse).toHaveBeenCalledTimes(2);
  });

  it('mutates result list state when facade emits a response', () => {
    const engine = createMockEngine();
    mockOnResponse.mockImplementation(() => vi.fn());

    loadResultList(engine);

    const handler = mockOnResponse.mock.calls[0]?.[0] as
      | CoveoSearchEndpointResponseHandler
      | undefined;
    if (!handler) {
      throw new Error('Expected response handler to be registered.');
    }

    handler({
      totalCount: 1,
      results: [
        {
          uniqueId: 'id-1',
          uri: 'https://example.com/1',
          title: 'First Result',
          excerpt: 'Result excerpt',
        },
      ],
    });

    expect(engine.mutate).toHaveBeenCalledTimes(1);
    expect(engine.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: resultsSlice.actions.setResults.type,
        payload: [
          {
            id: 'https://example.com/1',
            uri: 'https://example.com/1',
            title: 'First Result',
            excerpt: 'Result excerpt',
          },
        ],
      })
    );
  });
});
