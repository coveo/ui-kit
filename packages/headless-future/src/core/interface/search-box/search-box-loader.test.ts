import {beforeEach, describe, expect, it, vi} from 'vitest';
import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {loadSearchBox} from './search-box-loader.js';
import {SearchEndpointFacade} from '@/src/core/interface/api/search-endpoint/search-endpoint-facade.js';
import * as searchBoxSelectors from './search-box-selectors.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CoveoSearchEndpointRequestContributor} from '@/src/api/index.js';

const {mockOnRequest, mockGetInstance} = vi.hoisted(() => {
  const onRequest = vi.fn();
  const getInstance = vi.fn(() => ({
    onRequest,
  }));

  return {
    mockOnRequest: onRequest,
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
  read: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine =>
  ({
    adoptSlice: vi.fn(async () => undefined),
    read: vi.fn(),
  }) as unknown as MockEngine;

describe('loadSearchBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRequest.mockReset();
    mockGetInstance.mockReset();
    mockGetInstance.mockReturnValue({onRequest: mockOnRequest});
  });

  it('adopts search-box slice and registers request contributor on first load', () => {
    const engine = createMockEngine();

    loadSearchBox(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(engine.adoptSlice).toHaveBeenCalledWith(searchBoxSlice);
    expect(SearchEndpointFacade.getInstance).toHaveBeenCalledWith(engine);
    expect(mockOnRequest).toHaveBeenCalledTimes(1);
    expect(mockOnRequest).toHaveBeenCalledWith(expect.any(Function));
  });

  it('does not initialize twice for the same engine', () => {
    const engine = createMockEngine();

    loadSearchBox(engine);
    loadSearchBox(engine);

    expect(engine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(SearchEndpointFacade.getInstance).toHaveBeenCalledTimes(1);
    expect(mockOnRequest).toHaveBeenCalledTimes(1);
  });

  it('initializes independently for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    loadSearchBox(firstEngine);
    loadSearchBox(secondEngine);

    expect(firstEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(secondEngine.adoptSlice).toHaveBeenCalledTimes(1);
    expect(SearchEndpointFacade.getInstance).toHaveBeenCalledTimes(2);
    expect(mockOnRequest).toHaveBeenCalledTimes(2);
  });

  it('registers a contributor that reads query from the engine', () => {
    const engine = createMockEngine();
    engine.read.mockReturnValue('laptops');

    loadSearchBox(engine);

    const contributor = mockOnRequest.mock.calls[0]?.[0] as
      | CoveoSearchEndpointRequestContributor
      | undefined;
    if (!contributor) {
      throw new Error('Expected request contributor to be registered.');
    }

    expect(contributor()).toEqual({q: 'laptops'});
    expect(engine.read).toHaveBeenCalledTimes(1);
    expect(engine.read).toHaveBeenCalledWith(searchBoxSelectors.getQuery);
  });
});
