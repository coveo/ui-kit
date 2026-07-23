import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/internal/engine/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {
  InterfaceHandle,
  EndpointThunk,
} from '@/src/internal/utils/index.js';
import {createHydrateSubInterface} from './generative-hydration.js';
import {buildSearchInterface} from '@/src/public/interfaces/search.js';

const mockConverseSearchThunk = vi.fn() as unknown as EndpointThunk;
const mockConverseResolverFactory = vi.fn(
  () => (_engine: unknown) => (_scope: unknown) => mockConverseSearchThunk
);

const mockSuggestionsThunk = vi.fn() as unknown as EndpointThunk;
const mockSuggestionsFactory = vi.fn(
  (_engine: unknown) => (_scope: unknown) => mockSuggestionsThunk
);

vi.mock('@/src/internal/api/converse-search/index.js', () => ({
  createConverseSearchFacadeResolver: (...args: unknown[]) =>
    mockConverseResolverFactory(...args),
}));

vi.mock('@/src/internal/api/commerce-query-suggest/index.js', () => ({
  createCommerceSuggestionsFacadeResolver: (...args: unknown[]) =>
    mockSuggestionsFactory(...args),
}));

function createTestEngine() {
  return new Engine({
    configuration: {
      organizationId: 'test-org',
      accessToken: 'test-token',
      trackingId: 'test',
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
  });
}

describe('createHydrateSubInterface - resolver injection', () => {
  let fullEngine: FullEngine;
  let generativeInterface: InterfaceHandle;

  beforeEach(() => {
    vi.clearAllMocks();
    const engine = createTestEngine();
    fullEngine = getFullEngine(engine);
    generativeInterface = buildSearchInterface({
      engine,
      id: 'generative-iface',
    });
  });

  describe('commerceSearch routed interface', () => {
    it('uses the converse search facade resolver for the search facade', () => {
      const hydrate = createHydrateSubInterface(
        fullEngine,
        generativeInterface
      );
      const content = {products: [], pagination: {totalEntries: 0}, facets: []};

      const result = hydrate('commerce_search_api_response', content);

      expect(result).not.toBeNull();
      expect(result!.useCase).toBe('commerceSearch');

      const thunks = getInterfaceInternals(result!.interface).resolveFacades(
        'search'
      );
      expect(thunks).toHaveLength(1);
      expect(thunks[0]).toBe(mockConverseSearchThunk);
    });

    it('keeps the default suggestions facade resolver', () => {
      const hydrate = createHydrateSubInterface(
        fullEngine,
        generativeInterface
      );
      const content = {products: [], pagination: {totalEntries: 0}, facets: []};

      const result = hydrate('commerce_search_api_response', content);

      const thunks = getInterfaceInternals(result!.interface).resolveFacades(
        'suggestions'
      );
      expect(thunks).toHaveLength(1);
      expect(thunks[0]).toBe(mockSuggestionsThunk);
    });

    it('constructs the converse resolver with the generativeInterface handle', () => {
      const hydrate = createHydrateSubInterface(
        fullEngine,
        generativeInterface
      );
      const content = {products: [], pagination: {totalEntries: 0}, facets: []};

      hydrate('commerce_search_api_response', content);

      expect(mockConverseResolverFactory).toHaveBeenCalledWith(
        generativeInterface
      );
    });
  });

  describe('search routed interface', () => {
    it('is created with default resolvers (no converse resolver)', () => {
      const hydrate = createHydrateSubInterface(
        fullEngine,
        generativeInterface
      );
      const content = {
        results: [
          {
            uniqueId: 'r1',
            title: 'Result 1',
            uri: 'https://example.com/r1',
            printableUri: 'example.com/r1',
            clickUri: 'https://example.com/r1',
            raw: {},
            score: 90,
          },
        ],
        totalCount: 1,
        facets: [],
      };

      const result = hydrate('search_api_response', content);

      expect(result).not.toBeNull();
      expect(result!.useCase).toBe('search');

      const thunks = getInterfaceInternals(result!.interface).resolveFacades(
        'search'
      );
      expect(thunks).toHaveLength(1);
      expect(thunks[0]).not.toBe(mockConverseSearchThunk);
      expect(mockConverseResolverFactory).not.toHaveBeenCalled();
    });
  });
});
